
"""
Verity: Model evaluation.
"""

import numpy as np
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)


def evaluate_baseline(y_true, predictions, model_name):
    """Evaluate a model that classifies every test record."""

    y_true = np.asarray(y_true)
    predictions = np.asarray(predictions)

    tn, fp, fn, tp = confusion_matrix(
        y_true,
        predictions,
        labels=["good", "bad"],
    ).ravel()

    # UCI cost matrix:
    # Bad-risk applicant classified as good: cost 5.
    # Good-risk applicant classified as bad: cost 1.
    total_cost = (5 * fn) + fp

    return {
        "model": model_name,
        "accuracy": accuracy_score(y_true, predictions),
        "bad_precision": precision_score(
            y_true, predictions,
            pos_label="bad",
            zero_division=0,
        ),
        "bad_recall": recall_score(
            y_true, predictions,
            pos_label="bad",
            zero_division=0,
        ),
        "bad_f1": f1_score(
            y_true, predictions,
            pos_label="bad",
            zero_division=0,
        ),
        "false_approvals": int(fn),
        "false_rejections": int(fp),
        "total_cost": int(total_cost),
        "average_cost": float(total_cost / len(y_true)),
    }


def evaluate_selective(y_true, conformal_results):
    """Evaluate only cases receiving automated classifications."""

    y_true = np.asarray(y_true)

    automated_indices = [
        i for i, result in enumerate(conformal_results)
        if result["action"] == "AUTOMATED_CLASSIFICATION"
    ]

    total = len(y_true)
    automated = len(automated_indices)
    deferred = total - automated

    if automated == 0:
        return {
            "total_records": total,
            "automated_records": 0,
            "deferred_records": deferred,
            "coverage": 0.0,
            "defer_rate": 1.0,
            "selective_risk": None,
            "average_cost_per_test_record": None,
        }

    actual = y_true[automated_indices]

    predicted = np.array([
        conformal_results[i]["decision"]
        for i in automated_indices
    ])

    errors = actual != predicted

    false_approvals = np.sum(
        (actual == "bad") & (predicted == "good")
    )

    false_rejections = np.sum(
        (actual == "good") & (predicted == "bad")
    )

    total_cost = (
        5 * false_approvals
        + false_rejections
    )

    return {
        "total_records": total,
        "automated_records": automated,
        "deferred_records": deferred,
        "coverage": automated / total,
        "defer_rate": deferred / total,
        "selective_risk": float(np.mean(errors)),
        "average_cost_per_test_record": float(
            total_cost / total
        ),
    }


def evaluate_fairness(
    y_true,
    conformal_results,
    audit_data,
    group_column,
    min_group_size=10,
):
    """
    Compare error and deferral rates across audit groups.

    Small groups are omitted from the summary and should
    be disclosed rather than interpreted as evidence of fairness.
    """

    frame = audit_data.reset_index(drop=True).copy()

    frame["actual"] = np.asarray(y_true)

    frame["decision"] = [
        result["decision"]
        for result in conformal_results
    ]

    frame["automated"] = [
        result["action"] == "AUTOMATED_CLASSIFICATION"
        for result in conformal_results
    ]

    frame["deferred"] = ~frame["automated"]

    frame["error"] = (
        frame["automated"]
        & (frame["decision"] != frame["actual"])
    )

    rows = []

    if group_column not in frame.columns:
        return pd.DataFrame()

    for group, subset in frame.groupby(
        group_column,
        observed=True,
        dropna=False,
    ):
        n = len(subset)

        if n < min_group_size:
            continue

        bad_cases = subset[subset["actual"] == "bad"]
        good_cases = subset[subset["actual"] == "good"]

        # False negative rate among all bad-risk records.
        false_approval_rate = (
            (
                bad_cases["automated"]
                & (bad_cases["decision"] == "good")
            ).sum() / len(bad_cases)
            if len(bad_cases) else np.nan
        )

        # False positive rate among all good-risk records.
        false_rejection_rate = (
            (
                good_cases["automated"]
                & (good_cases["decision"] == "bad")
            ).sum() / len(good_cases)
            if len(good_cases) else np.nan
        )

        rows.append({
            "group": str(group),
            "sample_size": n,
            "coverage": subset["automated"].mean(),
            "defer_rate": subset["deferred"].mean(),
            "selective_error_rate": (
                subset.loc[
                    subset["automated"], "error"
                ].mean()
                if subset["automated"].any()
                else np.nan
            ),
            "false_approval_rate": false_approval_rate,
            "false_rejection_rate": false_rejection_rate,
        })

    return pd.DataFrame(rows)

