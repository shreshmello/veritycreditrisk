
"""
VERITY
Uncertainty-Aware Credit-Risk Assessment

Run:
    python main.py
"""

from pathlib import Path

import pandas as pd

from src.data_loader import load_credit_data
from src.preprocessing import split_data
from src.train import build_models, train_models
from src.conformal import calibrate_model, predict_with_deferral
from src.evaluate import (
    evaluate_baseline,
    evaluate_selective,
    evaluate_fairness,
)


RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)


def main():

    print("=" * 60)
    print("VERITY: CREDIT-RISK EXPERIMENT")
    print("=" * 60)

    # 1. Load data
    X, y, audit = load_credit_data()

    # 2. Split data
    print("\nCreating stratified data splits...")

    splits = split_data(X, y, audit)

    X_train = splits["X_train"]
    X_cal = splits["X_calibration"]
    X_test = splits["X_test"]

    y_train = splits["y_train"]
    y_cal = splits["y_calibration"]
    y_test = splits["y_test"]

    audit_test = splits["audit_test"]

    print("Training records:", len(X_train))
    print("Calibration records:", len(X_cal))
    print("Testing records:", len(X_test))

    # 3. Build and train baseline models
    print("\nBuilding baseline models...")

    models = build_models(X_train)

    trained_models = train_models(
        models,
        X_train,
        y_train,
    )

    baseline_results = []
    conformal_results = []

    # 4. Evaluate each model
    for name, estimator in trained_models.items():

        print("\n" + "=" * 50)
        print(name)
        print("=" * 50)

        # Ordinary predictions
        baseline_predictions = estimator.predict(X_test)

        baseline_metrics = evaluate_baseline(
            y_test,
            baseline_predictions,
            name,
        )

        baseline_results.append(baseline_metrics)

        # 5. Conformal calibration
        print("\nCalibrating conformal predictor...")

        conformal_model = calibrate_model(
            estimator,
            X_cal,
            y_cal,
            confidence_level=0.90,
        )

        # 6. Generate prediction sets and deferrals
        predictions = predict_with_deferral(
            conformal_model,
            X_test,
        )

        selective_metrics = evaluate_selective(
            y_test,
            predictions,
        )

        selective_metrics["model"] = name
        conformal_results.append(selective_metrics)

        print("\nBaseline results:")
        print(baseline_metrics)

        print("\nConformal results:")
        print(selective_metrics)

        # 7. Fairness auditing
        for group_column in [
            "age_group",
            "personal_status_sex_code",
        ]:

            fairness = evaluate_fairness(
                y_test,
                predictions,
                audit_test,
                group_column,
            )

            if not fairness.empty:

                fairness.insert(
                    0,
                    "model",
                    name,
                )

                fairness.insert(
                    1,
                    "audit_attribute",
                    group_column,
                )

                fairness.to_csv(
                    RESULTS_DIR
                    / f"fairness_{name.lower().replace(' ', '_')}_{group_column}.csv",
                    index=False,
                )

                print(f"\nFairness results: {group_column}")
                print(fairness.to_string(index=False))

        # Save individual test predictions
        prediction_output = pd.DataFrame(predictions)

        prediction_output["actual"] = (
            y_test.reset_index(drop=True)
        )

        prediction_output.to_csv(
            RESULTS_DIR
            / f"predictions_{name.lower().replace(' ', '_')}.csv",
            index=False,
        )

    # 8. Save experiment summaries
    baseline_df = pd.DataFrame(baseline_results)
    conformal_df = pd.DataFrame(conformal_results)

    baseline_df.to_csv(
        RESULTS_DIR / "baseline_metrics.csv",
        index=False,
    )

    conformal_df.to_csv(
        RESULTS_DIR / "conformal_metrics.csv",
        index=False,
    )

    print("\n" + "=" * 60)
    print("EXPERIMENT COMPLETE")
    print("=" * 60)

    print("\nBASELINE COMPARISON")
    print(baseline_df.to_string(index=False))

    print("\nCONFORMAL COMPARISON")
    print(conformal_df.to_string(index=False))

    print("\nResults saved in:", RESULTS_DIR.resolve())


if __name__ == "__main__":
    main()
