
"""
Verity: Data preprocessing and splitting.
"""

import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split


# These are genuinely quantitative measurements.
# Other coded attributes are treated as categorical.
NUMERIC_CANDIDATES = {
    "duration",
    "amount",
    "laufzeit",
    "hoehe",
}


def build_preprocessor(X):
    """Build preprocessing without fitting on test data."""

    numeric_columns = [
        col for col in X.columns
        if str(col).lower() in NUMERIC_CANDIDATES
    ]

    categorical_columns = [
        col for col in X.columns
        if col not in numeric_columns
    ]

    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore")),
    ])

    transformers = []

    if numeric_columns:
        transformers.append(
            ("numeric", numeric_pipeline, numeric_columns)
        )

    if categorical_columns:
        transformers.append(
            ("categorical", categorical_pipeline, categorical_columns)
        )

    return ColumnTransformer(transformers=transformers)


def split_data(X, y, audit, random_state=42):
    """
    Stratified 60/20/20 split.

    Training: 60%
    Calibration: 20%
    Test: 20%
    """

    indices = np.arange(len(y))

    train_indices, remaining_indices = train_test_split(
        indices,
        test_size=0.40,
        random_state=random_state,
        stratify=y,
    )

    calibration_indices, test_indices = train_test_split(
        remaining_indices,
        test_size=0.50,
        random_state=random_state,
        stratify=y.iloc[remaining_indices],
    )

    def select(data, idx):
        return data.iloc[idx].reset_index(drop=True)

    return {
        "X_train": select(X, train_indices),
        "X_calibration": select(X, calibration_indices),
        "X_test": select(X, test_indices),

        "y_train": select(y, train_indices),
        "y_calibration": select(y, calibration_indices),
        "y_test": select(y, test_indices),

        "audit_test": select(audit, test_indices),
    }

