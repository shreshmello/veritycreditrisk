
import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CircleHelp,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'

import { saveAssessment } from './assessments'
import ScenarioExplorer from './ScenarioExplorer'
import './PersonalAssessment.css'

type FormData = {
  loanType: string
  amount: string
  apr: string
  months: string
  income: string
  expenses: string
  existingDebt: string
}

type Assessment = {
  status: string
  label: string
  summary: string
  observations: string[]
  next_steps: string[]
  explanation?: string
}

type AnalysisResult = {
  monthly_payment: number
  total_repayment: number
  total_interest: number
  remaining_before_loan: number
  remaining_after_loan: number
  payment_as_percent_of_income: number | null
  cash_flow_status: string
  assessment: Assessment
  notice: string
}

type Props = {
  onBack: () => void
}

const initialData: FormData = {
  loanType: 'Personal loan',
  amount: '',
  apr: '',
  months: '36',
  income: '',
  expenses: '',
  existingDebt: '',
}

const money = (value: number) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })

const percent = (value: number) => `${value.toFixed(1)}%`

/* =========================================
   VISUAL COMPONENTS
   ========================================= */

type BudgetSegment = {
  label: string
  value: number
  color: string
}

function BudgetDonut({
  income,
  expenses,
  existingDebt,
  payment,
  remaining,
}: {
  income: number
  expenses: number
  existingDebt: number
  payment: number
  remaining: number
}) {
  const outflow = expenses + existingDebt + payment
  const hasIncome = income > 0
  const isOverBudget = remaining < 0

  const segments: BudgetSegment[] = [
    { label: 'Living expenses', value: expenses, color: '#397c72' },
    { label: 'Existing debt', value: existingDebt, color: '#82aaa0' },
    { label: 'New loan payment', value: payment, color: '#d7a45c' },
    ...(remaining > 0
      ? [{ label: 'Remaining', value: remaining, color: '#dce9df' }]
      : []),
  ].filter((segment) => segment.value > 0)

  const total = isOverBudget ? outflow : income
  const circumference = 2 * Math.PI * 42

  let offset = 0

  return (
    <div className="visual-budget-layout">
      <div className="budget-donut-wrap">
        {hasIncome ? (
          <svg
            className="budget-donut"
            viewBox="0 0 100 100"
            role="img"
            aria-label={
              isOverBudget
                ? 'Monthly outflow breakdown. Expenses exceed income.'
                : 'Monthly income allocation breakdown.'
            }
          >
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#edf1ed"
              strokeWidth="11"
            />

            {segments.map((segment) => {
              const segmentLength =
                (segment.value / total) * circumference
              const currentOffset = offset
              offset += segmentLength

              return (
                <circle
                  key={segment.label}
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="11"
                  strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                  strokeDashoffset={-currentOffset}
                  transform="rotate(-90 50 50)"
                  strokeLinecap="butt"
                />
              )
            })}
          </svg>
        ) : (
          <div className="budget-donut-empty">
            <CircleHelp size={24} />
          </div>
        )}

        <div className="budget-donut-center">
          <span>{hasIncome ? 'MONTHLY' : 'INCOME'}</span>
          <strong>{hasIncome ? money(income) : 'Not entered'}</strong>
          <small>{hasIncome ? 'take-home income' : 'Unavailable'}</small>
        </div>
      </div>

      <div className="budget-legend">
        {segments.map((segment) => (
          <div className="budget-legend-item" key={segment.label}>
            <span
              className="budget-legend-dot"
              style={{ backgroundColor: segment.color }}
            />
            <span>{segment.label}</span>
            <strong>{money(segment.value)}</strong>
          </div>
        ))}
      </div>

      {!hasIncome && (
        <p className="chart-footnote">
          A budget allocation chart is unavailable because monthly income was
          entered as $0.
        </p>
      )}

      {isOverBudget && (
        <div className="chart-warning">
          <AlertTriangle size={16} />
          <span>
            Monthly commitments exceed income by {money(Math.abs(remaining))}.
            The donut shows each category as a share of total outflow.
          </span>
        </div>
      )}

      {!isOverBudget && hasIncome && (
        <p className="chart-footnote">
          The chart shows how your estimated monthly take-home income is
          allocated across expenses, debt payments, the new loan, and remaining
          money.
        </p>
      )}
    </div>
  )
}

