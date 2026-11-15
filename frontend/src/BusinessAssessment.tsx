
import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  Info,
} from 'lucide-react'

import { saveAssessment } from './assessments'
import './BusinessAssessment.css'

type BusinessData = {
  transactionType: string
  amount: string
  deposit: string
  paymentDays: string
  customerRelationship: string
  paymentHistory: string
  additionalContext: string
}

type Props = {
  onBack: () => void
}

const initialData: BusinessData = {
  transactionType: 'Sale of goods',
  amount: '',
  deposit: '0',
  paymentDays: '30',
  customerRelationship: 'New customer',
  paymentHistory: 'Unknown',
  additionalContext: '',
}

const money = (value: number) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })

const percent = (value: number) => `${value.toFixed(1)}%`

function BusinessAssessment({ onBack }: Props) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<BusinessData>(initialData)

  const [assessmentTitle, setAssessmentTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const update = (field: keyof BusinessData, value: string) => {
    setData((current) => ({
      ...current,
      [field]: value,
    }))

    setIsSaved(false)
    setSaveError('')
  }

  const amount = Number(data.amount)
  const deposit = Number(data.deposit)
  const outstanding = Math.max(0, amount - deposit)

  const validTransaction =
    data.amount.trim() !== '' &&
    data.deposit.trim() !== '' &&
    Number.isFinite(amount) &&
    Number.isFinite(deposit) &&
    amount > 0 &&
    deposit >= 0 &&
    deposit <= amount

  const depositCoverage =
    amount > 0 ? (deposit / amount) * 100 : 0

  const outstandingPercent =
    amount > 0 ? (outstanding / amount) * 100 : 0

  const next = () => {
    setStep((current) => Math.min(2, current + 1))
  }

  const resetAssessment = () => {
    setStep(0)
    setData(initialData)
    setAssessmentTitle('')
    setIsSaving(false)
    setIsSaved(false)
    setSaveError('')
  }

  const getTransactionObservations = () => {
    const observations: string[] = []

    observations.push(
      `${percent(depositCoverage)} of the transaction is covered by the upfront payment.`
    )

    observations.push(
      `${money(outstanding)} (${percent(outstandingPercent)}) remains unpaid under the proposed arrangement.`
    )

    if (deposit === 0) {
      observations.push(
        'There is no upfront payment in this arrangement. The full transaction amount remains unpaid.'
      )
    } else if (deposit === amount) {
      observations.push(
        'The upfront payment covers the full transaction amount. There is no remaining balance in this calculation.'
      )
    }

    observations.push(
      `The proposed payment deadline is ${data.paymentDays} days. Consider whether your business can manage the transaction costs during that period.`
    )

    return observations
  }

  const getReviewChecklist = () => {
    const checklist = [
      'Can your business cover the costs of fulfilling this transaction before the remaining payment arrives?',
      'Are the payment deadline, payment method, and consequences of late payment clearly documented?',
      'Is the proposed deposit sufficient to cover the initial costs of this particular order?',
      'Have you checked relevant payment records that you are authorized to review?',
      'Would installments, a larger deposit, or a smaller initial order make the arrangement easier to manage?',
    ]

    if (data.paymentHistory === 'Unknown') {
      checklist.push(
        'Is there reliable payment information you are authorized to review, or should this information remain unknown?'
      )
    }

    if (data.paymentHistory === 'Has overdue payments') {
      checklist.push(
        'If previous overdue payments are documented, have you confirmed the relevant details and discussed a clear payment arrangement?'
      )
    }

    if (data.customerRelationship === 'New customer') {
      checklist.push(
        'Are the business terms, delivery expectations, and payment responsibilities clear to both parties?'
      )
    }

    return checklist
  }

  const handleSave = async () => {
    const title = assessmentTitle.trim()

    if (!title) {
      setSaveError('Please enter a name for this assessment.')
      return
    }

    if (!validTransaction || isSaving || isSaved) return

    setIsSaving(true)
    setSaveError('')

    const observations = getTransactionObservations()
    const checklist = getReviewChecklist()

    try {
      await saveAssessment({
        title,
        assessmentType: 'business',

        inputData: {
          ...data,
          amount,
          deposit,
          outstanding,
          depositCoveragePercent: depositCoverage,
          outstandingPercent,
        },

        resultData: {
          label: 'Business transaction review',

          summary: `${money(outstanding)} remains unpaid out of a ${money(amount)} transaction, with a proposed ${data.paymentDays}-day payment deadline.`,

          transactionValue: amount,
          upfrontPayment: deposit,
          outstandingAmount: outstanding,
          depositCoveragePercent: depositCoverage,
          outstandingPercent,
          paymentDeadlineDays: Number(data.paymentDays),

          observations,
          reviewChecklist: checklist,

          customerContext: {
            relationship: data.customerRelationship,
            paymentHistory: data.paymentHistory,
            additionalContext: data.additionalContext,
          },

          explanation:
            'Verity calculates the portion of the transaction covered by the upfront payment and the remaining unpaid amount. Customer relationship and payment history are recorded as context, not converted into a credit score or prediction.',

          limitations: [
            'This calculation does not predict whether a customer will pay.',
            'The calculation does not account for business operating costs, taxes, or unexpected expenses.',
            'Customer relationship and payment history do not independently establish future payment behavior.',
            'The historical research model has not been validated for this business transaction.',
          ],

          note:
            'This is a transaction review, not a prediction of customer payment behavior or a recommendation to approve or reject a customer.',
        },
      })

      setIsSaved(true)
    } catch (error) {
      console.error('Business assessment save error:', error)

      setSaveError(
        error instanceof Error
          ? error.message
          : 'We could not save this assessment. Please try again.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const observations = getTransactionObservations()
  const checklist = getReviewChecklist()

  return (
    <main className="business-page">
      <header className="business-nav">
        <button
  className="business-brand"
  onClick={onBack}
  aria-label="Back to Verity"
>
  <img
    src="/verity-logo.png"
    alt="Verity"
    className="business-logo"
  />
</button>

        <div className="business-nav-label">SMALL BUSINESS</div>

        <button className="business-exit" onClick={onBack}>
          Exit assessment
        </button>
      </header>

      <div className="business-layout">
        <aside className="business-sidebar">
          <span className="business-kicker">
            BUSINESS DECISION SUPPORT
          </span>

          <h1>
            Make payment decisions
            <span> with more clarity.</span>
          </h1>

          <p>
            Explore a customer transaction, understand how much money is at
            stake, and identify questions worth reviewing before you decide.
          </p>

          <div className="business-steps">
            {[
              ['1', 'Transaction details', 'Define the proposed deal'],
              ['2', 'Customer context', 'Add what you know'],
              ['3', 'Decision review', 'Explore the exposure'],
            ].map(([number, title, description], index) => (
              <div
                className={`business-step ${
                  step >= index ? 'active' : ''
                }`}
                key={number}
              >
                <span className="business-step-number">
                  {step > index ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    number
                  )}
                </span>

                <div>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="business-privacy">
            <ShieldCheck size={19} />

            <div>
              <strong>Designed for transparent decisions</strong>
              <p>
                You choose whether to save this assessment to your Verity
                account. No customer credit decision is made automatically.
              </p>
            </div>
          </div>
        </aside>

        <section className="business-main">
          <div className="business-progress">
            <div>
              <span>STEP {step + 1} OF 3</span>
              <span>
                {Math.round(((step + 1) / 3) * 100)}% COMPLETE
              </span>
            </div>

            <div className="business-progress-track">
              <div
                style={{
                  width: `${((step + 1) / 3) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* STEP 1: TRANSACTION DETAILS */}

          {step === 0 && (
            <div className="business-form">
              <span className="business-kicker">
                THE TRANSACTION
              </span>

              <h2>What decision are you making?</h2>

              <p className="business-description">
                Start with the transaction and the payment arrangement
                you're considering.
              </p>

              <div className="business-field">
                <label htmlFor="transactionType">
                  What is this transaction for?
                </label>

                <select
                  id="transactionType"
                  value={data.transactionType}
                  onChange={(e) =>
                    update('transactionType', e.target.value)
                  }
                >
                  <option>Sale of goods</option>
                  <option>Service contract</option>
                  <option>Wholesale order</option>
                  <option>Recurring business service</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="business-field">
                <label htmlFor="businessAmount">
                  Total transaction amount
                </label>

                <div className="business-input-prefix">
                  <span>$</span>

                  <input
                    id="businessAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 5,000"
                    value={data.amount}
                    onChange={(e) =>
                      update('amount', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="business-field">
                <label htmlFor="deposit">
                  Deposit or upfront payment
                </label>

                <div className="business-input-prefix">
                  <span>$</span>

                  <input
                    id="deposit"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 1,000"
                    value={data.deposit}
                    onChange={(e) =>
                      update('deposit', e.target.value)
                    }
                  />
                </div>

                <small>
                  Enter 0 if the customer will pay nothing upfront.
                </small>
              </div>

              {data.amount !== '' &&
                data.deposit !== '' &&
                Number.isFinite(amount) &&
                Number.isFinite(deposit) &&
                amount > 0 &&
                deposit > amount && (
                  <div className="business-help" role="alert">
                    <AlertTriangle size={18} />
                    <p>
                      The upfront payment cannot be greater than the
                      total transaction amount. Please check both values.
                    </p>
                  </div>
                )}

              <div className="business-field">
                <label htmlFor="paymentDays">
                  Proposed payment deadline
                </label>

                <select
                  id="paymentDays"
                  value={data.paymentDays}
                  onChange={(e) =>
                    update('paymentDays', e.target.value)
                  }
                >
                  <option value="7">Within 7 days</option>
                  <option value="14">Within 14 days</option>
                  <option value="30">Within 30 days</option>
                  <option value="45">Within 45 days</option>
                  <option value="60">Within 60 days</option>
                  <option value="90">Within 90 days</option>
                </select>
              </div>

              <button
                className="business-continue"
                onClick={next}
                disabled={!validTransaction}
              >
                Continue to customer context
                <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* STEP 2: CUSTOMER CONTEXT */}

          {step === 1 && (
            <div className="business-form">
              <span className="business-kicker">
                CUSTOMER CONTEXT
              </span>

              <h2>What do you know about the customer?</h2>

              <p className="business-description">
                Add relevant context if you have it. Unknown information
                is okay; don't guess.
              </p>

              <div className="business-field">
                <label htmlFor="relationship">
                  Customer relationship
                </label>

                <select
                  id="relationship"
                  value={data.customerRelationship}
                  onChange={(e) =>
                    update('customerRelationship', e.target.value)
                  }
                >
                  <option>New customer</option>
                  <option>Returning customer</option>
                  <option>Long-term customer</option>
                </select>
              </div>

              <div className="business-field">
                <label htmlFor="paymentHistory">
                  Previous payment history
                </label>

                <select
                  id="paymentHistory"
                  value={data.paymentHistory}
                  onChange={(e) =>
                    update('paymentHistory', e.target.value)
                  }
                >
                  <option>Unknown</option>
                  <option>Usually pays on time</option>
                  <option>Sometimes pays late</option>
                  <option>Has overdue payments</option>
                  <option>No previous transactions</option>
                </select>

                <small>
                  Use records you are authorized to review. Don't infer
                  payment behavior from personal characteristics.
                </small>
              </div>

              <div className="business-field">
                <label htmlFor="context">
                  Other relevant transaction details (optional)
                </label>

                <textarea
                  id="context"
                  rows={4}
                  maxLength={1000}
                  placeholder="For example: this is a repeat order with a larger-than-usual value..."
                  value={data.additionalContext}
                  onChange={(e) =>
                    update('additionalContext', e.target.value)
                  }
                />

                <small>
                  {data.additionalContext.length}/1000 characters
                </small>
              </div>

              <div className="business-help">
                <CircleHelp size={18} />

                <p>
                  <strong>Keep the decision fair.</strong>
                  Focus on relevant transaction and payment information.
                  Avoid protected or unrelated personal characteristics.
                </p>
              </div>

              <div className="business-button-row">
                <button
                  className="business-back"
                  onClick={() => setStep(0)}
                >
                  <ArrowLeft size={17} />
                  Back
                </button>

                <button
                  className="business-continue"
                  onClick={next}
                >
                  Review this decision
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DECISION REVIEW */}

          {step === 2 && (
            <div className="business-form">
              <span className="business-kicker">
                DECISION REVIEW
              </span>

              <h2>Understand the exposure.</h2>

              <p className="business-description">
                Here's a breakdown of the proposed transaction. These
                calculations describe the deal, not the customer's
                likelihood of paying.
              </p>

              {/* MAIN EXPOSURE */}

              <div className="business-exposure">
                <span>AMOUNT NOT COVERED BY THE DEPOSIT</span>
                <strong>{money(outstanding)}</strong>
                <small>
                  Remaining balance under the proposed {data.paymentDays}-day
                  payment arrangement
                </small>
              </div>

              {/* TRANSACTION BREAKDOWN */}

              <div className="business-results-grid">
                <div className="business-result-card">
                  <span>Transaction value</span>
                  <strong>{money(amount)}</strong>
                </div>

                <div className="business-result-card">
                  <span>Upfront payment</span>
                  <strong>{money(deposit)}</strong>
                </div>

                <div className="business-result-card">
                  <span>Deposit coverage</span>
                  <strong>{percent(depositCoverage)}</strong>
                </div>

                <div className="business-result-card">
                  <span>Payment deadline</span>
                  <strong>{data.paymentDays} days</strong>
                </div>
              </div>

              {/* EXPLANATION */}

              <div className="business-review-panel">
                <div className="business-review-heading">
                  <Info size={20} />

                  <div>
                    <strong>What these numbers tell you</strong>
                    <span>
                      A breakdown of the proposed payment arrangement
                    </span>
                  </div>
                </div>

                <ul>
                  {observations.map((observation, index) => (
                    <li key={index}>{observation}</li>
                  ))}
                </ul>
              </div>

              {/* CUSTOMER CONTEXT */}

              <div className="business-review-panel">
                <div className="business-review-heading">
                  <ClipboardCheck size={20} />

                  <div>
                    <strong>Customer context provided</strong>
                    <span>
                      Information recorded separately from the transaction
                      calculation
                    </span>
                  </div>
                </div>

                <ul>
                  <li>
                    <strong>Relationship:</strong>{' '}
                    {data.customerRelationship}
                  </li>

                  <li>
                    <strong>Payment history:</strong>{' '}
                    {data.paymentHistory}
                  </li>

                  {data.additionalContext.trim() && (
                    <li>
                      <strong>Additional details:</strong>{' '}
                      {data.additionalContext}
                    </li>
                  )}
                </ul>

                <p className="business-description">
                  These details provide context for a human review. They
                  are not used to calculate a customer score or predict
                  future payment behavior.
                </p>
              </div>

              {/* REVIEW CHECKLIST */}

              <div className="business-review-panel">
                <div className="business-review-heading">
                  <ClipboardCheck size={20} />

                  <div>
                    <strong>Questions to review before deciding</strong>
                    <span>
                      A practical checklist, not an automated verdict
                    </span>
                  </div>
                </div>

                <ul>
                  {checklist.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* LIMITATIONS */}

              <div className="business-model-note">
                <ShieldCheck size={18} />

                <p>
                  <strong>What Verity cannot determine</strong>
                  This calculation does not establish whether a customer
                  will pay, whether the transaction is profitable, or
                  whether the arrangement is affordable for your business.
                  It does not account for all operating costs or unexpected
                  expenses.
                </p>
              </div>

              <div className="business-model-note">
                <Info size={18} />

                <p>
                  <strong>About Verity's AI research</strong>
                  The current research model uses a historical German
                  credit dataset. It has not been validated for this
                  specific business-customer decision, so it is not used
                  to score this transaction.
                </p>
              </div>

              {/* SAVE */}

              <div className="business-save-panel">
                <h3>Save this assessment</h3>

                <p>
                  Give this review a name so you can find it in My
                  Decisions later.
                </p>

                <div className="business-field">
                  <label htmlFor="businessAssessmentTitle">
                    Assessment name
                  </label>

                  <input
                    id="businessAssessmentTitle"
                    type="text"
                    maxLength={80}
                    placeholder="e.g. Wholesale order review"
                    value={assessmentTitle}
                    onChange={(e) => {
                      setAssessmentTitle(e.target.value)
                      setSaveError('')
                    }}
                  />
                </div>

                {saveError && (
                  <p className="business-save-error" role="alert">
                    {saveError}
                  </p>
                )}

                {isSaved && (
                  <p className="business-save-success" role="status">
                    <CheckCircle2 size={17} />
                    Saved to My Decisions.
                  </p>
                )}

                <button
                  className="business-continue business-save-button"
                  onClick={handleSave}
                  disabled={
                    isSaving ||
                    isSaved ||
                    !assessmentTitle.trim()
                  }
                >
                  {isSaving
                    ? 'Saving...'
                    : isSaved
                      ? 'Saved to My Decisions'
                      : 'Save to My Decisions'}

                  {!isSaving && !isSaved && (
                    <CheckCircle2 size={17} />
                  )}
                </button>
              </div>

              {/* ACTIONS */}

              <div className="business-button-row">
                <button
                  className="business-back"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={17} />
                  Edit context
                </button>

                <button
                  className="business-continue"
                  onClick={resetAssessment}
                >
                  Start another review
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default BusinessAssessment
