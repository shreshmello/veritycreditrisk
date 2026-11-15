import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react'
import { supabase } from './supabase'
import './Auth.css'

type AuthMode = 'login' | 'signup' | 'reset'

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: window.location.origin,
          },
        })

        if (error) throw error

        if (data.session) {
          setMessage('Your account has been created. Welcome to Verity!')
        } else {
          setMessage(
            'Account created! Check your email for a confirmation link before signing in.'
          )
          setMode('login')
        }
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })

        if (error) throw error

        setMessage('If an account exists for this email, a password reset link has been sent.')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError('')
    setMessage('')
  }

  return (
    <main className="auth-page">
      <div className="auth-topbar">
        <a className="auth-brand" href="/" aria-label="Verity home">
          <span className="auth-brand-mark">v.</span>
          <span>verity</span>
        </a>
        <span className="auth-topbar-note">
          <ShieldCheck size={15} />
          Thoughtful financial decisions start here
        </span>
      </div>

      <section className="auth-layout">
        <div className="auth-intro">
          <span className="auth-eyebrow">CLARITY OVER COMPLEXITY</span>

          <h1>
            A clearer way
            <br />
            to approach
            <br />
            <span>financial decisions.</span>
          </h1>

          <p>
            Understand your options, explore possible outcomes,
            and make decisions with more information.
          </p>

          <div className="auth-trust">
            <div className="auth-trust-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong>Your decisions, explained.</strong>
              <span>Transparent guidance. No false certainty.</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-heading">
            <span className="auth-card-kicker">
              {mode === 'signup'
                ? 'GET STARTED'
                : mode === 'reset'
                  ? 'ACCOUNT RECOVERY'
                  : 'WELCOME BACK'}
            </span>

            <h2>
              {mode === 'signup'
                ? 'Create your account'
                : mode === 'reset'
                  ? 'Reset your password'
                  : 'Sign in to Verity'}
            </h2>

            <p>
              {mode === 'signup'
                ? 'Create an account to keep your decisions in one place.'
                : mode === 'reset'
                  ? 'Enter your email and we will send a reset link.'
                  : 'Continue exploring your financial decisions.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <label className="auth-field">
                <span>Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  maxLength={80}
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            {mode !== 'reset' && (
              <label className="auth-field">
                <span>Password</span>
                <div className="auth-password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete={
                      mode === 'signup' ? 'new-password' : 'current-password'
                    }
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>
            )}

            {mode === 'login' && (
              <button
                type="button"
                className="auth-forgot"
                onClick={() => switchMode('reset')}
              >
                Forgot password?
              </button>
            )}

            {error && (
              <div className="auth-alert auth-error" role="alert">
                {error}
              </div>
            )}

            {message && (
              <div className="auth-alert auth-success" role="status">
                <CheckCircle2 size={17} />
                <span>{message}</span>
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : mode === 'signup'
                  ? 'Create account'
                  : mode === 'reset'
                    ? 'Send reset link'
                    : 'Sign in'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')}>
                  Sign in
                </button>
              </>
            ) : mode === 'reset' ? (
              <>
                Remembered your password?{' '}
                <button type="button" onClick={() => switchMode('login')}>
                  Back to sign in
                </button>
              </>
            ) : (
              <>
                New to Verity?{' '}
                <button type="button" onClick={() => switchMode('signup')}>
                  Create an account
                </button>
              </>
            )}
          </div>

          <div className="auth-disclaimer">
            <ShieldCheck size={14} />
            Your account is protected by Supabase authentication.
          </div>
        </div>
      </section>

      <footer className="auth-footer">
        Verity · Making financial decisions clearer.
      </footer>
    </main>
  )
}