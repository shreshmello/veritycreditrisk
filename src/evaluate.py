
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    balanced_accuracy_score
)


def evaluate_model(name, y_true, predictions):

    matrix = confusion_matrix(
        y_true,
        predictions,
        labels=["good", "bad"]
    )

    good_correct = matrix[0, 0]
    false_rejections = matrix[0, 1]
    false_approvals = matrix[1, 0]
    bad_correct = matrix[1, 1]

    # UCI credit cost matrix:
    # False approval of bad credit = 5
    # False rejection of good credit = 1
    total_cost = (
        5 * false_approvals
        + 1 * false_rejections
    )

    results = {
        "model": name,
        "accuracy": accuracy_score(y_true, predictions),
        "balanced_accuracy": balanced_accuracy_score(
            y_true, predictions
        ),
        "bad_precision": precision_score(
            y_true, predictions,
            pos_label="bad",
            zero_division=0
        ),
        "bad_recall": recall_score(
            y_true, predictions,
            pos_label="bad",
            zero_division=0
        ),
        "bad_f1": f1_score(
            y_true, predictions,
            pos_label="bad",
            zero_division=0
        ),
        "false_approvals": int(false_approvals),
        "false_rejections": int(false_rejections),
        "total_cost": int(total_cost),
        "cost_per_applicant": total_cost / len(y_true)
    }

    print(f"\n========== {name} ==========")

    for metric, value in results.items():
        if metric != "model":
            print(f"{metric}: {value:.4f}")

    print("\nConfusion matrix:")
    print(matrix)

    print("\nRows = actual, columns = predicted")
    print("Order: good, bad")

    return results


def evaluate_majority_baseline(y_true):

    predictions = ["good"] * len(y_true)

    return evaluate_model(
        "Majority Class Baseline",
        y_true,
        predictions
    )
