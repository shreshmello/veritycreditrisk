
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


# --------------------------------------------------
# PAGE CONFIGURATION
# --------------------------------------------------

st.set_page_config(
    page_title="Verity | AI Credit Risk Research",
    page_icon="🔎",
    layout="wide"
)


# --------------------------------------------------
# LOAD AND TRAIN MODEL
# --------------------------------------------------

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
    ) = split_data(X, y, audit_data, random_state=42)

    models = build_models(X_train)

    trained_models = train_models(
        models,
        X_train,
        y_train
    )

    estimator = trained_models["Logistic Regression"]

    conformal_model = build_conformal_model(
        estimator,
        X_cal,
        y_cal,
        confidence_level=0.90
    )

    _, prediction_sets = predict_with_sets(
        conformal_model,
        X_test,
        estimator.classes_
    )

    return (
        X,
        X_test,
        y_test,
        audit_test,
        estimator,
        prediction_sets
    )


# --------------------------------------------------
# APPLICATION
# --------------------------------------------------

st.title("VERITY")
st.caption("Uncertainty-aware AI for credit-risk assessment")

st.info(
    "Research prototype only. Verity uses historical, "
    "anonymized data and does not approve or deny loans. "
    "All automated classifications require appropriate "
    "human oversight."
)

with st.spinner("Loading Verity's research model..."):
    (
        X,
        X_test,
        y_test,
        audit_test,
        model,
        prediction_sets
    ) = load_verity()

st.success("Research model loaded successfully.")


# --------------------------------------------------
# SIDEBAR NAVIGATION
# --------------------------------------------------

page = st.sidebar.radio(
    "Navigation",
    [
        "Overview",
        "Risk Assessment",
        "Uncertainty Analysis",
        "Fairness Audit",
        "Research Results"
    ]
)


# --------------------------------------------------
# OVERVIEW
# --------------------------------------------------

if page == "Overview":

    st.header("Understanding Verity")

    st.write(
        "Traditional credit-risk models produce a prediction "
        "even when the available evidence is uncertain. "
        "Verity investigates whether an AI system can recognize "
        "when it should defer a case for human review."
    )

    col1, col2, col3 = st.columns(3)

    col1.metric("Historical records", "1,000")
    col2.metric("Predictor variables", "18")
    col3.metric("Nominal confidence", "90%")

    st.subheader("How Verity works")

    st.markdown("""
    1. **Input:** Historical applicant characteristics.
    2. **Prediction:** Logistic Regression estimates a credit-risk class.
    3. **Uncertainty:** Split conformal prediction constructs a prediction set.
    4. **Decision support:** Single-label sets support a model classification.
    5. **Human review:** Multiple-label or empty sets are deferred.
    """)

    st.subheader("The research question")

    st.write(
        "Can conformal prediction reduce incorrect automated "
        "credit-risk classifications by deferring uncertain cases, "
        "while maintaining useful decision coverage and evaluating "
        "fairness across demographic groups?"
    )

    st.subheader("Dataset")

    st.write(
        "South German Credit, a historical dataset containing "
        "1,000 records. Its age and personal-status information "
        "are retained separately for fairness auditing."
    )


# --------------------------------------------------
# RISK ASSESSMENT
# --------------------------------------------------

elif page == "Risk Assessment":

    st.header("Historical Applicant Assessment")

    st.write(
        "Select a record from the held-out sample to inspect "
        "Verity's experimental prediction."
    )

    selected_index = st.selectbox(
        "Select historical record",
        options=X_test.index.tolist()
    )

    applicant = X_test.loc[[selected_index]]

    position = X_test.index.get_loc(selected_index)
    prediction_set = prediction_sets[position]

    prediction = model.predict(applicant)[0]

    st.subheader("Assessment result")

    if len(prediction_set) == 1:

        if prediction_set[0] == "good":
            st.success(
                "Single-label prediction set: {good}"
            )
        else:
            st.warning(
                "Single-label prediction set: {bad}"
            )

        st.write(
            "The model produces a single supported classification. "
            "This is not a lending recommendation or approval."
        )

    else:

        st.warning(
            f"Human review recommended. Prediction set: "
            f"{prediction_set}"
        )

        st.write(
            "The conformal system did not produce a single-label "
            "prediction. This case is deferred rather than "
            "automatically classified."
        )

    st.write("Model's ordinary prediction:", prediction)

    st.subheader("Historical record characteristics")

    st.dataframe(
        applicant.T.rename(columns={selected_index: "Value"}),
        use_container_width=True
    )

    st.caption(
        "This is an anonymized historical dataset record, "
        "not information about a current loan applicant."
    )


