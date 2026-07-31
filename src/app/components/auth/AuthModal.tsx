import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  checkEmail,
  completeOnboardingProfile,
  fetchSiblingOnboardingPrefill,
  login,
  passwordResetConfirm,
  passwordResetResend,
  passwordResetStart,
  saveSession,
  signupResendCode,
  signupStart,
  signupVerify,
  type SiblingOnboardingPrefill,
} from '../../api/auth'
import { ApiError } from '../../api/client'
import { CompanyOnboardingStep } from './CompanyOnboardingStep'
import { OtpInput } from './OtpInput'
import type {
  AccountSide,
  AuthMode,
  AuthStep,
  CredentialsDraft,
  ProfileDraft,
  SessionUser,
} from '../../types/auth'
import './AuthModal.css'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (user: SessionUser) => void
  /** Pré-sélection Client / Partenaire à l'ouverture */
  initialSide?: AccountSide
}

const EMPTY_CREDENTIALS: CredentialsDraft = { email: '', password: '' }
const EMPTY_PROFILE: ProfileDraft = {
  title: '',
  first_name: '',
  last_name: '',
  mobile_phone: '',
  language_id: 1,
}

export function AuthModal({ open, onClose, onSuccess, initialSide = 'buyer' }: AuthModalProps) {
  const [side, setSide] = useState<AccountSide>(initialSide)
  const [mode, setMode] = useState<AuthMode>('login')
  const [step, setStep] = useState<AuthStep>('credentials')
  const [credentials, setCredentials] = useState<CredentialsDraft>(EMPTY_CREDENTIALS)
  const [profile, setProfile] = useState<ProfileDraft>(EMPTY_PROFILE)
  const [otp, setOtp] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [activeUser, setActiveUser] = useState<SessionUser | null>(null)
  const [siblingPrefill, setSiblingPrefill] = useState<SiblingOnboardingPrefill | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (step !== 'verify' || secondsLeft <= 0) return
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [step, secondsLeft])

  useEffect(() => {
    if (open) setSide(initialSide)
  }, [open, initialSide])

  if (!open) return null

  const reset = () => {
    setMode('login')
    setStep('credentials')
    setCredentials(EMPTY_CREDENTIALS)
    setProfile(EMPTY_PROFILE)
    setOtp('')
    setSecondsLeft(0)
    setActiveUser(null)
    setSiblingPrefill(null)
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setInfo(null)
    setLoading(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const formatTimer = (total: number) => {
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (mode === 'reset') {
      if (!credentials.email || !profile.first_name.trim() || !profile.last_name.trim()) {
        setError('Email, prénom et nom sont requis.')
        return
      }
      setLoading(true)
      try {
        const started = await passwordResetStart({
          email: credentials.email,
          first_name: profile.first_name.trim(),
          last_name: profile.last_name.trim(),
          account_type: side,
        })
        setSecondsLeft(started.expires_in_seconds)
        setStep('verify')
        setOtp('')
        setInfo(started.message)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Une erreur est survenue.')
      } finally {
        setLoading(false)
      }
      return
    }

    if (!credentials.email || credentials.password.length < 8) {
      setError('Email valide et mot de passe (8 caractères min.) requis.')
      return
    }

    setLoading(true)
    try {
      const status = await checkEmail(credentials.email, side)

      if (mode === 'signup') {
        if (status.exists) {
          if (status.email_verified === false) {
            const resent = await signupResendCode(credentials, side)
            setSecondsLeft(resent.expires_in_seconds)
            setStep('verify')
            setOtp('')
            setInfo('Un compte non confirmé existe déjà. Un nouveau code vient d’être envoyé.')
            return
          }
          setError(
            side === 'buyer'
              ? 'Un compte client existe déjà avec cet email.'
              : 'Un compte partenaire existe déjà avec cet email.',
          )
          return
        }
        const started = await signupStart(credentials, side)
        setSecondsLeft(started.expires_in_seconds)
        setStep('verify')
        setOtp('')
        return
      }

      if (!status.exists) {
        setError(
          side === 'buyer'
            ? 'Aucun compte client trouvé avec cet email.'
            : 'Aucun compte partenaire trouvé avec cet email.',
        )
        return
      }

      try {
        const user = await login(credentials, side)
        saveSession(user)
        onSuccess(user)
        handleClose()
      } catch (err) {
        if (err instanceof ApiError && err.code === 'email_not_verified') {
          const resent = await signupResendCode(credentials, side)
          setSecondsLeft(resent.expires_in_seconds)
          setStep('verify')
          setOtp('')
          setInfo('Email non confirmé. Un nouveau code vous a été envoyé.')
          return
        }
        throw err
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (otp.length !== 6) {
      setError('Saisissez les 6 chiffres du code.')
      return
    }
    if (secondsLeft <= 0) {
      setError('Le code a expiré. Renvoyez un nouveau code.')
      return
    }

    if (mode === 'reset') {
      setStep('reset_password')
      setError(null)
      setInfo('Code accepté. Choisissez votre nouveau mot de passe.')
      return
    }

    setLoading(true)
    try {
      const user = await signupVerify(credentials.email, otp, side)
      saveSession(user)
      if (mode === 'signup') {
        setActiveUser(user)
        const prefill = await fetchSiblingOnboardingPrefill(user.user_id, user.email).catch(
          () => ({ has_sibling: false } as SiblingOnboardingPrefill),
        )
        setSiblingPrefill(prefill)
        setProfile({
          title: prefill.profile?.title ?? '',
          first_name: prefill.profile?.first_name ?? user.first_name ?? '',
          last_name: prefill.profile?.last_name ?? user.last_name ?? '',
          mobile_phone: prefill.profile?.mobile_phone ?? user.mobile_phone ?? '',
          language_id: prefill.profile?.language_id ?? 1,
        })
        setStep('profile')
        setError(null)
        setInfo(null)
      } else {
        onSuccess(user)
        handleClose()
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Code invalide.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      if (mode === 'reset') {
        const result = await passwordResetResend({
          email: credentials.email,
          first_name: profile.first_name.trim(),
          last_name: profile.last_name.trim(),
          account_type: side,
        })
        setSecondsLeft(result.expires_in_seconds)
        setOtp('')
        setInfo('Un nouveau code a été envoyé. Vérifiez aussi vos spams.')
        return
      }
      const result = await signupResendCode(credentials, side)
      setSecondsLeft(result.expires_in_seconds)
      setOtp('')
      setInfo('Un nouveau code a été envoyé. Vérifiez aussi vos spams.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de renvoyer le code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (otp.length !== 6) {
      setError('Code manquant. Revenez à l’étape précédente.')
      return
    }
    setLoading(true)
    try {
      const result = await passwordResetConfirm({
        email: credentials.email,
        code: otp,
        account_type: side,
        new_password: newPassword,
      })
      setMode('login')
      setStep('credentials')
      setCredentials({ email: credentials.email, password: '' })
      setNewPassword('')
      setConfirmPassword('')
      setOtp('')
      setInfo(result.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Réinitialisation impossible.')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!activeUser) {
      setError('Session expirée. Reconnectez-vous.')
      return
    }
    if (!profile.title) {
      setError('Choisissez une civilité.')
      return
    }
    if (!profile.first_name.trim() || !profile.last_name.trim()) {
      setError('Prénom et nom sont requis.')
      return
    }

    setLoading(true)
    try {
      const updated = await completeOnboardingProfile({
        user_id: activeUser.user_id,
        email: activeUser.email,
        title: profile.title,
        first_name: profile.first_name.trim(),
        last_name: profile.last_name.trim(),
        mobile_phone: profile.mobile_phone.trim() || null,
        language_id: profile.language_id,
      })
      saveSession(updated)
      setActiveUser(updated)
      if (mode === 'signup') {
        setStep('company')
        setError(null)
    setInfo(null)
      } else {
        onSuccess(updated)
        handleClose()
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Enregistrement impossible.')
    } finally {
      setLoading(false)
    }
  }

  const sideLabel = side === 'buyer' ? 'Client' : 'Partenaire'
  const modeLabel =
    mode === 'login' ? 'Connexion' : mode === 'signup' ? 'Inscription' : 'Mot de passe oublié'
  const totalSteps = mode === 'signup' ? 4 : mode === 'reset' ? 3 : 2
  const stepLabel =
    step === 'credentials'
      ? '1'
      : step === 'verify'
        ? '2'
        : step === 'reset_password'
          ? '3'
          : step === 'profile'
            ? '3'
            : '4'

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button type="button" className="auth-overlay__backdrop" onClick={handleClose} aria-label="Fermer" />
      <div
        className={step === 'company' ? 'auth-modal auth-modal--company' : 'auth-modal'}
      >
        <button type="button" className="auth-modal__close" onClick={handleClose} aria-label="Fermer">
          ×
        </button>

        {step !== 'company' ? (
        <div className="auth-modal__split">
          <SidePanel
            active={side === 'buyer'}
            title="Client"
            subtitle="Commandez des produits et prestations pour vos chantiers"
            imageSeed="urbyn-buyer"
            onSelect={() => {
              setSide('buyer')
              setStep('credentials')
              setError(null)
              setInfo(null)
            }}
          />
          <SidePanel
            active={side === 'partner'}
            title="Partenaire"
            subtitle="Proposez vos offres et gérez votre catalogue produits"
            imageSeed="urbyn-partner"
            onSelect={() => {
              setSide('partner')
              setStep('credentials')
              setError(null)
              setInfo(null)
            }}
          />
        </div>
        ) : null}

        <div className="auth-modal__body">
          <p className="auth-modal__eyebrow">
            {sideLabel} · {modeLabel} · Étape {stepLabel}
            {totalSteps > 2 ? `/${totalSteps}` : ''}
          </p>
          <h2 id="auth-title" className="auth-modal__title">
            {step === 'credentials' && (mode === 'reset' ? 'Identité' : 'Identifiants')}
            {step === 'verify' && 'Confirmez votre email'}
            {step === 'reset_password' && 'Nouveau mot de passe'}
            {step === 'profile' && 'Complétez votre profil'}
            {step === 'company' && 'Votre entreprise'}
          </h2>

          {step === 'credentials' && mode !== 'reset' ? (
            <div className="auth-tabs">
              <button
                type="button"
                className={mode === 'login' ? 'auth-tabs__btn auth-tabs__btn--active' : 'auth-tabs__btn'}
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setInfo(null)
                }}
              >
                Se connecter
              </button>
              <button
                type="button"
                className={mode === 'signup' ? 'auth-tabs__btn auth-tabs__btn--active' : 'auth-tabs__btn'}
                onClick={() => {
                  setMode('signup')
                  setError(null)
                  setInfo(null)
                }}
              >
                Créer un compte
              </button>
            </div>
          ) : null}

          {info && step !== 'company' ? <p className="auth-modal__info">{info}</p> : null}
          {error && step !== 'company' ? <p className="auth-modal__error">{error}</p> : null}

          {step === 'credentials' ? (
            <form className="auth-form" onSubmit={handleCredentials}>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="nom@entreprise.com"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials((c) => ({ ...c, email: e.target.value }))
                  }
                  required
                />
              </label>
              {mode === 'reset' ? (
                <div className="auth-form__row auth-form__row--two">
                  <label className="field">
                    <span>Prénom</span>
                    <input
                      value={profile.first_name}
                      onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Nom</span>
                    <input
                      value={profile.last_name}
                      onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                      required
                    />
                  </label>
                </div>
              ) : (
                <label className="field">
                  <span>Mot de passe</span>
                  <input
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials((c) => ({ ...c, password: e.target.value }))
                    }
                    minLength={8}
                    required
                  />
                </label>
              )}
              <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
                {loading
                  ? 'Chargement…'
                  : mode === 'signup'
                    ? 'Créer mon compte et recevoir le code'
                    : mode === 'reset'
                      ? 'Recevoir le code'
                      : 'Se connecter'}
              </button>
              {mode === 'login' ? (
                <button
                  type="button"
                  className="btn btn--ghost btn--block"
                  onClick={() => {
                    setMode('reset')
                    setError(null)
                    setInfo(null)
                    setCredentials((c) => ({ ...c, password: '' }))
                  }}
                >
                  Mot de passe oublié ?
                </button>
              ) : null}
              {mode === 'reset' ? (
                <button
                  type="button"
                  className="btn btn--ghost btn--block"
                  onClick={() => {
                    setMode('login')
                    setError(null)
                    setInfo(null)
                  }}
                >
                  Retour à la connexion
                </button>
              ) : null}
            </form>
          ) : null}

          {step === 'verify' ? (
            <form className="auth-form" onSubmit={handleVerify}>
              <p className="auth-modal__hint">
                Un code à <strong>6 chiffres</strong> a été envoyé à{' '}
                <strong>{credentials.email}</strong>. Valable{' '}
                <strong>{formatTimer(secondsLeft)}</strong>.
                <br />
                Pensez à vérifier vos <strong>spams / courriers indésirables</strong>.
              </p>
              <OtpInput value={otp} onChange={setOtp} disabled={loading || secondsLeft <= 0} />
              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={loading || secondsLeft <= 0 || otp.length !== 6}
              >
                {loading
                  ? 'Vérification…'
                  : mode === 'reset'
                    ? 'Continuer'
                    : 'Valider le code'}
              </button>
              <div className="auth-form__actions auth-form__actions--center">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setStep('credentials')}
                  disabled={loading}
                >
                  Retour
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={handleResend}
                  disabled={loading}
                >
                  Renvoyer le code
                </button>
              </div>
            </form>
          ) : null}

          {step === 'reset_password' ? (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <p className="auth-modal__hint">
                Saisissez votre nouveau mot de passe (8 caractères min.).
              </p>
              <label className="field">
                <span>Nouveau mot de passe</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </label>
              <label className="field">
                <span>Confirmation</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </label>
              <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
                {loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--block"
                onClick={() => setStep('verify')}
                disabled={loading}
              >
                Retour au code
              </button>
            </form>
          ) : null}

          {step === 'profile' ? (
            <form className="auth-form" onSubmit={handleProfileSubmit}>
              <p className="auth-modal__hint">
                Complétez votre profil. L&apos;étape société viendra juste après.
                {siblingPrefill?.has_sibling ? (
                  <> Les champs ont été préremplis depuis votre autre compte Urbyn.</>
                ) : null}
              </p>
              <label className="field">
                <span>Civilité</span>
                <select
                  value={profile.title}
                  onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
                  required
                >
                  <option value="">—</option>
                  <option value="Monsieur">Monsieur</option>
                  <option value="Madame">Madame</option>
                  <option value="M.">M.</option>
                  <option value="Mme">Mme</option>
                </select>
              </label>
              <div className="auth-form__row auth-form__row--two">
                <label className="field">
                  <span>Prénom</span>
                  <input
                    value={profile.first_name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, first_name: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span>Nom</span>
                  <input
                    value={profile.last_name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, last_name: e.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <label className="field">
                <span>Téléphone mobile (facultatif)</span>
                <input
                  type="tel"
                  value={profile.mobile_phone}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, mobile_phone: e.target.value }))
                  }
                  placeholder="+33 6 12 34 56 78"
                />
              </label>
              <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
                {loading ? 'Enregistrement…' : 'Continuer'}
              </button>
            </form>
          ) : null}

          {step === 'company' && activeUser ? (
            <CompanyOnboardingStep
              user={activeUser}
              siblingPrefill={siblingPrefill}
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
              onSuccess={() => {
                saveSession(activeUser)
                onSuccess(activeUser)
                handleClose()
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

function SidePanel({
  active,
  title,
  subtitle,
  imageSeed,
  onSelect,
}: {
  active: boolean
  title: string
  subtitle: string
  imageSeed: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={active ? 'auth-side auth-side--active' : 'auth-side'}
      onClick={onSelect}
    >
      <img
        src={`https://picsum.photos/seed/${imageSeed}/400/220`}
        alt=""
        className="auth-side__img"
      />
      <span className="auth-side__title">{title}</span>
      <span className="auth-side__subtitle">{subtitle}</span>
    </button>
  )
}
