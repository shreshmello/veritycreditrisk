
"""
Verity: Baseline model training.
"""

from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from src.preprocessing import build_preprocessor


def build_models(X_train):
    """Create the baseline classification models."""

    models = {
        "Logistic Regression": LogisticRegression(
            max_iter=2000,
            class_weight=None,
            random_state=42,
        ),

        "Random Forest": RandomForestClassifier(
            n_estimators=300,
            max_depth=None,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
        ),
    }

    pipelines = {}

    for name, model in models.items():
        pipelines[name] = Pipeline([
            ("preprocessing", build_preprocessor(X_train)),
            ("classifier", model),
        ])

    return pipelines


def train_models(models, X_train, y_train):
    """Fit every baseline model on training data only."""

    trained = {}

    for name, pipeline in models.items():
        print(f"Training {name}...")

        pipeline.fit(X_train, y_train)

        trained[name] = pipeline

        print(f"{name} trained.")

    return trained