# --------------------------------------------------
# UNCERTAINTY ANALYSIS
# --------------------------------------------------

elif page == "Uncertainty Analysis":

    st.header("Uncertainty Analysis")

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

    col1, col2, col3 = st.columns(3)

    col1.metric(
        "Prediction-set coverage",
        f"{set_coverage:.1%}"
    )

    col2.metric(
        "Automation coverage",
        f"{automation_coverage:.1%}"
    )

    col3.metric(
        "Deferred cases",
        f"{deferred} / {total}"
    )

    st.metric(
        "Selective risk",
        f"{selective_risk:.1%}"
    )

    st.subheader("Prediction-set distribution")

    distribution = pd.Series([
        "{" + ", ".join(s) + "}" if s else "Empty set"
        for s in prediction_sets
    ]).value_counts()

    st.bar_chart(distribution)

    st.write(
        "Prediction-set coverage measures whether the true "
        "historical label appears in the prediction set. "
        "It is not individual prediction accuracy."
    )


# --------------------------------------------------
# FAIRNESS AUDIT
# --------------------------------------------------

elif page == "Fairness Audit":

    st.header("Fairness Audit")

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

    st.subheader("Results by age group")

    age_results = group_summary(audit, "age_group")

    st.dataframe(
        age_results.style.format({
            "Prediction-set coverage": "{:.1%}",
            "Automation coverage": "{:.1%}",
            "Selective risk": "{:.1%}"
        }),
        use_container_width=True
    )

    st.subheader("Results by personal-status/sex code")

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
        use_container_width=True
    )

    st.warning(
        "These are exploratory subgroup comparisons. "
        "The personal-status/sex variable combines categories "
        "and should not be interpreted as a direct sex identifier. "
        "Small subgroup samples make estimates unstable."
    )


# --------------------------------------------------
# RESEARCH RESULTS
# --------------------------------------------------

elif page == "Research Results":

    st.header("Research Results")

    st.subheader("Five-split stability experiment")

    stability = pd.DataFrame({
        "Seed": [42, 52, 62, 72, 82],
        "Set coverage": [0.910, 0.905, 0.940, 0.890, 0.915],
        "Automation coverage": [0.660, 0.635, 0.415, 0.605, 0.590],
        "Selective risk": [0.136364, 0.149606, 0.144578, 0.181818, 0.144068],
        "Conformal cost": [74, 79, 52, 106, 73],
        "Ordinary cost": [154, 164, 183, 185, 178]
    })

    st.dataframe(
        stability,
        use_container_width=True
    )

    st.subheader("Average results")

    col1, col2 = st.columns(2)

    col1.metric("Average set coverage", "91.2%")
    col2.metric("Average automation coverage", "58.1%")

    col1.metric("Average selective risk", "15.1%")
    col2.metric("Average conformal cost", "76.8")

    st.subheader("Limitations")

    st.markdown("""
    - The dataset contains only 1,000 historical records.
    - It reflects historical lending patterns, not modern applicants.
    - Repeated splits reuse the same dataset and are not independent external validation.
    - Review costs are hypothetical.
    - Subgroup comparisons have limited statistical power.
    - Conformal coverage is marginal under exchangeability assumptions.
    - The prototype does not make real lending decisions.
    """)

    st.caption(
        "Results shown here are from the experiments conducted "
        "during development. They are exploratory and should "
        "not be interpreted as external validation."
    )


# --------------------------------------------------
# FOOTER
# --------------------------------------------------

st.divider()

st.caption(
    "VERITY | Experimental AI research prototype | "
    "South German Credit dataset"
)
