
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
        a == "bad" and p == "good"
        for a, p in zip(actual, predicted)
    )

    false_rejections = sum(
        a == "good" and p == "bad"
        for a, p in zip(actual, predicted)
    )

    return 5 * false_approvals + false_rejections


print("Loading dataset...")

X, y, audit_data = load_dataset()

(
    X_train, X_cal, X_test,
    y_train, y_cal, y_test, audit_test
) = split_data(X, y, audit_data)

print("\nTraining Logistic Regression...")

models = build_models(X_train)
trained_models = train_models(
    models, X_train, y_train
)

estimator = trained_models["Logistic Regression"]

# Ordinary model: predicts every test case
ordinary_predictions = estimator.predict(X_test)

ordinary_cost = calculate_cost(
    y_test.tolist(),
    ordinary_predictions.tolist()
)

print("\nOrdinary Logistic Regression cost:", ordinary_cost)

confidence_levels = [0.80, 0.90, 0.95]

results = []

for confidence in confidence_levels:

    print(f"\nTesting confidence level: {confidence:.0%}")

    conformal_model = build_conformal_model(
        estimator,
        X_cal,
        y_cal,
        confidence_level=confidence
    )

    _, prediction_sets = predict_with_sets(
        conformal_model,
        X_test,
        estimator.classes_
    )

    automated_predictions = []
    automated_actual = []

    deferred = 0

    for i, prediction_set in enumerate(prediction_sets):

        if len(prediction_set) == 1:
            automated_predictions.append(prediction_set[0])
            automated_actual.append(y_test.iloc[i])
        else:
            deferred += 1

    total = len(y_test)
    automated = len(automated_predictions)

    coverage = automated / total
    deferral_rate = deferred / total

    set_coverage = sum(
        y_test.iloc[i] in prediction_sets[i]
        for i in range(total)
    ) / total

    if automated:
        selective_risk = sum(
            actual != predicted
            for actual, predicted in zip(
                automated_actual,
                automated_predictions
            )
        ) / automated

        automated_cost = calculate_cost(
            automated_actual,
            automated_predictions
        )
    else:
        selective_risk = float("nan")
        automated_cost = 0

    results.append({
        "confidence": confidence,
        "set_coverage": set_coverage,
        "automation_coverage": coverage,
        "deferral_rate": deferral_rate,
        "selective_risk": selective_risk,
        "automated_cost": automated_cost,
        "deferred_cases": deferred
    })

print("\n========== CONFIDENCE COMPARISON ==========")

results_df = pd.DataFrame(results)

print(results_df.to_string(index=False))

print("\n========== REVIEW COST SENSITIVITY ==========")

review_costs = [0.5, 1, 2, 5]

for review_cost in review_costs:

    print(f"\nAssumed review cost per case: {review_cost}")

    for result in results:
        total_cost = (
            result["automated_cost"]
            + result["deferred_cases"] * review_cost
        )

        print(
            f"{result['confidence']:.0%} confidence: "
            f"estimated total cost = {total_cost:.2f}"
        )

print("\nOrdinary Logistic Regression cost:", ordinary_cost)

print("\nCONFIDENCE EXPERIMENT COMPLETE!")
