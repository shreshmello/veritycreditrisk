# Verity

### Uncertainty-Aware AI for Reliable Credit-Risk Assessment

Verity is an experimental machine-learning framework investigating whether uncertainty-aware predictions can improve the reliability of automated credit-risk classification.

Traditional classification systems are often forced to produce a single prediction, even when the available evidence is insufficient. Verity explores an alternative: using conformal prediction to generate prediction sets and defer uncertain cases for human review.

## Research Question

Can conformal prediction reduce incorrect automated credit-risk classifications by deferring uncertain cases, while maintaining useful decision coverage and evaluating fairness across demographic groups?

## How It Works

1. Historical credit records are used to train credit-risk classifiers.
2. A separate calibration dataset is used to calibrate prediction sets.
3. The system evaluates unseen records.
4. Cases with a single-label prediction set receive an automated model classification.
5. Cases with multiple possible labels or an empty set are deferred for human review.

## Models

- Logistic Regression
- Random Forest
- Split Conformal Classification using MAPIE

## Evaluation

- Accuracy, precision, recall, and F1
- False approval and false rejection costs
- Automated decision coverage
- Human-review deferral rate
- Selective classification error
- Age and personal-status subgroup analysis

## Dataset

South German Credit Dataset, UCI Machine Learning Repository.

The dataset contains 1,000 historical credit records from 1973–1975. Its age and historical context limit how well findings can generalize to modern lending.

Dataset: https://archive.ics.uci.edu/dataset/522/south+german+credit

## Technology

- Python
- pandas
- NumPy
- scikit-learn
- MAPIE
- Matplotlib
- Seaborn

## Project Status

Initial implementation in development. Experimental results will be added after execution and validation.

## Limitations

- The dataset is small and historically dated.
- Conformal coverage is marginal, not an individual-level guarantee.
- Subgroup analyses may be statistically unstable due to small sample sizes.
- The personal-status/sex attribute does not reliably identify sex.
- This prototype is not intended for real lending decisions.

## Disclaimer

Verity is an experimental research project, not a credit bureau or financial institution. Its predictions must not be used to approve or deny actual loans.
