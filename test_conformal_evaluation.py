
import numpy as np
import pandas as pd

from src.data_loader import load_dataset
from src.preprocessing import split_data
from src.train import build_models, train_models
from src.conformal import (
    build_conformal_model,
    predict_with_sets
)


def calculate_cost(actual, predicted):
    false_approvals = sum(
        (a == "bad" and p == "good")
        for a, p in zip(actual, predicted)
    )

    false_rejections = sum(
        (a == "good" and p == "bad")
        for a, p in zip(actual, predicted)
    )

    return 5 * false_approvals + false_rejections


print("Loading data...")

X, y, audit_data = load_dataset()

(
    X_train, X_cal, X_test,
    y_train, y_cal, y_test, audit_test
) = split_data(X, y, audit_data)

print("\nTraining Logistic Regression...")

models = build_models(X_train)
trained_models = train_models(models, X_train, y_train)

estimator = trained_models["Logistic Regression"]

print("\nCalibrating conformal predictor...")

conformal_model = build_conformal_model(
    estimator,
    X_cal,
    y_cal,
    confidence_level=0.90
)

print("\nGenerating prediction sets...")

_, prediction_sets = predict_with_sets(
    conformal_model,
    X_test,
    estimator.classes_
)

# Convert prediction sets into automated decisions or deferrals
automated_predictions = []
automated_actual = []
automated_indices = []

for i, prediction_set in enumerate(prediction_sets):
    if len(prediction_set) == 1:
        automated_predictions.append(prediction_set[0])
        automated_actual.append(y_test.iloc[i])
        automated_indices.append(i)

# 1. Prediction-set coverage
set_coverage = np.mean([
    y_test.iloc[i] in prediction_sets[i]
    for i in range(len(y_test))
])

# 2. Automation coverage
automation_coverage = (
    len(automated_indices) / len(y_test)
)

# 3. Selective risk
if automated_indices:
    selective_risk = np.mean([
        automated_predictions[j] != automated_actual[j]
        for j in range(len(automated_indices))
    ])
else:
    selective_risk = float("nan")

# 4. Decision cost
conformal_cost = calculate_cost(
    automated_actual,
    automated_predictions
)

baseline_predictions = estimator.predict(X_test)
baseline_cost = calculate_cost(
    y_test.tolist(),
    baseline_predictions.tolist()
)

print("\n========== CONFORMAL EVALUATION ==========")

print(f"Prediction-set coverage: {set_coverage:.3f}")
print(f"Automation coverage: {automation_coverage:.3f}")
print(f"Deferral rate: {1 - automation_coverage:.3f}")
print(f"Selective risk: {selective_risk:.3f}")
print(f"Conformal decision cost: {conformal_cost}")
print(f"Baseline decision cost: {baseline_cost}")

print("\n========== FAIRNESS AUDIT ==========")

audit = audit_test.reset_index(drop=True).copy()
audit["actual"] = y_test.reset_index(drop=True).values
audit["prediction_set"] = prediction_sets

audit["automated"] = audit["prediction_set"].apply(
    lambda s: len(s) == 1
)

audit["prediction"] = audit["prediction_set"].apply(
    lambda s: s[0] if len(s) == 1 else None
)

audit["covered"] = audit.apply(
    lambda row: row["actual"] in row["prediction_set"],
    axis=1
)

audit["correct_if_automated"] = audit.apply(
    lambda row: (
        row["prediction"] == row["actual"]
        if row["automated"] else None
    ),
    axis=1
)

audit["age_group"] = pd.cut(
    audit["age"],
    bins=[0, 25, 40, 60, 120],
    labels=["18-25", "26-40", "41-60", "61+"],
    include_lowest=True
)

def summarize_group(group, name):
    automated = group[group["automated"]]

    if len(automated):
        risk = (
            automated["correct_if_automated"]
            .eq(False)
            .mean()
        )
    else:
        risk = float("nan")

    return {
        "group": name,
        "n": len(group),
        "set_coverage": group["covered"].mean(),
        "automation_coverage": group["automated"].mean(),
        "selective_risk": risk
    }


age_results = []

for group_name, group in audit.groupby(
    "age_group", observed=True
):
    age_results.append(
        summarize_group(group, group_name)
    )

print("\nBY AGE GROUP")
print(pd.DataFrame(age_results).to_string(index=False))

status_results = []

for group_name, group in audit.groupby(
    "personal_status_sex_code"
):
    status_results.append(
        summarize_group(group, group_name)
    )

print("\nBY PERSONAL STATUS/SEX CODE")
print(pd.DataFrame(status_results).to_string(index=False))

print("\nEVALUATION COMPLETE!")
