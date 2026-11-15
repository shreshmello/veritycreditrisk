
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ClipboardList,
  LoaderCircle,
  Pencil,
  Save,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'

import {
  getAssessments,
  deleteAssessment,
  type SavedAssessment,
} from './assessments'

import { supabase } from './supabase'
import './History.css'

type HistoryProps = {
  onBack: () => void
}

type FilterType = 'all' | 'personal' | 'business'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatFieldLabel(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

function DataValue({ value }: { value: unknown }): ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="history-muted-value">Not provided</span>
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (typeof value === 'number') {
    return value.toLocaleString()
  }

  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="history-muted-value">None</span>
    }

    return (
      <div className="history-data-list">
        {value.map((item, index) => (
          <div className="history-data-list-item" key={index}>
            {typeof item === 'object' && item !== null ? (
              <DataValue value={item} />
            ) : (
              <span>{String(item)}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)

    if (entries.length === 0) {
      return <span className="history-muted-value">No information</span>
    }

    return (
      <div className="history-nested-data">
        {entries.map(([key, nestedValue]) => (
          <div className="history-data-row" key={key}>
            <span className="history-data-label">
              {formatFieldLabel(key)}
            </span>
            <div className="history-data-value">
              <DataValue value={nestedValue} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return String(value)
}

function History({ onBack }: HistoryProps) {
  const [assessments, setAssessments] = useState<SavedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedAssessment, setSelectedAssessment] =
    useState<SavedAssessment | null>(null)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [savingTitle, setSavingTitle] = useState(false)

  useEffect(() => {
    let active = true

    async function loadHistory() {
      try {
        const records = await getAssessments()

        if (active) {
          setAssessments(records)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Something went wrong loading your history.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [])

  const filteredAssessments = useMemo(() => {
    if (filter === 'all') return assessments

    return assessments.filter(
      assessment => assessment.assessment_type === filter
    )
  }, [assessments, filter])

  function getSummary(assessment: SavedAssessment) {
    const summary = assessment.result_data?.summary
    const label = assessment.result_data?.label

    if (typeof summary === 'string') return summary
    if (typeof label === 'string') return label

    return 'Your assessment has been saved.'
  }

  function openAssessment(assessment: SavedAssessment) {
    setSelectedAssessment(assessment)
    setTitleDraft(assessment.title)
    setEditingTitle(false)
    setError('')
  }

  function closeAssessment() {
    setSelectedAssessment(null)
    setEditingTitle(false)
    setTitleDraft('')
    setError('')
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this assessment? This cannot be undone.')) {
      return
    }

    try {
      setDeletingId(id)
      setError('')

      await deleteAssessment(id)

      setAssessments(current =>
        current.filter(item => item.id !== id)
      )

      if (selectedAssessment?.id === id) {
        closeAssessment()
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not delete assessment.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  async function handleRename() {
    if (!selectedAssessment) return

    const trimmedTitle = titleDraft.trim()

    if (!trimmedTitle) {
      setError('Please enter a title.')
      return
    }

    if (trimmedTitle.length > 70) {
      setError('Titles must be 70 characters or fewer.')
      return
    }

    try {
      setSavingTitle(true)
      setError('')

      const { data, error: updateError } = await supabase
        .from('assessments')
        .update({
          title: trimmedTitle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedAssessment.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      const updatedAssessment = data as SavedAssessment

      setAssessments(current =>
        current.map(item =>
          item.id === updatedAssessment.id ? updatedAssessment : item
        )
      )

      setSelectedAssessment(updatedAssessment)
      setTitleDraft(updatedAssessment.title)
      setEditingTitle(false)
    } catch (err) {
      console.error('Assessment rename failed:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Could not update this title. Please try again.'
      )
    } finally {
      setSavingTitle(false)
    }
  }

  const personalCount = assessments.filter(
    item => item.assessment_type === 'personal'
  ).length

  const businessCount = assessments.filter(
    item => item.assessment_type === 'business'
  ).length

  const isPersonal =
    selectedAssessment?.assessment_type === 'personal'

  return (
    <main className="history-page">
      <header className="history-nav">
        <button
          className="history-back"
          onClick={selectedAssessment ? closeAssessment : onBack}
        >
          <ArrowLeft size={17} />
          {selectedAssessment ? 'Back to My Decisions' : 'Back to Verity'}
        </button>

        <div className="history-brand">
          <span className="history-brand-mark">V</span>
          Verity
        </div>

        <span className="history-nav-label">MY DECISIONS</span>
      </header>

      <section className="history-content">
        {selectedAssessment ? (
          <div className="history-detail">
            <div className="history-detail-heading">
              <div>
                <p className="history-eyebrow">SAVED ASSESSMENT</p>

                <div className="history-title-area">
                  {editingTitle ? (
                    <div className="history-title-edit">
                      <input
                        value={titleDraft}
                        onChange={event => setTitleDraft(event.target.value)}
                        onKeyDown={event => {
                          if (event.key === 'Enter') handleRename()
                          if (event.key === 'Escape') {
                            setEditingTitle(false)
                            setTitleDraft(selectedAssessment.title)
                          }
                        }}
                        maxLength={70}
                        autoFocus
                        aria-label="Assessment title"
                      />

                      <button
                        className="history-icon-button history-save-title"
                        onClick={handleRename}
                        disabled={savingTitle}
                        aria-label="Save title"
                      >
                        {savingTitle ? (
                          <LoaderCircle size={17} className="history-spinner" />
                        ) : (
                          <Check size={17} />
                        )}
                      </button>

                      <button
                        className="history-icon-button"
                        onClick={() => {
                          setEditingTitle(false)
                          setTitleDraft(selectedAssessment.title)
                          setError('')
                        }}
                        disabled={savingTitle}
                        aria-label="Cancel editing"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1>{selectedAssessment.title}</h1>

                      <button
                        className="history-rename-button"
                        onClick={() => {
                          setTitleDraft(selectedAssessment.title)
                          setEditingTitle(true)
                          setError('')
                        }}
                      >
                        <Pencil size={14} />
                        Rename
                      </button>
                    </>
                  )}
                </div>

                <div className="history-detail-meta">
                  <span className="history-detail-type">
                    {isPersonal ? (
                      <UserRound size={15} />
                    ) : (
                      <BriefcaseBusiness size={15} />
                    )}
                    {isPersonal ? 'Personal assessment' : 'Business assessment'}
                  </span>

                  <span>
                    <CalendarDays size={14} />
                    {formatDate(selectedAssessment.created_at)}
                  </span>
                </div>
              </div>

              <button
                className="history-delete history-detail-delete"
                onClick={() => handleDelete(selectedAssessment.id)}
                disabled={deletingId === selectedAssessment.id}
                aria-label="Delete assessment"
              >
                {deletingId === selectedAssessment.id ? (
                  <LoaderCircle size={17} className="history-spinner" />
                ) : (
                  <Trash2 size={17} />
                )}
                Delete
              </button>
            </div>

            {error && <div className="history-error">{error}</div>}

            <div className="history-detail-summary">
              <p className="history-section-eyebrow">ASSESSMENT OVERVIEW</p>
              <p>{getSummary(selectedAssessment)}</p>
            </div>

            <section className="history-data-section">
              <div className="history-data-heading">
                <div>
                  <p className="history-section-eyebrow">YOUR INFORMATION</p>
                  <h2>Assessment inputs</h2>
                </div>
              </div>

              {Object.keys(selectedAssessment.input_data || {}).length > 0 ? (
                <div className="history-data-card">
                  <DataValue value={selectedAssessment.input_data} />
                </div>
              ) : (
                <div className="history-no-data">
                  No input information was saved with this assessment.
                </div>
              )}
            </section>

            <section className="history-data-section">
              <div className="history-data-heading">
                <div>
                  <p className="history-section-eyebrow">VERITY ANALYSIS</p>
                  <h2>Assessment results</h2>
                </div>
              </div>

              {Object.keys(selectedAssessment.result_data || {}).length > 0 ? (
                <div className="history-data-card">
                  <DataValue value={selectedAssessment.result_data} />
                </div>
              ) : (
                <div className="history-no-data">
                  No result information was saved with this assessment.
                </div>
              )}
            </section>

            <p className="history-detail-footnote">
              This is a saved record of your assessment at the time it was
              completed. It is not a loan approval, financial guarantee, or
              substitute for reviewing the terms of a financial product.
            </p>
          </div>
        ) : (
          <>
            <div className="history-heading">
              <div>
                <p className="history-eyebrow">YOUR VERITY ACCOUNT</p>
                <h1>My Decisions</h1>
                <p className="history-description">
                  Revisit your saved financial assessments whenever you need them.
                </p>
              </div>

              <div className="history-count">
                <ClipboardList size={19} />
                <span>
                  {assessments.length}{' '}
                  {assessments.length === 1 ? 'assessment' : 'assessments'}
                </span>
              </div>
            </div>

            {error && <div className="history-error">{error}</div>}

            {loading && (
              <div className="history-state">
                <LoaderCircle className="history-spinner" size={25} />
                <p>Loading your decisions...</p>
              </div>
            )}

            {!loading && assessments.length === 0 && !error && (
              <div className="history-empty">
                <div className="history-empty-icon">
                  <ClipboardList size={28} />
                </div>
                <h2>Your history starts here</h2>
                <p>
                  When you complete a Personal or Business assessment, you can
                  save it here and come back to it later.
                </p>
                <button className="history-primary-button" onClick={onBack}>
                  Start an assessment
                </button>
              </div>
            )}

            {!loading && assessments.length > 0 && (
              <>
                <div className="history-filters">
                  <button
                    className={`history-filter ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All
                    <span>{assessments.length}</span>
                  </button>

                  <button
                    className={`history-filter ${filter === 'personal' ? 'active' : ''}`}
                    onClick={() => setFilter('personal')}
                  >
                    <UserRound size={14} />
                    Personal
                    <span>{personalCount}</span>
                  </button>

                  <button
                    className={`history-filter ${filter === 'business' ? 'active' : ''}`}
                    onClick={() => setFilter('business')}
                  >
                    <BriefcaseBusiness size={14} />
                    Business
                    <span>{businessCount}</span>
                  </button>
                </div>

                {filteredAssessments.length === 0 ? (
                  <div className="history-filter-empty">
                    <ClipboardList size={24} />
                    <p>No {filter} assessments yet.</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {filteredAssessments.map(assessment => {
                      const personal =
                        assessment.assessment_type === 'personal'

                      return (
                        <article
                          className="history-card"
                          key={assessment.id}
                        >
                          <div className="history-card-icon">
                            {personal ? (
                              <UserRound size={21} />
                            ) : (
                              <BriefcaseBusiness size={21} />
                            )}
                          </div>

                          <button
                            className="history-open"
                            onClick={() => openAssessment(assessment)}
                          >
                            <div className="history-card-main">
                              <div className="history-card-topline">
                                <span className="history-type">
                                  {personal ? 'PERSONAL' : 'BUSINESS'}
                                </span>

                                <span className="history-date">
                                  <CalendarDays size={14} />
                                  {formatDate(assessment.created_at)}
                                </span>
                              </div>

                              <h2>{assessment.title}</h2>
                              <p>{getSummary(assessment)}</p>

                              <span className="history-view-link">
                                View assessment
                                <ArrowRight size={14} />
                              </span>
                            </div>
                          </button>

                          <button
                            className="history-delete"
                            onClick={() => handleDelete(assessment.id)}
                            disabled={deletingId === assessment.id}
                            aria-label={`Delete ${assessment.title}`}
                          >
                            {deletingId === assessment.id ? (
                              <LoaderCircle
                                size={17}
                                className="history-spinner"
                              />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </article>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default History