function CashFlowComparison({
  before,
  after,
  payment,
}: {
  before: number
  after: number
  payment: number
}) {
  const maxValue = Math.max(Math.abs(before), Math.abs(after), payment, 1)
  const beforeWidth = Math.min(100, (Math.max(before, 0) / maxValue) * 100)
  const afterWidth = Math.min(100, (Math.max(after, 0) / maxValue) * 100)

  return (
    <div className="cash-flow-visual">
      <div className="cash-flow-comparison">
        <div className="cash-flow-item">
          <div className="cash-flow-label">
            <span>Before the new loan</span>
            <strong className={before < 0 ? 'negative-value' : ''}>
              {money(before)}
            </strong>
          </div>
          <div className="cash-flow-track">
            <div
              className={`cash-flow-fill ${before < 0 ? 'is-negative' : ''}`}
              style={{ width: `${beforeWidth}%` }}
            />
          </div>
        </div>

        <div className="cash-flow-arrow">
          <ArrowDownRight size={19} />
          <span>After adding {money(payment)} per month</span>
        </div>

        <div className="cash-flow-item">
          <div className="cash-flow-label">
            <span>After the new loan</span>
            <strong className={after < 0 ? 'negative-value' : ''}>
              {money(after)}
            </strong>
          </div>
          <div className="cash-flow-track">
            <div
              className={`cash-flow-fill ${after < 0 ? 'is-negative' : ''}`}
              style={{ width: `${afterWidth}%` }}
            />
          </div>
        </div>
      </div>

      <div className={`cash-flow-change ${after < 0 ? 'change-warning' : ''}`}>
        {after < before ? (
          <ArrowDownRight size={18} />
        ) : after > before ? (
          <ArrowUpRight size={18} />
        ) : null}
        <span>
          Your estimated remaining monthly amount changes by {money(payment)}.
        </span>
      </div>

      <p className="chart-footnote">
        This comparison is based on the figures entered. It does not account
        for unexpected costs or changes in income.
      </p>
    </div>
  )
}

function LoanCostVisual({
  amount,
  totalRepayment,
  totalInterest,
}: {
  amount: number
  totalRepayment: number
  totalInterest: number
}) {
  const principalShare =
    totalRepayment > 0
      ? Math.min(100, (amount / totalRepayment) * 100)
      : 0

  const interestShare = Math.max(0, 100 - principalShare)

  return (
    <div className="loan-cost-visual">
      <div className="loan-cost-total">
        <span>Estimated total repayment</span>
        <strong>{money(totalRepayment)}</strong>
      </div>

      <div
        className="loan-cost-stack"
        role="img"
        aria-label={`Estimated repayment consists of ${money(amount)} principal and ${money(totalInterest)} interest.`}
      >
        <div
          className="loan-cost-principal"
          style={{ width: `${principalShare}%` }}
        />
        <div
          className="loan-cost-interest"
          style={{ width: `${interestShare}%` }}
        />
      </div>

      <div className="loan-cost-legend">
        <div>
          <span className="budget-legend-dot principal-dot" />
          <span>Loan principal</span>
          <strong>{money(amount)}</strong>
        </div>
        <div>
          <span className="budget-legend-dot interest-dot" />
          <span>Estimated interest</span>
          <strong>{money(totalInterest)}</strong>
        </div>
      </div>

      <p className="chart-footnote">
        This is an estimate based on the entered APR and repayment period.
        Actual lender fees or loan terms may change the total.
      </p>
    </div>
  )
}

