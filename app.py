
import streamlit as st
import pandas as pd
import numpy as np

from src.data_loader import load_dataset
from src.preprocessing import split_data
from src.train import build_models, train_models
from src.conformal import (
    build_conformal_model,
    predict_with_sets
)
from src.evaluate import evaluate_model


# ==================================================
# PAGE CONFIGURATION
# ==================================================

st.set_page_config(
    page_title="Verity | Research",
    page_icon="V",
    layout="wide"
)


# ==================================================
# VERITY DESIGN SYSTEM
# ==================================================

st.markdown("""
<style>

/* Main application */

.stApp {
    background-color: #FAFAFD;
    color: #111D3B;
}

[data-testid="stHeader"] {
    background: rgba(250, 250, 253, 0.95);
}

.block-container {
    max-width: 1450px;
    padding-top: 2rem;
    padding-bottom: 3rem;
}

/* Typography */

h1, h2, h3 {
    color: #111D3B !important;
    font-weight: 700 !important;
    letter-spacing: -0.5px;
}

p, label, span {
    color: #111D3B;
}

[data-testid="stCaptionContainer"] p {
    color: #70788F !important;
}

/* Sidebar */

[data-testid="stSidebar"] {
    background-color: #FFFFFF;
    border-right: 1px solid #E7E8F0;
}

[data-testid="stSidebar"] h1,
[data-testid="stSidebar"] h2,
[data-testid="stSidebar"] p {
    color: #111D3B !important;
}

/* Navigation selection */

[data-testid="stSidebar"] [data-testid="stRadio"] label {
    color: #111D3B !important;
    font-weight: 500;
}

/* Metric cards */

[data-testid="stMetric"] {
    background: #FFFFFF;
    border: 1px solid #E7E8F0;
    border-radius: 13px;
    padding: 17px;
}

[data-testid="stMetricLabel"] {
    color: #70788F !important;
}

[data-testid="stMetricValue"] {
    color: #111D3B !important;
    font-weight: 700;
}

/* General cards */

.verity-card {
    background: #FFFFFF;
    border: 1px solid #E7E8F0;
    border-radius: 15px;
    padding: 22px;
    margin-bottom: 12px;
}

.verity-card h3 {
    margin-top: 0;
}

.verity-muted {
    color: #70788F;
    font-size: 0.9rem;
}

.verity-highlight {
    background: #EEEAFE;
    border: 1px solid #DDD5FC;
    border-radius: 13px;
    padding: 17px;
    margin: 12px 0;
}

.verity-label {
    color: #70788F;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.7px;
}

.verity-value {
    color: #3435AD;
    font-size: 1.65rem;
    font-weight: 750;
    margin-top: 5px;
}

.verity-bar-track {
    background: #EEEAFE;
    height: 9px;
    border-radius: 20px;
    overflow: hidden;
    margin-top: 8px;
}

.verity-bar-fill {
    height: 9px;
    border-radius: 20px;
    background: linear-gradient(90deg, #3435AD, #7955E5);
}

/* Buttons */

.stButton > button {
    background: #3435AD;
    color: #FFFFFF;
    border: none;
    border-radius: 9px;
    font-weight: 600;
}

.stButton > button:hover {
    background: #7955E5;
    color: #FFFFFF;
    border: none;
}

/* Tabs */

.stTabs [data-baseweb="tab"] {
    color: #70788F;
    font-weight: 600;
}

.stTabs [aria-selected="true"] {
    color: #3435AD !important;
}

/* Dataframes */

[data-testid="stDataFrame"] {
    border: 1px solid #E7E8F0;
    border-radius: 10px;
}

/* Dividers */

hr {
    border-color: #E7E8F0 !important;
}

/* Alerts */

[data-testid="stAlert"] {
    border-radius: 12px;
}

</style>
""", unsafe_allow_html=True)


# ==================================================
# MODEL LOADING AND TRAINING
# ==================================================

