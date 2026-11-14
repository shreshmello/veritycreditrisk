
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from src.preprocessing import build_preprocessor


def build_models(X_train):
    models = {
        "Logistic Regression": Pipeline([
            ("preprocessor", build_preprocessor(X_train)),
            ("classifier", LogisticRegression(
                max_iter=3000,
                random_state=42
            ))
        ]),

        "Random Forest": Pipeline([
            ("preprocessor", build_preprocessor(X_train)),
            ("classifier", RandomForestClassifier(
                n_estimators=300,
                min_samples_leaf=2,
                random_state=42
            ))
        ])
    }

    return models


def train_models(models, X_train, y_train):
    trained_models = {}

    for name, model in models.items():
        print(f"\nTraining {name}...")

        model.fit(X_train, y_train)

        trained_models[name] = model

        print(f"{name} trained successfully!")

    return trained_models
