import { ArrowLeft, Info, ShieldCheck, FlaskConical } from 'lucide-react'
import './Research.css'

type ResearchProps = {
  onBack: () => void
}

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

        <section className="research-section">
          <div className="research-section-heading">
            <span>02</span>
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

        <section className="research-section">
          <div className="research-section-heading">
            <span>03</span>
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

        <section className="research-section">
          <div className="research-section-heading">
            <span>04</span>
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