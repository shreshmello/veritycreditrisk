
import PersonalAssessment from './PersonalAssessment'
import BusinessAssessment from './BusinessAssessment'
import Auth from './Auth'
import History from './History'
import Research from './Research'
import { supabase } from './supabase'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

import {
  ArrowRight,
  ShieldCheck,
  Wallet,
  Building2,
  ChartNoAxesCombined,
  CircleHelp,
  CheckCircle2,
  Sparkles,
  Menu,
  X,
} from 'lucide-react'

import './App.css'

type Path = 'personal' | 'business' | null

function App() {
  const [selectedPath, setSelectedPath] = useState<Path>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [showResearch, setShowResearch] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Could not retrieve session:', error.message)
      }

      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const choosePath = (path: Path) => {
    setSelectedPath(path)
    setMenuOpen(false)
  }

  if (authLoading) {
    return <div className="app-loading">Loading Verity...</div>
  }

  if (!user) {
    return <Auth />
  }

  if (showHistory) {
    return <History onBack={() => setShowHistory(false)} />
  }

  if (showResearch) {
    return <Research onBack={() => setShowResearch(false)} />
  }

  if (selectedPath === 'personal') {
    return (
      <PersonalAssessment
        onBack={() => setSelectedPath(null)}
      />
    )
  }

  if (selectedPath === 'business') {
    return (
      <BusinessAssessment
        onBack={() => setSelectedPath(null)}
      />
    )
  }

  return (
    <main>
      {/* NAVIGATION */}
      <header className="navbar">
        <a className="brand" href="#" aria-label="Verity home">
          <img
            src="/verity-logo.png"
            alt="Verity"
            className="verity-logo"
          />
        </a>

        <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'}>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>

          <a href="#principles" onClick={() => setMenuOpen(false)}>
            Our approach
          </a>

          <button
            className="research-nav-link"
            onClick={() => {
              setShowResearch(true)
              setMenuOpen(false)
            }}
          >
            Research
          </button>

          <a href="#about" onClick={() => setMenuOpen(false)}>
            About Verity
          </a>
        </nav>

        <div className="account-actions">
          <button
            className="history-nav-button"
            onClick={() => setShowHistory(true)}
          >
            My Decisions
          </button>

          <span className="account-email">{user.email}</span>

          <button
            className="nav-cta"
            onClick={async () => {
              const { error } = await supabase.auth.signOut()

              if (error) {
                console.error('Sign out failed:', error.message)
              }
            }}
          >
            Sign out
          </button>
        </div>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            FINANCIAL DECISIONS, MADE CLEARER
          </div>

          <h1>
            Make money
            <br />
            decisions with
            <br />
            <span>more confidence.</span>
          </h1>

          <p className="hero-description">
            Financial decisions shouldn't feel like guesswork.
            Verity helps people and small businesses understand
            risk, explore their options, and make more informed
            decisions.
          </p>

          <div className="hero-actions">
            <a href="#get-started" className="primary-button">
              Explore Verity <ArrowRight size={18} />
            </a>

            <a href="#how-it-works" className="secondary-button">
              See how it works
            </a>
          </div>

          <div className="trust-note">
            <ShieldCheck size={17} />
            <span>
              Transparent. Uncertainty-aware. Human-centered.
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-glow" />

          <div className="insight-card">
            <div className="insight-top">
              <div className="insight-icon">
                <ChartNoAxesCombined size={19} />
              </div>

              <span className="insight-label">
                THE VERITY APPROACH
              </span>

              <span className="live-dot" />
            </div>

            <h3>A clearer picture of risk.</h3>

            <p>
              A financial decision deserves more than a
              simple yes or no.
            </p>

            <div className="insight-divider" />

            <div className="insight-row">
              <div className="insight-row-icon teal">
                <CheckCircle2 size={17} />
              </div>

              <div>
                <strong>Understand</strong>
                <span>See the factors behind a decision.</span>
              </div>
            </div>

            <div className="insight-row">
              <div className="insight-row-icon gold">
                <CircleHelp size={17} />
              </div>

              <div>
                <strong>Explore</strong>
                <span>Compare options and possible outcomes.</span>
              </div>
            </div>

            <div className="insight-row">
              <div className="insight-row-icon blue">
                <ShieldCheck size={17} />
              </div>

              <div>
                <strong>Decide thoughtfully</strong>
                <span>Know when more review is needed.</span>
              </div>
            </div>

            <div className="insight-footer">
              <Sparkles size={15} />
              <span>Clarity over complexity.</span>
            </div>
          </div>

          <div className="floating-note">
            <span className="floating-note-icon">
              <ShieldCheck size={17} />
            </span>

            <div>
              <strong>Not sure?</strong>
              <span>That's okay. Start there.</span>
            </div>
          </div>
        </div>
      </section>

      {/* PATHWAYS */}
      <section className="pathways" id="get-started">
        <div className="section-heading">
          <span className="section-kicker">
            A BETTER STARTING POINT
          </span>

          <h2>What brings you to Verity?</h2>

          <p>
            Different financial decisions need different kinds
            of support. Choose the path that fits your situation.
          </p>
        </div>

        <div className="path-grid">
          <article className="path-card personal-card">
            <div className="path-card-top">
              <div className="path-icon">
                <Wallet size={23} />
              </div>

              <span className="path-number">01 / PERSONAL</span>
            </div>

            <h3>
              I'm considering
              <br />
              a loan.
            </h3>

            <p>
              Understand what borrowing could mean for you.
              Explore repayment scenarios, compare loan terms,
              and identify questions worth asking before
              making a commitment.
            </p>

            <ul className="path-features">
              <li>
                <CheckCircle2 size={16} />
                Explore affordability
              </li>

              <li>
                <CheckCircle2 size={16} />
                Compare loan scenarios
              </li>

              <li>
                <CheckCircle2 size={16} />
                Understand the trade-offs
              </li>
            </ul>

            <button
              className="path-button"
              onClick={() => choosePath('personal')}
            >
              Explore personal borrowing
              <ArrowRight size={17} />
            </button>
          </article>

          <article className="path-card business-card">
            <div className="path-card-top">
              <div className="path-icon business-icon">
                <Building2 size={23} />
              </div>

              <span className="path-number">02 / BUSINESS</span>
            </div>

            <h3>
              I'm evaluating
              <br />
              a customer.
            </h3>

            <p>
              Make more informed decisions about offering
              payment terms. Understand potential risk,
              consider alternatives, and know when a decision
              needs a closer look.
            </p>

            <ul className="path-features">
              <li>
                <CheckCircle2 size={16} />
                Assess payment risk
              </li>

              <li>
                <CheckCircle2 size={16} />
                Explore safer terms
              </li>

              <li>
                <CheckCircle2 size={16} />
                Identify uncertain cases
              </li>
            </ul>

            <button
              className="path-button"
              onClick={() => choosePath('business')}
            >
              Explore business decisions
              <ArrowRight size={17} />
            </button>
          </article>
        </div>

        {selectedPath && (
          <div className="selection-panel" role="status">
            <div className="selection-check">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <strong>
                {selectedPath === 'personal'
                  ? 'Personal borrowing selected'
                  : 'Business decision support selected'}
              </strong>

              <p>
                {selectedPath === 'personal'
                  ? 'Your next step will be a guided borrowing assessment.'
                  : 'Your next step will be a guided business assessment.'}
              </p>
            </div>

            <button
              className="selection-close"
              onClick={() => setSelectedPath(null)}
              aria-label="Close selection"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <div className="how-intro">
          <span className="section-kicker">
            HOW VERITY WORKS
          </span>

          <h2>
            Better decisions start with better understanding.
          </h2>

          <p>
            Verity is designed to make financial information
            easier to understand, without pretending every
            situation has a simple answer.
          </p>
        </div>

        <div className="how-steps">
          <div className="how-step">
            <span>01</span>

            <div>
              <h3>Start with your situation</h3>

              <p>
                Share what matters to your decision.
                You can ask questions and take things
                at your own pace.
              </p>
            </div>
          </div>

          <div className="how-step">
            <span>02</span>

            <div>
              <h3>Understand your options</h3>

              <p>
                Explore relevant factors, possible outcomes,
                and the trade-offs between different choices.
              </p>
            </div>
          </div>

          <div className="how-step">
            <span>03</span>

            <div>
              <h3>Know what remains uncertain</h3>

              <p>
                Verity makes limitations visible and highlights
                when additional information or human review
                is important.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="principles-section" id="principles">
        <div className="principles-heading">
          <span className="section-kicker">
            BUILT AROUND PEOPLE
          </span>

          <h2>Technology should adapt to people.</h2>

          <p>
            Not the other way around. Verity aims to make
            financial decision support understandable and
            useful for people with different levels of
            experience and confidence.
          </p>
        </div>

        <div className="principle-items">
          <div className="principle-item">
            <div className="principle-icon">
              <Wallet size={20} />
            </div>

            <div>
              <h3>Your pace, your level</h3>
              <p>
                Clear explanations when you need them.
                Less clutter when you don't.
              </p>
            </div>
          </div>

          <div className="principle-item">
            <div className="principle-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h3>Honest about uncertainty</h3>
              <p>
                No false confidence. Some decisions deserve
                another look.
              </p>
            </div>
          </div>

          <div className="principle-item">
            <div className="principle-icon">
              <CircleHelp size={20} />
            </div>

            <div>
              <h3>Explanations, not just scores</h3>
              <p>
                Understand why a result appears and what
                it does not tell you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="about">
        <a
          className="brand footer-brand"
          href="#"
          aria-label="Verity home"
        >
          <img
            src="/verity-logo.png"
            alt="Verity"
            className="verity-logo footer-verity-logo"
          />
        </a>

        <p>Making financial decisions clearer.</p>

        <span className="footer-caption">
          A research-driven decision-support project.
        </span>
      </footer>
    </main>
  )
}

export default App