@st.cache_resource
def load_verity():

    X, y, audit_data = load_dataset()

    (
        X_train,
        X_cal,
        X_test,
        y_train,
        y_cal,
        y_test,
        audit_test
    ) = split_data(
        X,
        y,
        audit_data,
        random_state=42
    )

    models = build_models(X_train)

    trained_models = train_models(
        models,
        X_train,
        y_train
    )

    # Keep BOTH trained models.
    logistic_model = trained_models["Logistic Regression"]
    random_forest_model = trained_models["Random Forest"]

    # Ordinary predictions for both models.
    logistic_predictions = logistic_model.predict(X_test)
    forest_predictions = random_forest_model.predict(X_test)

    # Evaluate both models using the same held-out test set.
    logistic_results = evaluate_model(
        "Logistic Regression",
        y_test,
        logistic_predictions
    )

    forest_results = evaluate_model(
        "Random Forest",
        y_test,
        forest_predictions
    )

    # Conformal prediction currently uses Logistic Regression.
    conformal_model = build_conformal_model(
        logistic_model,
        X_cal,
        y_cal,
        confidence_level=0.90
    )

    _, prediction_sets = predict_with_sets(
        conformal_model,
        X_test,
        logistic_model.classes_
    )

    return {
        "X": X,
        "X_test": X_test,
        "y_test": y_test,
        "audit_test": audit_test,
        "logistic_model": logistic_model,
        "forest_model": random_forest_model,
        "logistic_predictions": logistic_predictions,
        "forest_predictions": forest_predictions,
        "logistic_results": logistic_results,
        "forest_results": forest_results,
        "prediction_sets": prediction_sets
    }


# ==================================================
# LOAD APPLICATION
# ==================================================