function BudgetAllocationBar({
  income,
  expenses,
  existingDebt,
  payment,
}: {
  income: number
  expenses: number
  existingDebt: number
  payment: number
}) {
  const total = expenses + existingDebt + payment
  const hasIncome = income > 0
  const committedPercent = hasIncome ? (total / income) * 100 : 0
  const isOver = committedPercent > 100

  const segments = [
    { label: 'Living expenses', value: expenses, color: '#397c72' },
    { label: 'Existing debt', value: existingDebt, color: '#82aaa0' },
    { label: 'New loan', value: payment, color: '#d7a45c' },
  ]

  return (
    <div className="allocation-visual">
      <div className="allocation-heading">
        <span>Monthly income committed</span>
        <strong className={isOver ? 'negative-value' : ''}>
          {hasIncome ? percent(committedPercent) : 'Unavailable'}
        </strong>
      </div>

      <div className="allocation-track">
        {hasIncome ? (
          <>
            <div className="allocation-segments">
              {segments.map((segment) => (
                <div
                  key={segment.label}
                  className="allocation-segment"
                  style={{
                    width: `${Math.min(100, (segment.value / income) * 100)}%`,
                    backgroundColor: segment.color,
                  }}
                />
              ))}
            </div>
            {isOver && <div className="allocation-overflow" />}
          </>
        ) : (
          <div className="allocation-unavailable" />
        )}
      </div>

      <div className="allocation-labels">
        <span>
          {hasIncome
            ? `${money(total)} committed`
            : 'Enter income above $0 to see allocation'}
        </span>
        {hasIncome && (
          <span>
            {isOver
              ? `${money(total - income)} above income`
              : `${money(income - total)} remaining`}
          </span>
        )}
      </div>

      <p className="chart-footnote">
        This bar compares monthly commitments with take-home income. It is not
        a lender affordability or approval score.
      </p>
    </div>
  )
}

/* =========================================
   DECISION EXPLANATION
   ========================================= */

