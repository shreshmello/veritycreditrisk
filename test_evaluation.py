
from src.data_loader import load_dataset
from src.preprocessing import split_data
from src.train import build_models, train_models
from src.evaluate import (
    evaluate_model,
    evaluate_majority_baseline
)

print("Loading data...")

X, y, audit_data = load_dataset()

(
    X_train,
    X_cal,
    X_test,
    y_train,
    y_cal,
    y_test,
    audit_test
) = split_data(X, y, audit_data)

print("\nTraining models...")

models = build_models(X_train)
trained_models = train_models(
    models, X_train, y_train
)

print("\nEvaluating majority baseline...")

results = []
results.append(
    evaluate_majority_baseline(y_test)
)

print("\nEvaluating trained models...")

for name, model in trained_models.items():
    predictions = model.predict(X_test)

    result = evaluate_model(
        name,
        y_test,
        predictions
    )

    results.append(result)

print("\n========== FINAL COMPARISON ==========")

for result in results:
    print(
        result["model"],
        "| Accuracy:", round(result["accuracy"], 3),
        "| Bad F1:", round(result["bad_f1"], 3),
        "| Cost:", result["total_cost"]
    )

print("\nEVALUATION COMPLETE!")