st.markdown("""
<div style="display:flex; align-items:center; gap:12px;">
    <div style="
        background:#111D3B;
        color:white;
        border-radius:10px;
        width:42px;
        height:42px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:22px;
        font-weight:800;
    ">V</div>
    <div>
        <div style="
            color:#111D3B;
            font-size:25px;
            font-weight:800;
            letter-spacing:-0.8px;
        ">VERITY</div>
        <div style="
            color:#70788F;
            font-size:12px;
        ">RESEARCH & MODEL EVALUATION</div>
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

with st.spinner("Loading and evaluating Verity's research models..."):
    data = load_verity()

st.success("Research models loaded and evaluated successfully.")

X = data["X"]
X_test = data["X_test"]
y_test = data["y_test"]
audit_test = data["audit_test"]

logistic_model = data["logistic_model"]
forest_model = data["forest_model"]

logistic_predictions = data["logistic_predictions"]
forest_predictions = data["forest_predictions"]

logistic_results = data["logistic_results"]
forest_results = data["forest_results"]

prediction_sets = data["prediction_sets"]


# ==================================================
# SIDEBAR NAVIGATION
# ==================================================

st.sidebar.markdown("""
<div style="padding:10px 0 18px 0;">
    <div style="
        color:#111D3B;
        font-size:21px;
        font-weight:800;
    ">VERITY</div>
    <div style="
        color:#70788F;
        font-size:11px;
        letter-spacing:1px;
    ">RESEARCH LAB</div>
</div>
""", unsafe_allow_html=True)

page = st.sidebar.radio(
    "RESEARCH NAVIGATION",
    [
        "Overview",
        "Model Comparison",
        "Risk Assessment",
        "Uncertainty Analysis",
        "Fairness Audit",
        "Research Results"
    ]
)

st.sidebar.divider()

st.sidebar.caption(
    "Experimental research prototype"
)

st.sidebar.caption(
    "South German Credit dataset"
)


# ==================================================
# HELPER FUNCTIONS
# ==================================================

def display_model_card(name, results, color):

    st.markdown(f"""
    <div class="verity-card">
        <div style="
            color:{color};
            font-size:12px;
            font-weight:800;
            letter-spacing:1px;
            text-transform:uppercase;
        ">MODEL</div>
        <h3>{name}</h3>
        <div class="verity-muted">
            Evaluation on the held-out test dataset
        </div>
    </div>
    """, unsafe_allow_html=True)

    col1, col2 = st.columns(2)

    col1.metric(
        "Accuracy",
        f"{results['accuracy']:.1%}"
    )

    col2.metric(
        "Balanced accuracy",
        f"{results['balanced_accuracy']:.1%}"
    )

    col1.metric(
        "Bad-credit precision",
        f"{results['bad_precision']:.1%}"
    )

    col2.metric(
        "Bad-credit recall",
        f"{results['bad_recall']:.1%}"
    )

    col1.metric(
        "Bad-credit F1",
        f"{results['bad_f1']:.1%}"
    )

    col2.metric(
        "Weighted decision cost",
        f"{results['total_cost']}"
    )


def display_comparison_bar(label, value, color):

    percentage = max(0, min(float(value) * 100, 100))

    st.markdown(f"""
    <div style="margin-bottom:17px;">
        <div style="
            display:flex;
            justify-content:space-between;
            font-size:14px;
            font-weight:600;
            color:#111D3B;
        ">
            <span>{label}</span>
            <span>{percentage:.1f}%</span>
        </div>
        <div class="verity-bar-track">
            <div class="verity-bar-fill"
                style="
                    width:{percentage}%;
                    background:{color};
                ">
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ==================================================
# OVERVIEW
# ==================================================

if page == "Overview":

    st.title("Research Overview")

    st.write(
        "Verity investigates how uncertainty-aware machine "
        "learning can make credit-risk predictions more "
        "carefully and identify cases that may need human review."
    )

    st.markdown("### Research at a glance")

    col1, col2, col3 = st.columns(3)

    col1.metric("Historical records", "1,000")
    col2.metric("Model predictors", "18")
    col3.metric("Target confidence", "90%")

    st.markdown("### The research question")

    st.markdown("""
    <div class="verity-highlight">
        <h3 style="color:#3435AD;">
            When should an AI model recognize that it is uncertain?
        </h3>
        Instead of automatically classifying every historical
        applicant, Verity investigates whether uncertain cases
        can be deferred for additional human review.
    </div>
    """, unsafe_allow_html=True)

    st.markdown("### Research workflow")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("""
        <div class="verity-card">
            <h3>01 · Train</h3>
            Train Logistic Regression and Random Forest
            using historical credit records.
        </div>
        <div class="verity-card">
            <h3>02 · Compare</h3>
            Evaluate both models on the same held-out
            test dataset.
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div class="verity-card">
            <h3>03 · Measure uncertainty</h3>
            Apply split conformal prediction to
            Logistic Regression.
        </div>
        <div class="verity-card">
            <h3>04 · Evaluate decisions</h3>
            Examine coverage, automation, deferrals,
            and subgroup differences.
        </div>
        """, unsafe_allow_html=True)

    st.markdown("### Dataset")

    st.write(
        "The South German Credit dataset contains 1,000 "
        "historical records. Age and personal-status information "
        "are retained separately for exploratory fairness analysis."
    )

    st.info(
        "This is an experimental research prototype. "
        "It does not approve or deny loans and is not validated "
        "for real-world lending decisions."
    )


# ==================================================
# MODEL COMPARISON
# ==================================================

elif page == "Model Comparison":

    st.title("Model Comparison")

    st.write(
        "Two machine learning models are trained and evaluated "
        "on the same held-out historical credit dataset."
    )

    st.markdown("### Models evaluated")

    col1, col2 = st.columns(2)

    with col1:
        display_model_card(
            "Logistic Regression",
            logistic_results,
            "#3435AD"
        )

    with col2:
        display_model_card(
            "Random Forest",
            forest_results,
            "#7955E5"
        )

    st.divider()

    st.markdown("### Side-by-side comparison")

    comparison = pd.DataFrame([
        {
            "Metric": "Accuracy",
            "Logistic Regression": logistic_results["accuracy"],
            "Random Forest": forest_results["accuracy"]
        },
        {
            "Metric": "Balanced accuracy",
            "Logistic Regression": logistic_results["balanced_accuracy"],
            "Random Forest": forest_results["balanced_accuracy"]
        },
        {
            "Metric": "Bad-credit precision",
            "Logistic Regression": logistic_results["bad_precision"],
            "Random Forest": forest_results["bad_precision"]
        },
        {
            "Metric": "Bad-credit recall",
            "Logistic Regression": logistic_results["bad_recall"],
            "Random Forest": forest_results["bad_recall"]
        },
        {
            "Metric": "Bad-credit F1",
            "Logistic Regression": logistic_results["bad_f1"],
            "Random Forest": forest_results["bad_f1"]
        }
    ])

    st.dataframe(
        comparison.style.format({
            "Logistic Regression": "{:.1%}",
            "Random Forest": "{:.1%}"
        }).background_gradient(
            subset=["Logistic Regression", "Random Forest"],
            cmap="Purples"
        ),
        use_container_width=True,
        hide_index=True
    )

    st.markdown("### Weighted decision cost")

    cost_comparison = pd.DataFrame({
        "Model": [
            "Logistic Regression",
            "Random Forest"
        ],
        "Total weighted cost": [
            logistic_results["total_cost"],
            forest_results["total_cost"]
        ],
        "Cost per applicant": [
            logistic_results["cost_per_applicant"],
            forest_results["cost_per_applicant"]
        ]
    })

    st.dataframe(
        cost_comparison.style.format({
            "Cost per applicant": "{:.3f}"
        }),
        use_container_width=True,
        hide_index=True
    )

    st.caption(
        "The cost function assigns a cost of 5 to false approvals "
        "and 1 to false rejections, following the selected dataset "
        "evaluation framework. Lower cost is preferable under "
        "these assumed weights."
    )

    st.divider()

    st.markdown("### Confusion matrices")

    col1, col2 = st.columns(2)

    for column, name, results in [
        (col1, "Logistic Regression", logistic_results),
        (col2, "Random Forest", forest_results)
    ]:

        matrix = np.array([
            [
                results["true_good"],
                results["false_rejections"]
            ],
            [
                results["false_approvals"],
                results["true_bad"]
            ]
        ]) if all(
            key in results for key in [
                "true_good",
                "false_rejections",
                "false_approvals",
                "true_bad"
            ]
        ) else None

        with column:
            st.markdown(f"**{name}**")

            if matrix is not None:
                st.dataframe(
                    pd.DataFrame(
                        matrix,
                        index=["Actual good", "Actual bad"],
                        columns=["Predicted good", "Predicted bad"]
                    ),
                    use_container_width=True
                )
            else:
                st.caption(
                    "Confusion matrix values are not included "
                    "in the current evaluation output."
                )

    st.info(
        "These are ordinary classification results. The conformal "
        "prediction experiment is evaluated separately and currently "
        "uses Logistic Regression as its underlying estimator."
    )


# ==================================================
# RISK ASSESSMENT
# ==================================================

elif page == "Risk Assessment":

    st.title("Historical Applicant Assessment")

    st.write(
        "Inspect a held-out historical record and compare "
        "the ordinary predictions with the conformal result."
    )

    selected_index = st.selectbox(
        "Select historical record",
        options=X_test.index.tolist()
    )

    applicant = X_test.loc[[selected_index]]

    position = X_test.index.get_loc(selected_index)

    prediction_set = prediction_sets[position]

    logistic_prediction = logistic_model.predict(applicant)[0]

    forest_prediction = forest_model.predict(applicant)[0]

    st.markdown("### Model predictions")

    col1, col2 = st.columns(2)

    col1.metric(
        "Logistic Regression",
        str(logistic_prediction).upper()
    )

    col2.metric(
        "Random Forest",
        str(forest_prediction).upper()
    )

    st.markdown("### Conformal result")

    if len(prediction_set) == 1:

        st.success(
            f"Single-label prediction set: {prediction_set}"
        )

        st.write(
            "The conformal method returned one supported label. "
            "This is an experimental classification, not a "
            "lending recommendation."
        )

    else:

        st.warning(
            f"Human review recommended. Prediction set: "
            f"{prediction_set}"
        )

        st.write(
            "The conformal method did not return a single-label "
            "prediction. This case is deferred rather than "
            "automatically classified."
        )

    st.markdown("### Historical record characteristics")

    st.dataframe(
        applicant.T.rename(
            columns={selected_index: "Value"}
        ),
        use_container_width=True
    )

    st.caption(
        "An anonymized historical record, not a current applicant."
    )


# ==================================================
# UNCERTAINTY ANALYSIS
# ==================================================

elif page == "Uncertainty Analysis":

    st.title("Uncertainty Analysis")

    st.write(
        "The conformal prediction experiment evaluates when "
        "the Logistic Regression model can return a single-label "
        "prediction and when a case should be deferred."
    )

    total = len(prediction_sets)

    set_coverage = np.mean([
        y_test.iloc[i] in prediction_sets[i]
        for i in range(total)
    ])

    automated = sum(
        len(s) == 1 for s in prediction_sets
    )

    deferred = total - automated

    automation_coverage = automated / total

    automated_errors = sum(
        prediction_sets[i][0] != y_test.iloc[i]
        for i in range(total)
        if len(prediction_sets[i]) == 1
    )

    selective_risk = (
        automated_errors / automated
        if automated else np.nan
    )

    st.markdown("### Experimental results · 90% nominal confidence")

    col1, col2, col3, col4 = st.columns(4)

    col1.metric(
        "Observed set coverage",
        f"{set_coverage:.1%}"
    )

    col2.metric(
        "Automation",
        f"{automation_coverage:.1%}"
    )

    col3.metric(
        "Deferred cases",
        f"{deferred}/{total}"
    )

    col4.metric(
        "Selective risk",
        f"{selective_risk:.1%}"
    )

    st.markdown("### Prediction-set distribution")

    distribution = pd.Series([
        "{" + ", ".join(s) + "}" if len(s) else "Empty set"
        for s in prediction_sets
    ]).value_counts()

    st.bar_chart(
        distribution,
        color="#3435AD"
    )

    st.markdown("### Understanding the measurements")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("""
        <div class="verity-card">
            <h3>Prediction-set coverage</h3>
            The percentage of test records whose true label
            appears in the prediction set.
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div class="verity-card">
            <h3>Automation coverage</h3>
            The percentage of records receiving a single-label
            prediction rather than being deferred.
        </div>
        """, unsafe_allow_html=True)

    st.warning(
        "Observed coverage is a test-set measurement, not a "
        "guarantee for an individual prediction. Conformal "
        "coverage relies on exchangeability assumptions."
    )


# ==================================================
# FAIRNESS AUDIT
# ==================================================

elif page == "Fairness Audit":

    st.title("Fairness Audit")

    st.write(
        "Explore differences in prediction-set coverage, "
        "automation, and selective risk across historical groups."
    )

    audit = audit_test.reset_index(drop=True).copy()

    audit["actual"] = y_test.reset_index(drop=True).values

    audit["prediction_set"] = prediction_sets

    audit["automated"] = audit["prediction_set"].apply(
        lambda s: len(s) == 1
    )

    audit["covered"] = audit.apply(
        lambda row: row["actual"] in row["prediction_set"],
        axis=1
    )

    audit["prediction"] = audit["prediction_set"].apply(
        lambda s: s[0] if len(s) == 1 else None
    )

    audit["age_group"] = pd.cut(
        audit["age"],
        bins=[0, 25, 40, 60, 120],
        labels=["18-25", "26-40", "41-60", "61+"],
        include_lowest=True
    )

    audit["error"] = audit.apply(
        lambda row: (
            row["prediction"] != row["actual"]
            if row["automated"] else np.nan
        ),
        axis=1
    )

    def group_summary(data, column):

        rows = []

        for name, group in data.groupby(
            column,
            observed=True
        ):

            automated_group = group[group["automated"]]

            risk = (
                automated_group["error"].mean()
                if len(automated_group)
                else np.nan
            )

            rows.append({
                "Group": str(name),
                "Sample size": len(group),
                "Prediction-set coverage":
                    group["covered"].mean(),
                "Automation coverage":
                    group["automated"].mean(),
                "Selective risk": risk
            })

        return pd.DataFrame(rows)

    st.markdown("### Results by age group")

    age_results = group_summary(audit, "age_group")

    st.dataframe(
        age_results.style.format({
            "Prediction-set coverage": "{:.1%}",
            "Automation coverage": "{:.1%}",
            "Selective risk": "{:.1%}"
        }),
        use_container_width=True,
        hide_index=True
    )

    st.markdown("### Results by personal-status/sex code")

    status_results = group_summary(
        audit,
        "personal_status_sex_code"
    )

    st.dataframe(
        status_results.style.format({
            "Prediction-set coverage": "{:.1%}",
            "Automation coverage": "{:.1%}",
            "Selective risk": "{:.1%}"
        }),
        use_container_width=True,
        hide_index=True
    )

    st.warning(
        "These are exploratory subgroup comparisons. The "
        "personal-status/sex variable combines categories and "
        "should not be interpreted as a direct sex identifier. "
        "Small subgroup samples make estimates unstable."
    )


# ==================================================
# RESEARCH RESULTS
# ==================================================

elif page == "Research Results":

    st.title("Research Results")

    st.write(
        "Results from the five-seed stability experiment."
    )

    stability = pd.DataFrame({
        "Seed": [42, 52, 62, 72, 82],
        "Set coverage": [0.910, 0.905, 0.940, 0.890, 0.915],
        "Automation coverage": [0.660, 0.635, 0.415, 0.605, 0.590],
        "Selective risk": [
            0.136364, 0.149606, 0.144578,
            0.181818, 0.144068
        ],
        "Conformal cost": [74, 79, 52, 106, 73],
        "Ordinary cost": [154, 164, 183, 185, 178]
    })

    st.markdown("### Five-seed experiment")

    st.dataframe(
        stability.style.format({
            "Set coverage": "{:.1%}",
            "Automation coverage": "{:.1%}",
            "Selective risk": "{:.1%}"
        }),
        use_container_width=True,
        hide_index=True
    )

    st.markdown("### Average experimental results")

    col1, col2, col3 = st.columns(3)

    col1.metric("Average set coverage", "91.2%")
    col2.metric("Average automation", "58.1%")
    col3.metric("Average selective risk", "15.1%")

    col1, col2 = st.columns(2)

    col1.metric("Average conformal cost", "76.8")
    col2.metric("Average ordinary cost", "172.8")

    st.markdown("### Interpretation")

    st.markdown("""
    <div class="verity-highlight">
        <h3 style="color:#3435AD;">
            The central tradeoff
        </h3>
        The experiment explores how an uncertainty-aware model
        can reduce the number of incorrect automated
        classifications by deferring uncertain cases.
        However, deferral also reduces automation.
    </div>
    """, unsafe_allow_html=True)

    st.markdown("### Limitations")

    st.markdown("""
    - The dataset contains only 1,000 historical records.
    - It reflects historical lending patterns, not modern applicants.
    - Repeated splits reuse the same dataset and are not independent external validation.
    - Review costs are hypothetical.
    - Subgroup comparisons have limited statistical power.
    - Conformal coverage is marginal under exchangeability assumptions.
    - The research prototype does not make real lending decisions.
    """)

    st.caption(
        "Five-seed results are exploratory experimental averages. "
        "They should not be interpreted as external validation."
    )


# ==================================================
# FOOTER
# ==================================================

st.divider()

st.markdown("""
<div style="
    display:flex;
    justify-content:space-between;
    flex-wrap:wrap;
    gap:10px;
    color:#70788F;
    font-size:12px;
">
    <span><b style="color:#111D3B;">VERITY</b> · RESEARCH</span>
    <span>Experimental AI research prototype · South German Credit</span>
</div>
""", unsafe_allow_html=True)
