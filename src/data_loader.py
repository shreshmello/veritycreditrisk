
import io
import urllib.request
import zipfile
import pandas as pd

DATA_URL = (
    "https://archive.ics.uci.edu/static/public/522/"
    "south%2Bgerman%2Bcredit.zip"
)


def load_dataset():
    print("Downloading South German Credit dataset...")

    response = urllib.request.urlopen(DATA_URL)

    with zipfile.ZipFile(io.BytesIO(response.read())) as archive:
        with archive.open("SouthGermanCredit.asc") as file:
            df = pd.read_csv(
                file,
                sep=r"\s+",
                engine="python"
            )

    # Validate the downloaded dataset
    required_columns = {
        "kredit", "alter", "famges", "laufzeit", "hoehe"
    }

    if not required_columns.issubset(df.columns):
        raise ValueError("Dataset is missing required columns.")

    if set(df["kredit"].unique()) != {0, 1}:
        raise ValueError("Unexpected target encoding.")

    # Target: 1 = good, 0 = bad
    y = df["kredit"].map({
        1: "good",
        0: "bad"
    })

    # Keep demographic information separately for fairness auditing
    audit_data = pd.DataFrame({
        "age": df["alter"],
        "personal_status_sex_code": df["famges"]
    })

    # Exclude target and protected attributes from model inputs
    X = df.drop(
        columns=["kredit", "alter", "famges"]
    ).copy()

    # These are category codes, not continuous measurements
    categorical_columns = [
        col for col in X.columns
        if col not in ["laufzeit", "hoehe"]
    ]

    for col in categorical_columns:
        X[col] = X[col].astype(str)

    print("Dataset loaded successfully!")
    print("Features:", X.shape)
    print("Target distribution:")
    print(y.value_counts())

    return X, y, audit_data
