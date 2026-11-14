
from src.data_loader import load_dataset

X, y, audit_data = load_dataset()

print("\n========== LOADER TEST ==========")

print("Feature shape:", X.shape)
print("Target shape:", y.shape)
print("Audit shape:", audit_data.shape)

print("\nTarget distribution:")
print(y.value_counts())

print("\nFeature columns:")
print(X.columns.tolist())

print("\nFeature data types:")
print(X.dtypes)

print("\nAudit data:")
print(audit_data.head())

print("\nLOADER TEST PASSED!")
