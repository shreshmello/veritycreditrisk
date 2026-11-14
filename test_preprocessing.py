
from src.data_loader import load_dataset
from src.preprocessing import build_preprocessor, split_data

print("Loading dataset...")
X, y, audit_data = load_dataset()

print("\nSplitting dataset...")

(
    X_train,
    X_cal,
    X_test,
    y_train,
    y_cal,
    y_test,
    audit_test
) = split_data(X, y, audit_data)

print("\n========== SPLIT RESULTS ==========")
print("Training:", X_train.shape)
print("Calibration:", X_cal.shape)
print("Testing:", X_test.shape)

print("\n========== TARGET DISTRIBUTION ==========")
print("Training:\n", y_train.value_counts())
print("Calibration:\n", y_cal.value_counts())
print("Testing:\n", y_test.value_counts())

print("\n========== PREPROCESSING TEST ==========")

preprocessor = build_preprocessor(X_train)

X_train_processed = preprocessor.fit_transform(X_train)

print("Processed training shape:", X_train_processed.shape)
print("Preprocessing successful!")

print("\n========== FINAL CHECKS ==========")
print("Training records:", len(X_train))
print("Calibration records:", len(X_cal))
print("Testing records:", len(X_test))
print("Test audit records:", len(audit_test))

print("\nPREPROCESSING TEST PASSED!")
