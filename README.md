# Verity

### Uncertainty-Aware AI for More Reliable Credit-Risk Assessment

Verity is an experimental financial decision-support platform and machine-learning research project exploring how uncertainty-aware AI can make credit-risk classification more reliable.

Traditional machine-learning classifiers are often expected to produce a single prediction, even when the available evidence is uncertain. Verity investigates an alternative approach: using **conformal prediction** to generate prediction sets and defer uncertain classifications for human review.

Alongside this research, Verity provides a user-facing application that helps individuals understand loan costs and helps small businesses evaluate payment arrangements through transparent financial information and guided assessments.

---

## Research Question

Can conformal prediction reduce incorrect automated credit-risk classifications by deferring uncertain cases, while maintaining useful decision coverage and evaluating fairness across demographic subgroups?

## How the Research Framework Works

1. Historical credit records are used to train credit-risk classifiers.
2. The dataset is separated into training, calibration, and test sets.
3. A separate calibration dataset is used to calibrate prediction sets.
4. The calibrated models evaluate previously unseen records.
5. Cases with a single-label prediction set receive a model classification.
6. Cases with multiple possible labels or an empty prediction set are deferred for human review.

This approach allows the system to examine not only what a model predicts, but also when it should avoid making an automated classification.

## Machine Learning Models

Verity's research framework uses:

- **Logistic Regression:** A baseline classification model.
- **Random Forest:** An ensemble model used for comparison.
- **Split Conformal Classification:** A method for producing prediction sets and evaluating uncertainty.
- **MAPIE:** The Python library used to implement conformal prediction.

## Evaluation

The research evaluates model performance and the trade-offs between automated decisions and human review.

Metrics include:

- Accuracy, precision, recall, and F1-score
- Balanced accuracy
- False approval and false rejection costs
- Automated decision coverage
- Human-review deferral rate
- Selective classification error
- Performance across multiple random seeds
- Results at different confidence levels
- Review-cost sensitivity analysis
- Age and personal-status subgroup analysis

## Experimental Results

Initial experiments were conducted using the South German Credit dataset.

At a 90% conformal confidence level, one experimental run produced:

| Metric | Result |
|---|---:|
| Observed test coverage | 91.0% |
| Automated decision rate | 66.0% |
| Human-review deferral rate | 34.0% |
| Selective classification error | 13.6% |

### Results Across Five Random Seeds

To examine how results varied across different data splits, the experiment was repeated using five random seeds.

| Metric | Five-seed average |
|---|---:|
| Observed coverage | 91.2% |
| Automated decision rate | 58.1% |
| Selective classification error | 15.1% |

These results are preliminary and specific to the dataset and experimental setup. They do not establish that the approach will perform similarly on modern lending data.

## The Verity Application

The research framework and user-facing application are related, but they serve different purposes.

### Personal Financial Assessment

The personal assessment helps users understand the potential financial impact of a loan.

Features include:

- Guided loan information entry
- Estimated monthly payments
- Total repayment and interest calculations
- Monthly budget impact estimates
- Explanations of financial results
- Scenario exploration to compare different loan amounts, interest rates, and repayment periods
- Saved assessments and decision history

The application provides financial estimates and educational decision support. It does not determine loan eligibility or guarantee approval.

### Small-Business Assessment

The business assessment helps small businesses think through customer payment arrangements.

Features include:

- Transaction amount and type
- Upfront deposit tracking
- Outstanding payment calculations
- Payment deadlines
- Customer relationship and payment-history context
- A guided review checklist
- Saved assessments and decision history

The business assessment does not predict whether an individual customer will pay or generate a credit-risk score.

### Application Architecture

The platform uses:

- React and TypeScript for the frontend
- FastAPI for the backend API
- Supabase for authentication and data storage
- Python and scikit-learn for the research framework

The research dashboard is separate from the user-facing financial assessment application.

## Dataset

**South German Credit Dataset — UCI Machine Learning Repository**

The dataset contains 1,000 historical credit records originally collected in Germany during the 1970s.

- 1,000 observations
- 20 original predictor variables
- A binary credit-risk target
- Historical demographic and financial attributes

The dataset is useful for experimentation, but its small size and historical context limit its ability to represent modern lending conditions.

Dataset: https://archive.ics.uci.edu/dataset/522/south+german+credit

## Technology Stack

**Research and Machine Learning**
- Python
- pandas
- NumPy
- scikit-learn
- MAPIE
- Matplotlib
- Seaborn

**Application**
- React
- TypeScript
- Vite
- FastAPI
- Supabase
- CSS

## Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/shreshmello/veritycreditrisk.git
cd veritycreditrisk
```

### 2. Set up the Python environment

```bash
python -m venv .venv
```

Activate the environment:

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Run the research dashboard

From the project root:

```bash
python -m streamlit run app.py
```

The research dashboard will be available at:

`http://localhost:8501`

### 4. Run the backend API

From the project root, in a separate terminal:

```bash
python -m uvicorn api:app --reload
```

The API will be available at:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 5. Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local frontend address in the terminal.

**Configuration:** The frontend requires Supabase environment variables for authentication and data storage. Create a local `frontend/.env.local` file with the required project URL and publishable key. Do not commit environment files or secret keys to GitHub.

## Limitations

- The dataset is small and historically dated.
- Conformal coverage is a marginal statistical property under appropriate assumptions, not an individual-level guarantee.
- Subgroup analyses may be statistically unstable because some groups contain very few observations.
- The historical personal-status attribute does not reliably identify sex.
- Results on this dataset may not generalize to modern lending populations.
- Human review introduces additional costs and operational considerations.
- The user-facing application does not currently use the research framework's conformal predictions to make personal or business lending decisions.

## Project Status

The initial research implementation and experimental evaluations have been completed.

Current work focuses on improving the application, examining model stability, evaluating fairness limitations, and documenting the relationship between uncertainty-aware classification and practical financial decision support.

Further testing with larger, more representative datasets would be necessary before drawing broader conclusions.

## Disclaimer

Verity is an experimental research and financial decision-support project. It is not a credit bureau, lender, or financial institution.

The research models and application are not intended to approve or deny actual loans, determine an individual's creditworthiness, or replace professional financial advice. Experimental predictions should not be used to make real lending decisions.
