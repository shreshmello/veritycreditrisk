
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Verity API",
    description="Financial decision-support API",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PersonalLoanRequest(BaseModel):
    loan_amount: float = Field(gt=0)
    apr_percent: float = Field(ge=0, le=100)
    term_months: int = Field(ge=1, le=360)
    monthly_income: float = Field(ge=0)
    monthly_expenses: float = Field(ge=0)
    existing_debt_payments: float = Field(ge=0)


@app.get("/")
def home():
    return {
        "message": "Verity API is running",
        "status": "online",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


def create_assessment(
    income,
    expenses,
    existing_debt,
    monthly_payment,
    remaining_before,
    remaining_after,
):
    observations = []
    next_steps = []

    # Case 1: No income was entered.
    if income == 0:
        status = "more_information_needed"
        label = "More information needed"

        summary = (
            "No monthly income was entered, so Verity cannot "
            "fully evaluate the budget using the information provided."
        )

        observations.append(
            "The monthly income entered is $0."
        )

        observations.append(
            f"The proposed loan payment is ${monthly_payment:,.2f} per month."
        )

        observations.append(
            f"The estimated monthly amount remaining is "
            f"${remaining_after:,.2f}."
        )

        next_steps.extend([
            "Check whether the income information is complete.",
            "If income varies, consider using a representative monthly estimate.",
            "Explore how different loan amounts and repayment periods change the payment.",
        ])

    # Case 2: The existing budget is already negative.
    elif remaining_before < 0:
        status = "needs_review"
        label = "Needs review"

        summary = (
            "Your entered monthly expenses and existing debt "
            "payments already exceed your entered income, even "
            "before adding this proposed loan."
        )

        observations.append(
            f"Your estimated monthly budget is already "
            f"${abs(remaining_before):,.2f} below zero before "
            "the proposed loan."
        )

        observations.append(
            f"The proposed loan adds another "
            f"${monthly_payment:,.2f} in monthly payments."
        )

        observations.append(
            f"After including the proposed loan, your estimated "
            f"monthly shortfall becomes ${abs(remaining_after):,.2f}."
        )

        next_steps.extend([
            "Review the income, expense, and existing debt figures you entered.",
            "Explore a smaller borrowing amount to see how the payment changes.",
            "Compare other loan offers, including their APRs and fees.",
            "Consider getting independent financial guidance before making a borrowing decision.",
        ])

    # Case 3: The proposed loan makes the budget negative.
    elif remaining_after < 0:
        status = "needs_review"
        label = "Needs review"

        summary = (
            "Your entered budget has a positive remainder before "
            "the proposed loan, but becomes negative after adding "
            "the estimated loan payment."
        )

        observations.append(
            f"Your estimated monthly amount remaining before "
            f"the loan is ${remaining_before:,.2f}."
        )

        observations.append(
            f"The proposed payment is ${monthly_payment:,.2f} per month."
        )

        observations.append(
            f"After including the payment, the estimated monthly "
            f"shortfall is ${abs(remaining_after):,.2f}."
        )

        next_steps.extend([
            "Explore a smaller borrowing amount.",
            "Compare different repayment periods and their total interest costs.",
            "Compare offers with different APRs and fees.",
            "Review whether any income or expense information is missing.",
        ])

    # Case 4: No money remains after the proposed loan.
    elif remaining_after == 0:
        status = "needs_review"
        label = "No monthly buffer"

        summary = (
            "Your entered income would be fully allocated to "
            "living expenses, existing debt payments, and the "
            "proposed loan payment."
        )

        observations.append(
            "Your estimated monthly amount remaining is $0."
        )

        observations.append(
            "The budget does not show an amount left over for "
            "unexpected expenses or other unlisted costs."
        )

        next_steps.extend([
            "Review whether all recurring expenses have been included.",
            "Explore a smaller borrowing amount.",
            "Compare different loan offers and repayment periods.",
            "Consider how unexpected expenses could affect the budget.",
        ])

    # Case 5: A positive remainder is shown.
    else:
        status = "no_immediate_budget_concern"
        label = "No immediate budget concern identified"

        summary = (
            "Based on the numbers entered, your estimated monthly "
            "income exceeds your listed expenses, existing debt "
            "payments, and proposed loan payment."
        )

        observations.append(
            f"Your estimated monthly amount remaining after "
            f"the proposed loan is ${remaining_after:,.2f}."
        )

        observations.append(
            f"The proposed loan payment uses "
            f"{monthly_payment / income * 100:.2f}% of your "
            "entered monthly income."
        )

        next_steps.extend([
            "Check whether your expense estimates include all recurring costs.",
            "Explore alternative loan amounts and repayment periods.",
            "Compare total interest and fees across other offers.",
            "Consider whether you would still have enough flexibility for unexpected expenses.",
        ])

    return {
        "status": status,
        "label": label,
        "summary": summary,
        "observations": observations,
        "next_steps": next_steps,
        "explanation": (
            "This assessment uses the income, expenses, debt "
            "payments, and loan details you provided. It does not "
            "account for every possible financial circumstance."
        ),
    }


@app.post("/api/personal/analyze")
def analyze_personal_loan(request: PersonalLoanRequest):
    principal = request.loan_amount
    monthly_rate = request.apr_percent / 100 / 12
    months = request.term_months

    # Calculate monthly loan payment.
    if monthly_rate == 0:
        monthly_payment = principal / months
    else:
        monthly_payment = (
            principal * monthly_rate
            / (1 - (1 + monthly_rate) ** -months)
        )

    total_repayment = monthly_payment * months
    total_interest = total_repayment - principal

    # Calculate monthly budget.
    remaining_before_loan = (
        request.monthly_income
        - request.monthly_expenses
        - request.existing_debt_payments
    )

    remaining_after_loan = remaining_before_loan - monthly_payment

    # Generate decision-support assessment.
    assessment = create_assessment(
        income=request.monthly_income,
        expenses=request.monthly_expenses,
        existing_debt=request.existing_debt_payments,
        monthly_payment=monthly_payment,
        remaining_before=remaining_before_loan,
        remaining_after=remaining_after_loan,
    )

    return {
        "monthly_payment": round(monthly_payment, 2),
        "total_repayment": round(total_repayment, 2),
        "total_interest": round(total_interest, 2),
        "remaining_before_loan": round(remaining_before_loan, 2),
        "remaining_after_loan": round(remaining_after_loan, 2),

        "payment_as_percent_of_income": (
            round(monthly_payment / request.monthly_income * 100, 2)
            if request.monthly_income > 0
            else None
        ),

        "cash_flow_status": (
            "positive" if remaining_after_loan >= 0 else "negative"
        ),

        "assessment": assessment,

        "notice": (
            "This is an estimate based on the information provided, "
            "not a loan approval, financial recommendation, or prediction."
        ),
    }

@app.get("/api/research/summary")
def research_summary():
    return {
        "project": "Verity",
        "title": "Research & Methodology",
        "description": (
            "An experimental study of uncertainty-aware credit "
            "classification using a historical credit dataset."
        ),

        "dataset": {
            "name": "South German Credit",
            "source": "UCI Machine Learning Repository",
            "dataset_id": 522,
            "records": 1000,
            "features_used": 18,
            "good_credit_records": 700,
            "bad_credit_records": 300,
            "limitations": [
                "This is a historical dataset, not a representation "
                "of today's entire lending population.",
                "The dataset is not a current US consumer lending dataset.",
                "Results may not generalize to new populations or lending settings."
            ]
        },

        "methodology": {
            "models": [
                "Logistic Regression",
                "Random Forest"
            ],
            "uncertainty_method": "Split conformal prediction",
            "conformity_score": "LAC",
            "confidence_levels_tested": [0.80, 0.90, 0.95],
            "baseline": "Majority-class classifier",
            "evaluation": [
                "Accuracy",
                "Balanced accuracy",
                "Bad-credit precision and recall",
                "F1 score",
                "Confusion matrix",
                "Selective risk",
                "Coverage",
                "Automation rate",
                "Decision cost"
            ]
        },

        "results": {
            "repeated_experiments": {
                "seeds": 5,
                "mean_coverage": 0.912,
                "coverage_standard_deviation": 0.0182,
                "mean_automation_rate": 0.581,
                "automation_standard_deviation": 0.0967,
                "mean_selective_risk": 0.1513,
                "selective_risk_standard_deviation": 0.0177,
                "mean_conformal_cost": 76.8,
                "mean_ordinary_cost": 172.8
            },

            "confidence_comparison": [
                {
                    "confidence_level": 0.80,
                    "observed_coverage": 0.82,
                    "automation_rate": 0.91,
                    "selective_risk": 0.198
                },
                {
                    "confidence_level": 0.90,
                    "observed_coverage": 0.91,
                    "automation_rate": 0.66,
                    "selective_risk": 0.136
                },
                {
                    "confidence_level": 0.95,
                    "observed_coverage": 0.945,
                    "automation_rate": 0.52,
                    "selective_risk": 0.106
                }
            ],

            "cost_sensitivity": {
                "description": (
                    "Illustrative decision-cost comparison under "
                    "different assumed human-review costs."
                ),
                "review_costs": [
                    {
                        "review_cost": 0.5,
                        "confidence_80_cost": 129,
                        "confidence_90_cost": 108,
                        "confidence_95_cost": 91,
                        "logistic_regression_cost": 154
                    },
                    {
                        "review_cost": 1.0,
                        "confidence_80_cost": 138,
                        "confidence_90_cost": 142,
                        "confidence_95_cost": 139,
                        "logistic_regression_cost": 154
                    },
                    {
                        "review_cost": 2.0,
                        "confidence_80_cost": 156,
                        "confidence_90_cost": 210,
                        "confidence_95_cost": 235,
                        "logistic_regression_cost": 154
                    }
                ]
            }
        },

        "interpretation": {
            "main_finding": (
                "Increasing the confidence requirement was associated "
                "with lower selective risk and a lower automation rate "
                "in the tested experiments."
            ),
            "meaning": (
                "The system can defer more uncertain cases for review "
                "rather than forcing a classification for every record."
            ),
            "limitations": [
                "The experiments use a relatively small historical dataset.",
                "The five random-seed experiments use overlapping data splits.",
                "Results are experimental and are not independent external validation.",
                "Fairness subgroup results have small sample sizes.",
                "Decision costs depend on assumed error and review costs.",
                "The research does not establish real-world lending fairness "
                "or suitability."
            ]
        },

        "product_boundary": (
            "These research results are presented for transparency and "
            "education. The experimental model is not used to approve, "
            "reject, or score live personal or business decisions in Verity."
        )
    }
