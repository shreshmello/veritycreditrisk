
import numpy as np
import pandas as pd

from src.data_loader import load_dataset
from src.preprocessing import split_data
from src.train import build_models, train_models
from src.conformal import (
    build_conformal_model,
    predict_with_sets
)


def decision_cost(actual, predicted):
    false_approvals = sum(
        a == "bad" and p == "good"
        for a, p in zip(actual, predicted)
    )

    false_rejections = sum(
        a == "good" and p == "bad"
        for a, p in zip(actual, predicted)
    )

    return 5 * false_approvals + false_rejections


X, y, audit_data = load_dataset()

results = []

for seed in [42, 52, 62, 72, 82]:

    print(f"\n========== SEED {seed} ==========")

    (
        X_train, X_cal, X_test,
        y_train, y_cal, y_test, audit_test
    ) = split_data(
        X, y, audit_data,
        random_state=seed
    )

    models = build_models(X_train)

    trained_models = train_models(
        models, X_train, y_train
    )

    estimator = trained_models["Logistic Regression"]

    conformal_model = build_conformal_model(
        estimator,
        X_cal,
        y_cal,
        confidence_level=0.90
    )

    _, prediction_sets = predict_with_sets(
        conformal_model,
        X_test,
        estimator.classes_
    )

    automated_predictions = []
    automated_actual = []

    for i, prediction_set in enumerate(prediction_sets):
        if len(prediction_set) == 1:
            automated_predictions.append(prediction_set[0])
            automated_actual.append(y_test.iloc[i])

    total = len(y_test)
    automated = len(automated_predictions)
    deferred = total - automated

    set_coverage = np.mean([
        y_test.iloc[i] in prediction_sets[i]
        for i in range(total)
    ])

    automation_coverage = automated / total

    if automated:
        selective_risk = np.mean([
            a != p
            for a, p in zip(
                automated_actual,
                automated_predictions
            )
        ])

        conformal_cost = decision_cost(
            automated_actual,
            automated_predictions
        )
    else:
        selective_risk = np.nan
        conformal_cost = 0

    ordinary_predictions = estimator.predict(X_test)

    ordinary_cost = decision_cost(
        y_test.tolist(),
        ordinary_predictions.tolist()
    )

    results.append({
        "seed": seed,
        "set_coverage": set_coverage,
        "automation_coverage": automation_coverage,
        "selective_risk": selective_risk,
        "conformal_cost": conformal_cost,
        "ordinary_cost": ordinary_cost,
        "deferred_cases": deferred
    })

    print("Set coverage:", round(set_coverage, 3))
    print("Automation coverage:", round(automation_coverage, 3))
    print("Selective risk:", round(selective_risk, 3))
    print("Conformal cost:", conformal_cost)
    print("Ordinary cost:", ordinary_cost)

df = pd.DataFrame(results)

print("\n========== STABILITY RESULTS ==========")
print(df.to_string(index=False))

metrics = [
    "set_coverage",
    "automation_coverage",
    "selective_risk",
    "conformal_cost",
    "ordinary_cost"
]

print("\n========== MEAN AND STANDARD DEVIATION ==========")

summary = df[metrics].agg(["mean", "std"])

print(summary.to_string())

print("\nSTABILITY EXPERIMENT COMPLETE!")
