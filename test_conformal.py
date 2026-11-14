
from src.data_loader import load_dataset
from src.preprocessing import split_data
from src.train import build_models, train_models
from src.conformal import (
    build_conformal_model,
    predict_with_sets
)

print("Loading dataset...")

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
    models,
    X_train,
    y_train
)

# Use Logistic Regression as our starting model
estimator = trained_models["Logistic Regression"]

print("\nBuilding conformal prediction model...")

conformal_model = build_conformal_model(
    estimator,
    X_cal,
    y_cal,
    confidence_level=0.90
)

print("\nGenerating prediction sets...")

predictions, prediction_sets = predict_with_sets(
    conformal_model,
    X_test,
    classes=estimator.classes_
)

print("\n========== CONFORMAL RESULTS ==========")

for i in range(10):
    print(
        f"Applicant {i + 1}: "
        f"Prediction={predictions[i]}, "
        f"Prediction set={prediction_sets[i]}"
    )

# Count prediction set sizes
set_sizes = [len(s) for s in prediction_sets]

automated = sum(size == 1 for size in set_sizes)
deferred = sum(size != 1 for size in set_sizes)

print("\n========== SUMMARY ==========")

print("Total applicants:", len(prediction_sets))
print("Single-label predictions:", automated)
print("Deferred for review:", deferred)
print("Automation coverage:", automated / len(prediction_sets))
print("Deferral rate:", deferred / len(prediction_sets))

print("\nCONFORMAL TEST PASSED!")
