
import { useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  CircleHelp,
  RotateCcw,
  TrendingUp,
  Wallet,
  Calculator,
  AlertTriangle,
} from 'lucide-react'
import './ScenarioExplorer.css'

export type ScenarioInitialValues = {
  amount: number
  apr: number
  months: number
  income: number
  expenses: number
  existingDebt: number
}

type Props = {
  initialValues: ScenarioInitialValues
  onBack: () => void
}

type Scenario = {
  monthlyPayment: number
  totalRepayment: number
  totalInterest: number
  remaining: number
}

const money = (value: number) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })

function calculateScenario(
  amount: number,
  apr: number,
  months: number,
  income: number,
  expenses: number,
  existingDebt: number
): Scenario {
  const monthlyRate = apr / 100 / 12

  const monthlyPayment =
    monthlyRate === 0
      ? amount / months
      : (amount * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -months))

  const totalRepayment = monthlyPayment * months
  const totalInterest = Math.max(0, totalRepayment - amount)

  const remaining =
    income - expenses - existingDebt - monthlyPayment

  return {
    monthlyPayment,
    totalRepayment,
    totalInterest,
    remaining,
  }
}

function ChangeIndicator({
  label,
  original,
  adjusted,
  inverse = false,
}: {
  label: string
  original: number
  adjusted: number
  inverse?: boolean
}) {
  const difference = adjusted - original
  const unchanged = Math.abs(difference) < 0.01
  const improved = inverse ? difference < 0 : difference > 0

  return (
    <div className="scenario-change">
      <span>{label}</span>

      <div className="scenario-change-value">
        {unchanged ? (
          <span className="scenario-neutral">No change</span>
        ) : (
          <>
            {difference > 0 ? (
              <ArrowUpRight
                size={16}
                className={improved ? 'change-good' : 'change-bad'}
              />
            ) : (
              <ArrowDownRight
                size={16}
                className={improved ? 'change-good' : 'change-bad'}
              />
            )}

            <strong className={improved ? 'change-good' : 'change-bad'}>
              {money(Math.abs(difference))}
            </strong>
          </>
        )}
      </div>
    </div>
  )
}

