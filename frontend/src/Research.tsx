
import { ArrowLeft, Info, ShieldCheck, FlaskConical } from 'lucide-react'
import './Research.css'

type ResearchProps = {
  onBack: () => void
}

const modelMetrics = [
  { metric: 'Accuracy', logistic: '77.00%', forest: '75.50%', better: 'logistic' },
  { metric: 'Balanced accuracy', logistic: '70.71%', forest: '64.40%', better: 'logistic' },
  { metric: 'Bad-credit precision', logistic: '63.46%', forest: '66.67%', better: 'forest' },
  { metric: 'Bad-credit recall', logistic: '55.00%', forest: '36.67%', better: 'logistic' },
  { metric: 'Bad-credit F1 score', logistic: '58.93%', forest: '47.31%', better: 'logistic' },
  { metric: 'Weighted error cost', logistic: '154', forest: '201', better: 'logistic' },
  { metric: 'Cost per applicant', logistic: '0.770', forest: '1.005', better: 'logistic' },
]

const confidenceResults = [
  {
    level: '80%',
    coverage: '82%',
    automation: '91%',
    risk: '19.8%',
  },
  {
    level: '90%',
    coverage: '91%',
    automation: '66%',
    risk: '13.6%',
  },
  {
    level: '95%',
    coverage: '94.5%',
    automation: '52%',
    risk: '10.6%',
  },
]

const stabilityResults = [
  { seed: '42', coverage: '91.0%', automation: '66.0%', risk: '13.6%' },
  { seed: '52', coverage: '90.5%', automation: '63.5%', risk: '15.0%' },
  { seed: '62', coverage: '94.0%', automation: '41.5%', risk: '14.5%' },
  { seed: '72', coverage: '89.0%', automation: '60.5%', risk: '18.2%' },
  { seed: '82', coverage: '91.5%', automation: '59.0%', risk: '14.4%' },
]

const confusionMatrices = [
  {
    name: 'Logistic Regression',
    values: [
      { actual: 'Good credit', predictedGood: 121, predictedBad: 19 },
      { actual: 'Bad credit', predictedGood: 27, predictedBad: 33 },
    ],
  },
  {
    name: 'Random Forest',
    values: [
      { actual: 'Good credit', predictedGood: 129, predictedBad: 11 },
      { actual: 'Bad credit', predictedGood: 38, predictedBad: 22 },
    ],
  },
]

