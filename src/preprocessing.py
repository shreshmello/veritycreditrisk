
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split


NUMERIC_FEATURES = ["laufzeit", "hoehe"]


def build_preprocessor(X):
    numeric_features = [
        col for col in NUMERIC_FEATURES if col in X.columns
    ]

    categorical_features = [
        col for col in X.columns
        if col not in numeric_features
    ]

    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore"))
    ])

    preprocessor = ColumnTransformer([
        ("numeric", numeric_pipeline, numeric_features),
        ("categorical", categorical_pipeline, categorical_features)
    ])

    return preprocessor


def split_data(X, y, audit_data, random_state=42):

    # First: reserve 20% for final testing
    train_cal_idx, test_idx = train_test_split(
        X.index,
        test_size=0.20,
        random_state=random_state,
        stratify=y
    )

    # Second: divide remaining 80% into 60% training and 20% calibration
    train_idx, cal_idx = train_test_split(
        train_cal_idx,
        test_size=0.25,
        random_state=random_state,
        stratify=y.loc[train_cal_idx]
    )

    X_train = X.loc[train_idx]
    X_cal = X.loc[cal_idx]
    X_test = X.loc[test_idx]

    y_train = y.loc[train_idx]
    y_cal = y.loc[cal_idx]
    y_test = y.loc[test_idx]

    audit_test = audit_data.loc[test_idx]

    return (
        X_train,
        X_cal,
        X_test,
        y_train,
        y_cal,
        y_test,
        audit_test
    )