function ScenarioExplorer({ initialValues, onBack }: Props) {
  const [amount, setAmount] = useState(initialValues.amount)
  const [apr, setApr] = useState(initialValues.apr)
  const [months, setMonths] = useState(initialValues.months)

  const original = useMemo(
    () =>
      calculateScenario(
        initialValues.amount,
        initialValues.apr,
        initialValues.months,
        initialValues.income,
        initialValues.expenses,
        initialValues.existingDebt
      ),
    [initialValues]
  )

  const adjusted = useMemo(
    () =>
      calculateScenario(
        amount,
        apr,
        months,
        initialValues.income,
        initialValues.expenses,
        initialValues.existingDebt
      ),
    [amount, apr, months, initialValues]
  )

  const committed = initialValues.expenses + initialValues.existingDebt
  const originalRemaining = original.remaining
  const adjustedRemaining = adjusted.remaining

  const hasIncome = initialValues.income > 0

  const originalCommittedPercent = hasIncome
    ? ((committed + original.monthlyPayment) / initialValues.income) * 100
    : 0

  const adjustedCommittedPercent = hasIncome
    ? ((committed + adjusted.monthlyPayment) / initialValues.income) * 100
    : 0

  const resetScenario = () => {
    setAmount(initialValues.amount)
    setApr(initialValues.apr)
    setMonths(initialValues.months)
  }

  const isAdjustedOverBudget = adjusted.remaining < 0
  const isOriginalOverBudget = original.remaining < 0

  return (
    <main className="scenario-page">
      <header className="scenario-nav">
        <button className="scenario-brand" onClick={onBack}>
          <span className="scenario-brand-mark">v.</span>
          <span>verity</span>
        </button>

        <span className="scenario-nav-label">SCENARIO EXPLORER</span>

        <button className="scenario-exit" onClick={onBack}>
          Back to assessment
        </button>
      </header>

      <div className="scenario-container">
        <div className="scenario-heading">
          <span className="scenario-kicker">EXPLORE YOUR OPTIONS</span>

          <h1>
            What if you
            <span> changed the numbers?</span>
          </h1>

          <p>
            Adjust the loan terms and see how each change affects your monthly
            payment, total borrowing cost, and estimated remaining budget.
          </p>
        </div>

        <div className="scenario-layout">
          <section className="scenario-controls">
            <div className="scenario-card-heading">
              <div>
                <span className="scenario-kicker">ADJUST YOUR SCENARIO</span>
                <h2>Change the loan details</h2>
              </div>

              <button
                className="scenario-reset"
                onClick={resetScenario}
                type="button"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>

            <div className="scenario-control">
              <div className="scenario-control-heading">
                <label htmlFor="scenario-amount">Loan amount</label>
                <strong>{money(amount)}</strong>
              </div>

              <input
                id="scenario-amount"
                type="range"
                min="500"
                max="50000"
                step="500"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />

              <div className="scenario-range-labels">
                <span>$500</span>
                <span>$50,000</span>
              </div>
            </div>

            <div className="scenario-control">
              <div className="scenario-control-heading">
                <label htmlFor="scenario-apr">Annual interest rate</label>
                <strong>{apr.toFixed(2)}%</strong>
              </div>

              <input
                id="scenario-apr"
                type="range"
                min="0"
                max="40"
                step="0.25"
                value={apr}
                onChange={(event) => setApr(Number(event.target.value))}
              />

              <div className="scenario-range-labels">
                <span>0%</span>
                <span>40%</span>
              </div>
            </div>

            <div className="scenario-control">
              <div className="scenario-control-heading">
                <label htmlFor="scenario-months">Repayment period</label>
                <strong>{months} months</strong>
              </div>

              <input
                id="scenario-months"
                type="range"
                min="6"
                max="120"
                step="6"
                value={months}
                onChange={(event) => setMonths(Number(event.target.value))}
              />

              <div className="scenario-range-labels">
                <span>6 months</span>
                <span>120 months</span>
              </div>
            </div>

            <div className="scenario-original-note">
              <CircleHelp size={17} />
              <p>
                Your original loan terms are kept as a reference. Moving these
                sliders only changes the alternative scenario.
              </p>
            </div>

            <div className="scenario-original-values">
              <span>ORIGINAL LOAN TERMS</span>
              <div>
                <span>Amount</span>
                <strong>{money(initialValues.amount)}</strong>
              </div>
              <div>
                <span>APR</span>
                <strong>{initialValues.apr.toFixed(2)}%</strong>
              </div>
              <div>
                <span>Repayment period</span>
                <strong>{initialValues.months} months</strong>
              </div>
            </div>
          </section>

          <section className="scenario-results">
            <div className="scenario-card-heading">
              <div>
                <span className="scenario-kicker">LIVE COMPARISON</span>
                <h2>Your updated numbers</h2>
              </div>
              <span className="scenario-live-indicator">
                <span />
                Updates live
              </span>
            </div>

            <div className="scenario-payment-grid">
              <div className="scenario-payment-card">
                <span>Original monthly payment</span>
                <strong>{money(original.monthlyPayment)}</strong>
                <small>Original scenario</small>
              </div>

              <div className="scenario-payment-card featured">
                <span>Adjusted monthly payment</span>
                <strong>{money(adjusted.monthlyPayment)}</strong>
                <small>Alternative scenario</small>
              </div>
            </div>

            <div className="scenario-section">
              <h3>
                <TrendingUp size={17} />
                How the costs compare
              </h3>

              <div className="scenario-metric">
                <div className="scenario-metric-heading">
                  <span>Total repayment</span>
                  <strong>{money(adjusted.totalRepayment)}</strong>
                </div>

                <div className="scenario-compare-bars">
                  <div className="scenario-bar-row">
                    <span>Original</span>
                    <div className="scenario-bar-track">
                      <div
                        className="scenario-bar original-bar"
                        style={{
                          width: `${
                            (original.totalRepayment /
                              Math.max(
                                original.totalRepayment,
                                adjusted.totalRepayment,
                                1
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{money(original.totalRepayment)}</strong>
                  </div>

                  <div className="scenario-bar-row">
                    <span>Adjusted</span>
                    <div className="scenario-bar-track">
                      <div
                        className="scenario-bar adjusted-bar"
                        style={{
                          width: `${
                            (adjusted.totalRepayment /
                              Math.max(
                                original.totalRepayment,
                                adjusted.totalRepayment,
                                1
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{money(adjusted.totalRepayment)}</strong>
                  </div>
                </div>
              </div>

              <div className="scenario-metric">
                <div className="scenario-metric-heading">
                  <span>Total interest</span>
                  <strong>{money(adjusted.totalInterest)}</strong>
                </div>

                <div className="scenario-compare-bars">
                  <div className="scenario-bar-row">
                    <span>Original</span>
                    <div className="scenario-bar-track">
                      <div
                        className="scenario-bar original-bar"
                        style={{
                          width: `${
                            (original.totalInterest /
                              Math.max(
                                original.totalInterest,
                                adjusted.totalInterest,
                                1
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{money(original.totalInterest)}</strong>
                  </div>

                  <div className="scenario-bar-row">
                    <span>Adjusted</span>
                    <div className="scenario-bar-track">
                      <div
                        className="scenario-bar interest-bar"
                        style={{
                          width: `${
                            (adjusted.totalInterest /
                              Math.max(
                                original.totalInterest,
                                adjusted.totalInterest,
                                1
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{money(adjusted.totalInterest)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="scenario-section">
              <h3>
                <Wallet size={17} />
                What happens to your monthly budget?
              </h3>

              <div className="scenario-budget-comparison">
                <div className="scenario-budget-card">
                  <span>Original remaining amount</span>
                  <strong className={isOriginalOverBudget ? 'negative-value' : ''}>
                    {money(originalRemaining)}
                  </strong>
                  <small>After existing commitments and loan payment</small>
                </div>

                <div className="scenario-budget-card adjusted">
                  <span>Adjusted remaining amount</span>
                  <strong className={isAdjustedOverBudget ? 'negative-value' : ''}>
                    {money(adjustedRemaining)}
                  </strong>
                  <small>After existing commitments and new payment</small>
                </div>
              </div>

              {hasIncome ? (
                <div className="scenario-income-visual">
                  <div className="scenario-income-heading">
                    <span>Income committed to monthly costs</span>
                    <strong>
                      {adjustedCommittedPercent.toFixed(1)}%
                    </strong>
                  </div>

                  <div className="scenario-income-track">
                    <div
                      className="scenario-income-fill"
                      style={{
                        width: `${Math.min(adjustedCommittedPercent, 100)}%`,
                      }}
                    />
                    {adjustedCommittedPercent > 100 && (
                      <div className="scenario-income-overflow" />
                    )}
                  </div>

                  <div className="scenario-income-labels">
                    <span>Adjusted scenario</span>
                    <span>{money(initialValues.income)} monthly income</span>
                  </div>
                </div>
              ) : (
                <p className="scenario-footnote">
                  Budget allocation is unavailable because no monthly income
                  was entered.
                </p>
              )}
            </div>

            <div className="scenario-section">
              <h3>
                <Calculator size={17} />
                What changed?
              </h3>

              <div className="scenario-change-list">
                <ChangeIndicator
                  label="Monthly payment"
                  original={original.monthlyPayment}
                  adjusted={adjusted.monthlyPayment}
                  inverse
                />

                <ChangeIndicator
                  label="Total repayment"
                  original={original.totalRepayment}
                  adjusted={adjusted.totalRepayment}
                  inverse
                />

                <ChangeIndicator
                  label="Total interest"
                  original={original.totalInterest}
                  adjusted={adjusted.totalInterest}
                  inverse
                />

                <ChangeIndicator
                  label="Remaining monthly amount"
                  original={original.remaining}
                  adjusted={adjusted.remaining}
                />
              </div>
            </div>

            <div
              className={`scenario-insight ${
                isAdjustedOverBudget ? 'scenario-insight-warning' : ''
              }`}
            >
              {isAdjustedOverBudget ? (
                <AlertTriangle size={19} />
              ) : (
                <CheckCircle2 size={19} />
              )}

              <div>
                <strong>
                  {isAdjustedOverBudget
                    ? 'The adjusted scenario exceeds your entered budget'
                    : 'Your adjusted scenario has a positive estimated balance'}
                </strong>
                <p>
                  {isAdjustedOverBudget
                    ? `Your entered monthly commitments exceed take-home income by ${money(
                        Math.abs(adjusted.remaining)
                      )}. Consider reviewing the assumptions and loan terms.`
                    : `After the entered expenses, existing debt payments, and adjusted loan payment, the estimated remaining amount is ${money(
                        adjusted.remaining
                      )}. This does not account for unexpected costs.`}
                </p>
              </div>
            </div>

            <p className="scenario-disclaimer">
              These are mathematical estimates based on the entered loan
              details and a fixed monthly payment assumption. Actual loan
              offers, fees, and terms may differ. A positive remaining amount
              is not a guarantee of affordability or loan approval.
            </p>
          </section>
        </div>

        <div className="scenario-footer">
          <button className="scenario-back-button" onClick={onBack}>
            <ArrowLeft size={17} />
            Return to assessment
          </button>
        </div>
      </div>
    </main>
  )
}

export default ScenarioExplorer
