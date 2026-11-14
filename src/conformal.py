
"""
Verity: Conformal prediction and deferral.
"""

import numpy as np

from mapie.classification import SplitConformalClassifier


def calibrate_model(
    estimator,
    X_calibration,
    y_calibration,
    confidence_level=0.90,
):
    """Calibrate a previously trained classifier."""

    conformal_model = SplitConformalClassifier(
        estimator=estimator,
        confidence_level=confidence_level,
        conformity_score="lac",
        prefit=True,
    )

    conformal_model.conformalize(
        X_calibration,
        y_calibration,
    )

    return conformal_model


def predict_with_deferral(conformal_model, X_test):
    """
    Generate prediction sets and convert them into
    automated classifications or human-review deferrals.

    One-label set: automated classification.
    Two-label or empty set: defer.
    """

    predicted_labels, prediction_sets = (
        conformal_model.predict_set(X_test)
    )

    classes = conformal_model.estimator.classes_

    results = []

    # MAPIE prediction sets have shape:
    # (samples, classes, confidence_levels)
    for i, predicted_label in enumerate(predicted_labels):

        included_classes = [
            str(classes[j])
            for j in range(len(classes))
            if bool(prediction_sets[i, j, 0])
        ]

        if len(included_classes) == 1:
            decision = included_classes[0]
            action = "AUTOMATED_CLASSIFICATION"

        else:
            decision = "uncertain"
            action = "DEFER_FOR_HUMAN_REVIEW"

        results.append({
            "predicted_label": str(predicted_label),
            "prediction_set": included_classes,
            "decision": decision,
            "action": action,
        })

    return results

