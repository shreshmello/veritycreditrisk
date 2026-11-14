# Verity

### Uncertainty-Aware AI for Reliable Credit-Risk Assessment

Verity is an experimental machine-learning framework designed to improve the reliability of automated credit-risk classification.

Traditional credit-risk models produce predictions even when the available evidence is insufficient. Verity investigates whether conformal prediction can identify uncertain cases and defer them for human review rather than forcing potentially unreliable automated classifications.

## Research Question

Can conformal prediction reduce incorrect automated credit-risk classifications by deferring uncertain cases, while maintaining useful decision coverage and evaluating fairness across demographic groups?

## Core Features

- Credit-risk classification using machine-learning models
- Uncertainty estimation through conformal prediction
- Automated classification or human-review deferral
- Selective-risk and coverage evaluation
- Fairness analysis across demographic groups

## Technology Stack

- Python
- pandas and NumPy
- scikit-learn
- MAPIE
- Matplotlib and Seaborn

## Dataset

South German Credit Dataset from the UCI Machine Learning Repository.

The dataset contains historical credit records and is used exclusively for research and experimental evaluation.


## Disclaimer

Verity is an experimental research prototype. It is not a credit bureau, financial institution, or actual loan approval system. Its predictions should not be used to make real lending decisions.