export default function Research({ onBack }: ResearchProps) {
  return (
    <main className="research-page">
      <div className="research-container">
        <button className="research-back" onClick={onBack}>
          <ArrowLeft size={17} />
          Back to Verity
        </button>

        <section className="research-hero">
          <div className="research-eyebrow">
            <FlaskConical size={15} />
            THE RESEARCH BEHIND VERITY
          </div>

          <h1>
            Better decisions start
            <br />
            with <span>understanding uncertainty.</span>
          </h1>

          <p>
            Verity explores how machine learning and uncertainty estimation
            can help people understand financial decisions, identify when
            information is insufficient, and recognize when human review
            is needed.
          </p>
        </section>

        {/* 01 — WHAT WE INVESTIGATED */}
        <section className="research-section">
          <div className="research-section-heading">
            <span>01</span>
            <div>
              <h2>What we investigated</h2>
              <p>
                Can a model communicate when it is uncertain instead of
                forcing every prediction into a confident answer?
              </p>
            </div>
          </div>

          <div className="research-method-grid">
            <article className="research-method-card">
              <h3>Logistic regression</h3>
              <p>
                A traditional statistical classification model used as
                a baseline for comparison.
              </p>
            </article>

            <article className="research-method-card">
              <h3>Random forest</h3>
              <p>
                An ensemble model that combines multiple decision trees
                to identify patterns in historical data.
              </p>
            </article>

            <article className="research-method-card">
              <h3>Conformal prediction</h3>
              <p>
                An uncertainty-estimation approach that can return a
                set of possible outcomes instead of forcing one answer.
              </p>
            </article>
          </div>
        </section>

        {/* 02 — MODEL COMPARISON */}
        <section className="research-section">
          <div className="research-section-heading">
            <span>02</span>
            <div>
              <h2>Comparing the models</h2>
              <p>
                We evaluated Logistic Regression and Random Forest on the
                same held-out test set to compare predictive performance
                and the consequences of different classification errors.
              </p>
            </div>
          </div>

          <div className="research-comparison-overview">
            <article className="research-comparison-card research-comparison-featured">
              <span className="research-model-label">MODEL 01</span>
              <h3>Logistic Regression</h3>
              <strong>77.00%</strong>
              <p>Test accuracy</p>
              <small>Lower weighted error cost in this experiment</small>
            </article>

            <article className="research-comparison-card">
              <span className="research-model-label">MODEL 02</span>
              <h3>Random Forest</h3>
              <strong>75.50%</strong>
              <p>Test accuracy</p>
              <small>Higher bad-credit precision in this experiment</small>
            </article>
          </div>

          <div className="research-table-wrap">
            <table className="research-table research-model-table">
              <thead>
                <tr>
                  <th>Evaluation metric</th>
                  <th>Logistic regression</th>
                  <th>Random forest</th>
                </tr>
              </thead>
              <tbody>
                {modelMetrics.map((result) => (
                  <tr key={result.metric}>
                    <td>{result.metric}</td>
                    <td className={result.better === 'logistic' ? 'research-better-result' : ''}>
                      {result.logistic}
                    </td>
                    <td className={result.better === 'forest' ? 'research-better-result' : ''}>
                      {result.forest}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="research-footnote">
            The test set contained 200 records. Precision, recall, and F1
            refer to the bad-credit class. Higher is preferable for these
            metrics; lower is preferable for weighted error cost.
          </p>

          <div className="research-insight">
            <ShieldCheck size={21} />
            <div>
              <strong>What the comparison shows</strong>
              <p>
                Logistic Regression performed better on accuracy, balanced
                accuracy, bad-credit recall, and F1 score. It also had a
                lower weighted error cost under our selected assumptions.
                Random Forest had higher bad-credit precision, meaning a
                larger share of its bad-credit predictions were correct.
                Neither model was best on every metric.
              </p>
            </div>
          </div>

          <h3 className="research-subheading">Confusion matrices</h3>
          <p className="research-supporting-text">
            Each matrix shows the number of records in each actual category
            and the category predicted by the model.
          </p>

          <div className="research-matrix-grid">
            {confusionMatrices.map((matrix) => (
              <article className="research-matrix-card" key={matrix.name}>
                <h3>{matrix.name}</h3>
                <div className="research-matrix-wrap">
                  <table className="research-matrix">
                    <thead>
                      <tr>
                        <th>Actual</th>
                        <th>Predicted good</th>
                        <th>Predicted bad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.values.map((row) => (
                        <tr key={row.actual}>
                          <th>{row.actual}</th>
                          <td>{row.predictedGood}</td>
                          <td>{row.predictedBad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>

          <p className="research-footnote">
            Rows represent actual labels and columns represent model
            predictions. A false approval is an actual bad-credit record
            predicted as good; a false rejection is an actual good-credit
            record predicted as bad.
          </p>

          <div className="research-cost-note">
            <strong>How weighted error cost was calculated</strong>
            <p>
              We assigned a weight of 5 to a false approval and 1 to a
              false rejection:
            </p>
            <div className="research-formula">
              Weighted cost = (5 × false approvals) + (1 × false rejections)
            </div>
            <p>
              This produced costs of 154 for Logistic Regression and 201
              for Random Forest. These are experimental cost units, not
              dollar amounts. The weights represent an assumption about
              the relative consequences of errors, not a universal measure
              of lending harm.
            </p>
          </div>

          <p className="research-footnote">
            Both models were evaluated on the same held-out split using
            random seed 42. This is a single test-set comparison, not
            evidence that either model will perform the same way on other
            populations or lending environments.
          </p>
        </section>

        {/* 03 — CONFIDENCE TRADE-OFF */}
        <section className="research-section">
          <div className="research-section-heading">
            <span>03</span>
            <div>
              <h2>The confidence trade-off</h2>
              <p>
                Changing the confidence level affects how often the
                system can make an automated prediction and how often
                it needs to defer.
              </p>
            </div>
          </div>

          <div className="research-table-wrap">
            <table className="research-table">
              <thead>
                <tr>
                  <th>Confidence level</th>
                  <th>Observed coverage</th>
                  <th>Automation rate</th>
                  <th>Selective risk</th>
                </tr>
              </thead>
              <tbody>
                {confidenceResults.map((result) => (
                  <tr key={result.level}>
                    <td>{result.level}</td>
                    <td>{result.coverage}</td>
                    <td>{result.automation}</td>
                    <td>{result.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="research-footnote">
            Coverage measures how often the prediction set contained
            the observed outcome. Automation rate measures the share
            of cases handled without deferral. Selective risk measures
            errors among those automated cases.
          </p>

          <div className="research-insight">
            <ShieldCheck size={21} />
            <div>
              <strong>What this suggests</strong>
              <p>
                Higher confidence levels were associated with lower
                automation and lower selective risk in this experiment.
                More caution can mean more cases need further review.
              </p>
            </div>
          </div>
        </section>

        {/* 04 — STABILITY */}
        <section className="research-section">
          <div className="research-section-heading">
            <span>04</span>
            <div>
              <h2>Stability across experiments</h2>
              <p>
                We repeated the experiment with five random seeds to
                examine how much the results changed across different
                data splits.
              </p>
            </div>
          </div>

          <div className="research-summary-grid">
            <article className="research-stat-card">
              <span>Average coverage</span>
              <strong>91.2%</strong>
              <small>Across five seeds</small>
            </article>

            <article className="research-stat-card">
              <span>Average automation</span>
              <strong>58.1%</strong>
              <small>Across five seeds</small>
            </article>

            <article className="research-stat-card">
              <span>Average selective risk</span>
              <strong>15.1%</strong>
              <small>Across five seeds</small>
            </article>
          </div>

          <div className="research-table-wrap">
            <table className="research-table">
              <thead>
                <tr>
                  <th>Random seed</th>
                  <th>Coverage</th>
                  <th>Automation</th>
                  <th>Selective risk</th>
                </tr>
              </thead>
              <tbody>
                {stabilityResults.map((result) => (
                  <tr key={result.seed}>
                    <td>{result.seed}</td>
                    <td>{result.coverage}</td>
                    <td>{result.automation}</td>
                    <td>{result.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="research-footnote">
            These experiments use the same small dataset with different,
            overlapping splits. They are not five independent external
            validations.
          </p>
        </section>

        {/* 05 — FAIRNESS AND LIMITATIONS */}
        <section className="research-section">
          <div className="research-section-heading">
            <span>05</span>
            <div>
              <h2>Fairness and limitations</h2>
              <p>
                Model performance can vary across groups. We examined
                exploratory differences, but the available sample sizes
                are too limited for strong conclusions.
              </p>
            </div>
          </div>

          <div className="research-warning">
            <Info size={21} />
            <div>
              <strong>Important research limitations</strong>
              <ul>
                <li>
                  The dataset contains only 1,000 historical German
                  credit records.
                </li>
                <li>
                  It does not establish how the model would perform
                  on modern US borrowers.
                </li>
                <li>
                  Some demographic subgroups have very small sample sizes.
                </li>
                <li>
                  Observed group differences are exploratory, not proof
                  of fairness or unfairness.
                </li>
                <li>
                  The results do not establish real-world lending
                  performance or regulatory compliance.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* HOW THIS INFORMS VERITY */}
        <section className="research-section research-product-note">
          <h2>How this informs Verity</h2>
          <p>
            This research motivates an important design principle:
            financial decision-support tools should communicate uncertainty
            and make room for human judgment.
          </p>
          <p>
            Verity currently uses transparent financial calculations,
            scenario exploration, and explanatory checklists. The
            experimental credit model is not used to score live users
            or business transactions.
          </p>
        </section>

        <footer className="research-footer">
          <span>VERITY</span>
          <p>Research with transparency. Decisions with understanding.</p>
        </footer>
      </div>
    </main>
  )
}
