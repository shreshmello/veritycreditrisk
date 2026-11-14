
from src.data_loader import load_dataset
from src.preprocessing import split_data
from src.train import build_models, train_models

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

print("\nBuilding models...")

models = build_models(X_train)

print("\nTraining models...")

trained_models = train_models(
    models,
    X_train,
    y_train
)

print("\n========== TRAINING RESULTS ==========")

for name, model in trained_models.items():
    predictions = model.predict(X_test)

    print(f"\n{name}")
    print("Predictions:", len(predictions))
    print("First 10 predictions:", predictions[:10])

print("\nBOTH MODELS TRAINED SUCCESSFULLY!")
