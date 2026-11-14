
import numpy as np
from mapie.classification import SplitConformalClassifier


def build_conformal_model(
    trained_estimator,
    X_cal,
    y_cal,
    confidence_level=0.90
):
    conformal_model = SplitConformalClassifier(
        estimator=trained_estimator,
        confidence_level=confidence_level,
        conformity_score="lac",
        prefit=True
    )

    conformal_model.conformalize(X_cal, y_cal)

    return conformal_model


def predict_with_sets(conformal_model, X, classes):
    predicted_labels, prediction_sets = (
        conformal_model.predict_set(X)
    )

    # MAPIE returns shape:
    # (samples, classes, confidence_levels)
    prediction_sets = np.asarray(prediction_sets)

    prediction_sets = prediction_sets[:, :, 0]

    readable_sets = []

    for row in prediction_sets:
        selected_classes = np.asarray(classes)[
            row.astype(bool)
        ]

        readable_sets.append(selected_classes.tolist())

    return predicted_labels, readable_sets