function DecisionExplanation({
  result,
  income,
}: {
  result: AnalysisResult
  income: number
}) {
  const before = result.remaining_before_loan
  const after = result.remaining_after_loan
  const paymentShare = result.payment_as_percent_of_income

  const reasons: string[] = []

  if (income <= 0) {
    reasons.push(
      'Monthly take-home income was entered as $0. Verity cannot calculate how much of your income the new payment would represent.'
    )
  } else {
    if (before < 0) {
      reasons.push(
        `Your existing expenses and debt payments exceed your entered monthly income by ${money(Math.abs(before))}, before adding this loan.`
      )
    } else {
      reasons.push(
        `After the living expenses and existing debt payments you entered, approximately ${money(before)} remains each month before the new loan.`
      )
    }

    if (after < 0) {
      reasons.push(
        `Adding the estimated loan payment would put your listed monthly commitments ${money(Math.abs(after))} above your entered income.`
      )
    } else if (after === 0) {
      reasons.push(
        'The estimated payment would use the entire amount remaining after your listed expenses and existing debt payments.'
      )
    } else {
      reasons.push(
        `After adding the estimated payment, approximately ${money(after)} would remain based on the figures entered.`
      )
    }

    if (paymentShare !== null) {
      reasons.push(
        `The new loan payment represents ${paymentShare.toFixed(1)}% of your entered monthly take-home income.`
      )
    }
  }

  const missingContext = [
    'Unexpected expenses, emergencies, and changes in income.',
    'Whether your income and expenses are stable throughout the year.',
    'Lender fees, origination charges, late fees, and other costs not included in the entered APR.',
    'Your savings, financial goals, and other upcoming commitments.',
    'The lender’s actual eligibility requirements and final loan terms.',
  ]

  const questions = [
    'Is the quoted APR fixed or variable for the full repayment period?',
    'Are there origination fees, prepayment penalties, or other charges?',
    'Can the monthly payment or repayment period change?',
    'Would you still have a reasonable buffer if an unexpected expense came up?',
    'Have you compared the total repayment amount with other available offers?',
  ]

  return (
    <div className="decision-explanation">
      <div className="decision-explanation-heading">
        <span className="section-kicker">UNDERSTANDING YOUR RESULT</span>
        <h3>Why Verity reached this result</h3>
        <p>
          This explanation uses the figures you entered. It describes the
          calculation, not a prediction of what a lender will decide.
        </p>
      </div>

      <div className="decision-explanation-block">
        <h4>What influenced your result</h4>

        {reasons.map((reason, index) => (
          <div className="decision-explanation-item" key={index}>
            <span className="decision-explanation-number">
              {index + 1}
            </span>
            <p>{reason}</p>
          </div>
        ))}

        {result.assessment.explanation && (
          <p className="decision-explanation-backend">
            {result.assessment.explanation}
          </p>
        )}
      </div>

      <div className="decision-explanation-block">
        <h4>What this calculation assumes</h4>
        <ul>
          <li>
            Your entered income, living expenses, and existing debt payments
            represent a typical month.
          </li>
          <li>
            The entered APR and repayment period remain unchanged.
          </li>
          <li>
            The estimated loan payment is made monthly for the full term.
          </li>
          <li>
            No additional lender fees or charges are included unless reflected
            in the figures you entered.
          </li>
        </ul>
      </div>

      <div className="decision-explanation-block">
        <h4>What Verity doesn't know yet</h4>
        <p className="decision-explanation-intro">
          These details aren't included in the current calculation, but they
          could affect your actual financial situation.
        </p>

        <ul>
          {missingContext.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="decision-explanation-questions">
        <div>
          <span className="section-kicker">BEFORE YOU DECIDE</span>
          <h4>Questions worth asking</h4>
        </div>

        {questions.map((question, index) => (
          <div className="decision-question" key={index}>
            <CircleHelp size={17} />
            <p>{question}</p>
          </div>
        ))}
      </div>

      <p className="decision-explanation-footnote">
        Verity's result is a budgeting estimate based on the information
        provided. It is not a credit decision, financial recommendation, or
        guarantee that a loan is affordable.
      </p>
    </div>
  )
}

/* =========================================
   MAIN ASSESSMENT
   ========================================= */

function PersonalAssessment({ onBack }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initialData)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const [assessmentTitle, setAssessmentTitle] = useState(
    'Personal loan assessment'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [showScenario, setShowScenario] = useState(false)

  const update = (field: keyof FormData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setIsSaved(false)
    setSaveError('')
  }

  const amount = Number(form.amount)
  const apr = Number(form.apr)
  const months = Number(form.months)
  const income = Number(form.income)
  const expenses = Number(form.expenses)
  const existingDebt = Number(form.existingDebt)

  const stepOneValid =
    form.amount !== '' &&
    form.apr !== '' &&
    form.months !== '' &&
    amount > 0 &&
    apr >= 0 &&
    apr <= 100 &&
    months >= 1 &&
    months <= 360

  const stepTwoValid =
    form.income !== '' &&
    form.expenses !== '' &&
    form.existingDebt !== '' &&
    income >= 0 &&
    expenses >= 0 &&
    existingDebt >= 0

  const analyzeLoan = async () => {
    setIsAnalyzing(true)
    setError('')
    setResult(null)
    setIsSaved(false)
    setSaveError('')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/personal/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            loan_amount: amount,
            apr_percent: apr,
            term_months: months,
            monthly_income: income,
            monthly_expenses: expenses,
            existing_debt_payments: existingDebt,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        throw new Error(
          errorData?.detail ||
            'We could not analyze this assessment. Please check your answers and try again.'
        )
      }

      const data: AnalysisResult = await response.json()

      setResult(data)
      setStep(2)
    } catch (err) {
      console.error('Personal assessment error:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to Verity. Make sure the backend is running.'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = async () => {
    const title = assessmentTitle.trim()

    if (!result || !title || isSaving || isSaved) return

    setIsSaving(true)
    setSaveError('')

    try {
      await saveAssessment({
        title,
        assessmentType: 'personal',
        inputData: {
          ...form,
          amount,
          apr,
          months,
          income,
          expenses,
          existingDebt,
        },
        resultData: {
          ...result,
          label: result.assessment.label,
          summary: result.assessment.summary,
        },
      })

      setIsSaved(true)
    } catch (err) {
      console.error('Personal assessment save error:', err)

      setSaveError(
        err instanceof Error
          ? err.message
          : 'We could not save this assessment. Please try again.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const resetAssessment = () => {
    setStep(0)
    setForm(initialData)
    setResult(null)
    setError('')
    setAssessmentTitle('Personal loan assessment')
    setIsSaving(false)
    setIsSaved(false)
    setSaveError('')
    setShowScenario(false)
  }

  if (showScenario && result) {
    return (
      <ScenarioExplorer
        initialValues={{
          amount,
          apr,
          months,
          income,
          expenses,
          existingDebt,
        }}
        onBack={() => setShowScenario(false)}
      />
    )
  }

  const statusClass = result?.assessment.status
    ? result.assessment.status.replaceAll('_', '-')
    : ''

  return (
    <main className="assessment-page">
      <header className="assessment-nav">
       <button className="assessment-brand" onClick={onBack}>
  <img
    src="/verity-logo.png"
    alt="Verity"
    className="assessment-logo"
  />
</button>

        <div className="assessment-nav-label">PERSONAL BORROWING</div>

        <button className="exit-button" onClick={onBack}>
          Exit assessment
        </button>
      </header>

      <div className="assessment-layout">
        <aside className="assessment-sidebar">
          <span className="section-kicker">PERSONAL DECISION SUPPORT</span>

          <h1>
            Understand your loan
            <span> before deciding.</span>
          </h1>

          <p>
            Explore the potential cost of borrowing, understand how a payment
            could fit into your monthly budget, and identify questions worth
            asking before making a decision.
          </p>

          <div className="assessment-steps">
            {[
              ['1', 'Loan details', 'Tell us about the loan'],
              ['2', 'Monthly finances', 'Understand your budget'],
              ['3', 'Your results', 'Review your assessment'],
            ].map(([number, title, description], index) => (
              <div
                className={`assessment-step ${step >= index ? 'active' : ''}`}
                key={number}
              >
                <span className="step-circle">
                  {step > index ? <CheckCircle2 size={17} /> : number}
                </span>

                <div>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="privacy-note">
            <ShieldCheck size={19} />
            <div>
              <strong>Your information, your decision</strong>
              <p>
                You choose whether to save your completed assessment to your
                Verity account. This tool does not approve or reject loans.
              </p>
            </div>
          </div>
        </aside>

        <section className="assessment-main">
          <div className="assessment-progress">
            <div>
              <span>STEP {step + 1} OF 3</span>
              <span>{Math.round(((step + 1) / 3) * 100)}% COMPLETE</span>
            </div>

            <div className="progress-track">
              <div
                style={{
                  width: `${((step + 1) / 3) * 100}%`,
                }}
              />
            </div>
          </div>

          {step === 0 && (
            <div className="assessment-form">
              <span className="section-kicker">THE LOAN</span>

              <h2>What are you considering borrowing?</h2>

              <p className="form-description">
                Start with the basic terms of the loan you're exploring. You
                can adjust these details later.
              </p>

              <div className="field-group">
                <label htmlFor="loanType">What type of loan is it?</label>

                <select
                  id="loanType"
                  value={form.loanType}
                  onChange={(e) => update('loanType', e.target.value)}
                >
                  <option>Personal loan</option>
                  <option>Auto loan</option>
                  <option>Student loan</option>
                  <option>Debt consolidation loan</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="field-group">
                <label htmlFor="amount">How much are you considering?</label>

                <div className="input-with-prefix">
                  <span>$</span>
                  <input
                    id="amount"
                    type="number"
                    min="1"
                    placeholder="e.g. 10,000"
                    value={form.amount}
                    onChange={(e) => update('amount', e.target.value)}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label htmlFor="apr">Annual interest rate (APR)</label>

                  <div className="input-with-suffix">
                    <input
                      id="apr"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="e.g. 8.5"
                      value={form.apr}
                      onChange={(e) => update('apr', e.target.value)}
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="months">Repayment period</label>

                  <select
                    id="months"
                    value={form.months}
                    onChange={(e) => update('months', e.target.value)}
                  >
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                    <option value="48">48 months</option>
                    <option value="60">60 months</option>
                    <option value="72">72 months</option>
                    <option value="84">84 months</option>
                    <option value="120">120 months</option>
                  </select>
                </div>
              </div>

              <div className="help-box">
                <CircleHelp size={18} />
                <p>
                  <strong>Not sure about the APR?</strong>
                  Use an estimated rate for now. You can compare different
                  interest rates by running another assessment.
                </p>
              </div>

              <button
                className="assessment-continue"
                onClick={() => setStep(1)}
                disabled={!stepOneValid}
              >
                Continue to monthly finances <ArrowRight size={17} />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="assessment-form">
              <span className="section-kicker">YOUR MONTHLY FINANCES</span>

              <h2>How does your monthly budget look?</h2>

              <p className="form-description">
                These details help estimate how a potential loan payment could
                fit into your existing monthly commitments.
              </p>

              <div className="field-group">
                <label htmlFor="income">Monthly take-home income</label>

                <div className="input-with-prefix">
                  <span>$</span>
                  <input
                    id="income"
                    type="number"
                    min="0"
                    placeholder="e.g. 4,500"
                    value={form.income}
                    onChange={(e) => update('income', e.target.value)}
                  />
                </div>

                <small>
                  Enter the amount you receive after taxes each month.
                </small>
              </div>

              <div className="field-group">
                <label htmlFor="expenses">Monthly living expenses</label>

                <div className="input-with-prefix">
                  <span>$</span>
                  <input
                    id="expenses"
                    type="number"
                    min="0"
                    placeholder="e.g. 2,000"
                    value={form.expenses}
                    onChange={(e) => update('expenses', e.target.value)}
                  />
                </div>

                <small>
                  Include regular costs such as housing, food, utilities, and
                  transportation.
                </small>
              </div>

              <div className="field-group">
                <label htmlFor="existingDebt">
                  Existing monthly debt payments
                </label>

                <div className="input-with-prefix">
                  <span>$</span>
                  <input
                    id="existingDebt"
                    type="number"
                    min="0"
                    placeholder="e.g. 350"
                    value={form.existingDebt}
                    onChange={(e) => update('existingDebt', e.target.value)}
                  />
                </div>

                <small>
                  Enter the amount you pay toward other loans or credit each
                  month, not your total outstanding balances.
                </small>
              </div>

              <div className="help-box">
                <CircleHelp size={18} />
                <p>
                  <strong>Estimates are okay.</strong>
                  If your income or expenses vary, use a representative
                  monthly estimate. The results depend on the information you
                  provide.
                </p>
              </div>

              {error && (
                <div className="api-error" role="alert">
                  <AlertTriangle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="assessment-button-row">
                <button
                  className="assessment-back"
                  onClick={() => setStep(0)}
                  disabled={isAnalyzing}
                >
                  <ArrowLeft size={17} /> Back
                </button>

                <button
                  className="assessment-continue"
                  onClick={analyzeLoan}
                  disabled={!stepTwoValid || isAnalyzing}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze my decision'}
                  {!isAnalyzing && <ArrowRight size={17} />}
                </button>
              </div>
            </div>
          )}

          {step === 2 && result && (
            <div className="results-form">
              <div className="results-header">
                <span className="results-eyebrow">YOUR ASSESSMENT</span>

                <div className={`results-status ${statusClass}`}>
                  {result.assessment.status === 'no_immediate_budget_concern' ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                  <span>{result.assessment.label}</span>
                </div>

                <h2>{result.assessment.summary}</h2>

                <p className="form-description">
                  This assessment is based on the loan details and monthly
                  financial information you entered.
                </p>
              </div>

              <div className="results-payment">
                <span>ESTIMATED MONTHLY LOAN PAYMENT</span>
                <strong>{money(result.monthly_payment)}</strong>
                <small>
                  For {months} months at {apr}% APR
                </small>
              </div>

              <DecisionExplanation
                result={result}
                income={income}
              />

              <div className="results-section">
                <div className="results-section-heading">
                  <div>
                    <span className="section-kicker">YOUR MONTHLY MONEY</span>
                    <h3>Where your income goes</h3>
                  </div>
                  <span>Estimated amounts</span>
                </div>

                <BudgetDonut
                  income={income}
                  expenses={expenses}
                  existingDebt={existingDebt}
                  payment={result.monthly_payment}
                  remaining={result.remaining_after_loan}
                />
              </div>

              <div className="results-section">
                <div className="results-section-heading">
                  <div>
                    <span className="section-kicker">BEFORE & AFTER</span>
                    <h3>How the loan changes your budget</h3>
                  </div>
                </div>

                <CashFlowComparison
                  before={result.remaining_before_loan}
                  after={result.remaining_after_loan}
                  payment={result.monthly_payment}
                />
              </div>

              <div className="results-section">
                <div className="results-section-heading">
                  <div>
                    <span className="section-kicker">INCOME ALLOCATION</span>
                    <h3>How much is already committed?</h3>
                  </div>
                </div>

                <BudgetAllocationBar
                  income={income}
                  expenses={expenses}
                  existingDebt={existingDebt}
                  payment={result.monthly_payment}
                />
              </div>

              <div className="results-section">
                <div className="results-section-heading">
                  <div>
                    <span className="section-kicker">TOTAL LOAN COST</span>
                    <h3>What makes up your repayment?</h3>
                  </div>
                </div>

                <LoanCostVisual
                  amount={amount}
                  totalRepayment={result.total_repayment}
                  totalInterest={result.total_interest}
                />
              </div>

              <div className="results-section">
                <h3 className="results-section-title">
                  Monthly budget breakdown
                </h3>

                <div className="budget-breakdown">
                  <div className="budget-row">
                    <span>Monthly take-home income</span>
                    <strong>{money(income)}</strong>
                  </div>

                  <div className="budget-row">
                    <span>Living expenses</span>
                    <strong>{money(expenses)}</strong>
                  </div>

                  <div className="budget-row">
                    <span>Existing debt payments</span>
                    <strong>{money(existingDebt)}</strong>
                  </div>

                  <div className="budget-row">
                    <span>Estimated new loan payment</span>
                    <strong>{money(result.monthly_payment)}</strong>
                  </div>

                  <div className="budget-row budget-total">
                    <span>Estimated remaining monthly amount</span>
                    <strong
                      className={
                        result.remaining_after_loan < 0
                          ? 'negative-value'
                          : ''
                      }
                    >
                      {money(result.remaining_after_loan)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="results-section">
                <h3 className="results-section-title">The cost of borrowing</h3>

                <div className="loan-cost-grid">
                  <div className="loan-cost-card">
                    <span>Total repayment</span>
                    <strong>{money(result.total_repayment)}</strong>
                  </div>

                  <div className="loan-cost-card">
                    <span>Total interest</span>
                    <strong>{money(result.total_interest)}</strong>
                  </div>

                  <div className="loan-cost-card">
                    <span>Payment as share of income</span>
                    <strong>
                      {result.payment_as_percent_of_income === null
                        ? 'Unavailable'
                        : `${result.payment_as_percent_of_income.toFixed(1)}%`}
                    </strong>
                  </div>
                </div>
              </div>

              {result.assessment.observations.length > 0 && (
                <div className="results-section">
                  <h3 className="results-section-title">What stands out</h3>

                  <div className="observation-list">
                    {result.assessment.observations.map(
                      (observation, index) => (
                        <div className="observation-item" key={index}>
                          <span className="observation-dot" />
                          <p>{observation}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {result.assessment.next_steps.length > 0 && (
                <div className="results-section">
                  <h3 className="results-section-title">
                    Questions and next steps
                  </h3>

                  <div className="next-step-list">
                    {result.assessment.next_steps.map((nextStep, index) => (
                      <div className="next-step-item" key={index}>
                        <span>{index + 1}</span>
                        <p>{nextStep}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="results-note">
                <ShieldCheck size={19} />
                <p>
                  <strong>Important:</strong> {result.notice}{' '}
                  Verity provides estimates and decision support, not a loan
                  approval, rejection, or guarantee of affordability.
                </p>
              </div>

              <div className="assessment-save-panel">
                <h3>Save this assessment</h3>

                <p>
                  Give this assessment a name so you can find it in My
                  Decisions later.
                </p>

                <div className="field-group">
                  <label htmlFor="assessmentTitle">Assessment name</label>
                  <input
                    id="assessmentTitle"
                    type="text"
                    maxLength={80}
                    value={assessmentTitle}
                    onChange={(e) => {
                      setAssessmentTitle(e.target.value)
                      setSaveError('')
                    }}
                    placeholder="e.g. Personal loan review"
                  />
                </div>

                {saveError && (
                  <p className="assessment-save-error" role="alert">
                    {saveError}
                  </p>
                )}

                {isSaved && (
                  <p className="assessment-save-success" role="status">
                    <CheckCircle2 size={17} />
                    Saved to My Decisions.
                  </p>
                )}

                <button
                  className="assessment-continue"
                  onClick={handleSave}
                  disabled={isSaving || isSaved || !assessmentTitle.trim()}
                >
                  {isSaving
                    ? 'Saving...'
                    : isSaved
                      ? 'Saved to My Decisions'
                      : 'Save to My Decisions'}
                  {!isSaving && !isSaved && <CheckCircle2 size={17} />}
                </button>
              </div>

              <div className="results-actions">
                <button
                  className="assessment-back"
                  onClick={() => {
                    setStep(1)
                    setIsSaved(false)
                    setSaveError('')
                  }}
                >
                  <ArrowLeft size={17} /> Edit finances
                </button>

                <button
                  className="assessment-continue"
                  onClick={() => setShowScenario(true)}
                >
                  Explore scenarios <ArrowRight size={17} />
                </button>

                <button
                  className="assessment-continue"
                  onClick={resetAssessment}
                >
                  <RotateCcw size={16} /> Start again
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default PersonalAssessment
