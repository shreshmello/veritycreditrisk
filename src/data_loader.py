
"""
Verity - Credit Risk Assessment
Dataset loading module.

Source: UCI South German Credit Dataset
"""

from ucimlrepo import fetch_ucirepo
import pandas as pd


def load_credit_data():
    """
    Download and load the South German Credit dataset.

    Returns:
        X: Feature dataframe
        y: Target series
    """

    print("Downloading South German Credit dataset...")

    dataset = fetch_ucirepo(id=522)

    X = dataset.data.features.copy()
    y = dataset.data.targets.copy()

    # Normalize target into a Series
    if isinstance(y, pd.DataFrame):
        y = y.iloc[:, 0]

    print("\nDataset successfully loaded!")
    print(f"Number of records: {len(X)}")
    print(f"Number of features: {X.shape[1]}")

    return X, y


def inspect_data(X, y):
    """Display a basic dataset overview."""

    print("\n--- FEATURE INFORMATION ---")
    print(X.info())

    print("\n--- MISSING VALUES ---")
    print(X.isnull().sum())

    print("\n--- TARGET DISTRIBUTION ---")
    print(y.value_counts(dropna=False))

    print("\n--- SAMPLE RECORDS ---")
    print(X.head())


if __name__ == "__main__":
    X, y = load_credit_data()
    inspect_data(X, y)
