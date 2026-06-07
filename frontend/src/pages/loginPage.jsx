import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api, { login, register, googleLogin } from '../services/api';

// ── API helpers (add these to your api.js too) ─────────────────
const sendOtp = (email, purpose) =>
    api.post('/api/auth/otp/send', { email, purpose });

const verifyOtp = (email, otp, purpose) =>
    api.post('/api/auth/otp/verify', { email, otp, purpose });

const resetPassword = (
    email,
    otp,
    newPassword
) =>
    api.post(
        '/api/auth/reset-password',
        {
            email,
            otp,
            newPassword
        }
    );

// ── Particles ─────────────────────────────────────────────────
function Particles() {
    return (
        <div style={P.canvas} aria-hidden>
            {Array.from({ length: 22 }).map((_, i) => (
                <div key={i} style={{
                    ...P.dot,
                    width:  `${2 + (i % 3)}px`,
                    height: `${2 + (i % 3)}px`,
                    left:   `${(i * 4.5) % 100}%`,
                    top:    `${(i * 7.3) % 100}%`,
                    animationDuration: `${6 + (i % 7)}s`,
                    animationDelay:    `${(i * 0.4) % 4}s`,
                    opacity: 0.15 + (i % 5) * 0.05,
                }} />
            ))}
        </div>
    );
}

// ── SqueezeMark SVG ───────────────────────────────────────────
function SqueezeMark({ size = 36 }) {
    return (
        <svg width={size} height={size * 1.25} viewBox="0 0 64 80" fill="none">
            <rect x="4"  y="6"  width="56" height="8" rx="4" fill="#FF6A00"/>
            <rect x="10" y="20" width="44" height="8" rx="4" fill="#FF6A00" opacity="0.82"/>
            <rect x="18" y="34" width="28" height="8" rx="4" fill="#FF6A00" opacity="0.62"/>
            <rect x="24" y="48" width="16" height="8" rx="4" fill="#FF6A00" opacity="0.42"/>
            <rect x="28" y="62" width="8"  height="8" rx="4" fill="#FF6A00" opacity="0.25"/>
            <circle cx="32" cy="76" r="4" fill="#FF6A00"/>
        </svg>
    );
}

// ── OTP Input Row ─────────────────────────────────────────────
function OtpRow({ email, otp, setOtp, onSend, onVerify, sending, verifying, otpSent, otpVerified, focused, setFocused, cooldown }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* OTP input + Verify */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    className="sf-input"
                    style={{
                        ...S.input,
                        flex: 1,
                        borderColor: otpVerified
                            ? 'rgba(34,197,94,0.6)'
                            : focused === 'otp'
                                ? 'rgba(255,106,0,0.6)'
                                : 'rgba(255,255,255,0.08)',
                        background: otpVerified ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.04)',
                    }}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    onFocus={() => setFocused('otp')}
                    onBlur={() => setFocused('')}
                    maxLength={6}
                    disabled={otpVerified}
                />
                {otpVerified ? (
                    <div style={S.verifiedBadge}>✓ Verified</div>
                ) : (
                    <button
                        type="button"
                        onClick={onVerify}
                        disabled={verifying || !otp || otp.length < 6 || !otpSent}
                        style={{
                            ...S.otpActionBtn,
                            opacity: (!otp || otp.length < 6 || !otpSent) ? 0.45 : 1,
                        }}
                    >
                        {verifying ? <span style={S.spinnerSm} /> : 'Verify'}
                    </button>
                )}
            </div>

            {/* Send OTP row */}
            {!otpVerified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        type="button"
                        onClick={onSend}
                        disabled={sending || !email || cooldown > 0}
                        style={{
                            ...S.sendOtpBtn,
                            opacity: (!email || cooldown > 0 || sending) ? 0.5 : 1,
                        }}
                    >
                        {sending
                            ? <><span style={S.spinnerSm} /> Sending…</>
                            : cooldown > 0
                                ? `Resend in ${cooldown}s`
                                : otpSent ? 'Resend OTP' : 'Send OTP'
                        }
                    </button>
                    {otpSent && !otpVerified && (
                        <span style={{ color: '#555', fontSize: '11px' }}>
                            Check your inbox
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────
export default function LoginPage() {
    const navigate  = useNavigate();

    // View: 'login' | 'register' | 'forgot'
    const [view,    setView]    = useState('login');
    const [error,   setError]   = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [focused, setFocused] = useState('');

    // Register form
    const [form, setForm] = useState({ fullName: '', userName: '', email: '', password: '' });

    // Registration OTP state
    const [regOtp,         setRegOtp]         = useState('');
    const [regOtpSent,     setRegOtpSent]     = useState(false);
    const [regOtpVerified, setRegOtpVerified] = useState(false);
    const [sendingRegOtp,  setSendingRegOtp]  = useState(false);
    const [verifyingReg,   setVerifyingReg]   = useState(false);
    const [regCooldown,    setRegCooldown]    = useState(0);

    // Forgot password state
    const [fpEmail,        setFpEmail]        = useState('');
    const [fpOtp,          setFpOtp]          = useState('');
    const [fpOtpSent,      setFpOtpSent]      = useState(false);
    const [fpOtpVerified,  setFpOtpVerified]  = useState(false);
    const [fpNewPass,      setFpNewPass]      = useState('');
    const [fpConfirmPass,  setFpConfirmPass]  = useState('');
    const [sendingFpOtp,   setSendingFpOtp]   = useState(false);
    const [verifyingFp,    setVerifyingFp]    = useState(false);
    const [fpCooldown,     setFpCooldown]     = useState(0);
    const [fpSuccess,      setFpSuccess]      = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

    // Cooldown timer helper
    const startCooldown = (setter) => {
        setter(30);
        const id = setInterval(() => {
            setter(prev => {
                if (prev <= 1) { clearInterval(id); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const validatePassword = (password) => {
        const rules = [
            { test: p => p.length >= 8,           handleSubmitmsg: 'At least 8 characters' },
            { test: p => /[A-Z]/.test(p),         msg: 'At least one uppercase letter' },
            { test: p => /[a-z]/.test(p),         msg: 'At least one lowercase letter' },
            { test: p => /[0-9]/.test(p),         msg: 'At least one number' },
            { test: p => /[^A-Za-z0-9]/.test(p),  msg: 'At least one special character' },
        ];
        return rules.filter(r => !r.test(password)).map(r => r.msg);
    };

    // ── Send OTP for Registration ──
    const handleSendRegOtp = async () => {
        if (!form.email) return;
        setSendingRegOtp(true);
        setError('');
        try {
            await sendOtp(form.email, 'REGISTRATION');
            setRegOtpSent(true);
            startCooldown(setRegCooldown);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setSendingRegOtp(false);
        }
    };

    // ── Verify OTP for Registration ──
    const handleVerifyRegOtp = async () => {
        setVerifyingReg(true);
        setError('');
        try {

            const response =
                await verifyOtp(
                    form.email,
                    regOtp,
                    'REGISTRATION'
                );

            console.log(
                "VERIFY RESPONSE",
                response.data
            );

            setRegOtpVerified(true);

        } catch (err) {

            console.log(
                "VERIFY ERROR",
                err.response?.data
            );

            setError(
                err.response?.data ||
                'Invalid or expired OTP'
            );
        } finally {
            setVerifyingReg(false);
        }
    };

    // ── Send OTP for Forgot Password ──
    const handleSendFpOtp = async () => {
        if (!fpEmail) return;
        setSendingFpOtp(true);
        setError('');
        try {
            await sendOtp(fpEmail, 'FORGOT_PASSWORD');
            setFpOtpSent(true);
            startCooldown(setFpCooldown);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setSendingFpOtp(false);
        }
    };

    // ── Verify OTP for Forgot Password ──
    const handleVerifyFpOtp = async () => {
        setVerifyingFp(true);
        setError('');
        try {
            await verifyOtp(fpEmail, fpOtp, 'FORGOT_PASSWORD');
            setFpOtpVerified(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setVerifyingFp(false);
        }
    };

    // ── Submit Reset Password ──
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (fpNewPass !== fpConfirmPass) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await resetPassword(
                fpEmail,
                fpOtp,
                fpNewPass
            );
            setFpSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // ── Submit Login / Register ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (view === 'register' && !regOtpVerified) {
            setError('Please verify your email with OTP before registering');
            return;
        }

        setLoading(true);
        try {
            if (view === 'login') {
                const res = await login(form.email, form.password);
                localStorage.setItem('token',  res.data.token);
                localStorage.setItem('email',  res.data.email);
                localStorage.setItem('role',   res.data.role);
                const authUserId = res.data.userId ?? res.data.id ?? res.data.authUserId;
                if (authUserId) localStorage.setItem('authUserId', String(authUserId));

                const profileRes = await api.get(`/api/users/profile/${authUserId}`);
                const profile = profileRes.data;

                if (profile.language && profile.preferredCategories?.length > 0) {
                    localStorage.setItem(
                        'selectedLanguage',
                        profile.language.toLowerCase().substring(0, 2)
                    );

                    localStorage.setItem('justLoggedIn', 'true');

                    // Force full app reload
                    window.location.href = '/';
                } else {
                    localStorage.setItem('justLoggedIn', 'true');

                    // Force full app reload
                    window.location.href = '/onboarding';
                }
            } else {
                // Validate password before hitting backend
                const pwErrors = validatePassword(form.password);
                if (pwErrors.length > 0) {
                    setError('Password must have: ' + pwErrors.join(', '));
                    setLoading(false);
                    return;
                }

                await register(form.fullName, form.userName, form.email, form.password);
                setForm({ fullName: '', userName: '', email: '', password: '' });
                setRegOtp(''); setRegOtpSent(false); setRegOtpVerified(false);
                setError('');
                setView('login');
            }
        } catch (err) {
            const msg = err.response?.data?.message
                || err.response?.data?.error
                || err.response?.data
                || 'Something went wrong';
            setError(typeof msg === 'string' ? msg : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const switchToRegister = () => { setView('register'); setError(''); };
    const switchToLogin    = () => { setView('login');    setError(''); };
    const switchToForgot   = () => { setView('forgot');   setError(''); };

    // ── Derived title/subtitle ──
    const titles = {
        login:    { h: 'Welcome back',       s: 'The internet, squeezed for you.' },
        register: { h: 'Join the feed',      s: 'Be part of something signal-first.' },
        forgot:   { h: 'Reset password',     s: 'We\'ll send a code to your inbox.' },
    };
    const { h: titleH, s: titleS } = titles[view];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

                @keyframes floatY {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-18px); }
                }
                @keyframes lineExpand {
                    from { width: 0; }
                    to   { width: 40px; }
                }
                @keyframes shimmerOrange {
                    0%   { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
                @keyframes pulseMark {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(255,106,0,0.35); }
                    50%       { box-shadow: 0 0 0 8px rgba(255,106,0,0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes successPop {
                    0%   { transform: scale(0.8); opacity: 0; }
                    70%  { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }

                .sf-input { color: #ffffff !important; }
                .sf-input::placeholder { color: #555 !important; }
                .sf-input:focus {
                    border-color: rgba(255,106,0,0.6) !important;
                    background: rgba(255,106,0,0.05) !important;
                    outline: none;
                }
                .sf-submit:hover:not(:disabled) {
                    transform: translateY(-1px);
                    filter: brightness(1.08);
                }
                .sf-submit:active { transform: scale(0.98); }
                .google-wrap > div { width: 100% !important; }
                .otp-section { animation: fadeSlideIn 0.3s ease both; }
                .fp-success   { animation: successPop 0.4s ease both; }
            `}</style>

            <div style={S.page}>
                <div style={S.meshBg} />
                <Particles />
                <div style={S.bgWordmark}>SQUEEZE</div>

                <div style={{
                    ...S.card,
                    opacity:    mounted ? 1 : 0,
                    transform:  mounted ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                }}>
                    <div style={S.cardTopLine} />

                    {/* ── Logo ── */}
                    <div style={S.logoWrap}>
                        <div style={S.logoIconWrap}>
                            <SqueezeMark size={22} />
                        </div>
                        <div>
                            <div style={S.logoText}>
                                Squeeze<span style={{ color: '#FF6A00' }}>Feed</span>
                            </div>
                            <div style={S.logoSub}>squeeze the noise · keep the signal</div>
                        </div>
                    </div>

                    {/* ── Title ── */}
                    <div style={S.titleWrap}>
                        <h2 style={S.title}>{titleH}</h2>
                        <div style={S.titleLine} />
                        <p style={S.subtitle}>{titleS}</p>
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div style={S.errorBox}>
                            <span>⚠</span> {error}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════
                        LOGIN VIEW
                    ══════════════════════════════════════════ */}
                    {view === 'login' && (
                        <form onSubmit={handleSubmit} style={S.form}>
                            <input
                                className="sf-input"
                                style={{ ...S.input, borderColor: focused === 'email' ? 'rgba(255,106,0,0.6)' : 'rgba(255,255,255,0.08)' }}
                                name="email" type="email" placeholder="Email address"
                                value={form.email} onChange={handleChange}
                                onFocus={() => setFocused('email')} onBlur={() => setFocused('')} required
                            />
                            <input
                                className="sf-input"
                                style={{ ...S.input, borderColor: focused === 'password' ? 'rgba(255,106,0,0.6)' : 'rgba(255,255,255,0.08)' }}
                                name="password" type="password" placeholder="Password"
                                value={form.password} onChange={handleChange}
                                onFocus={() => setFocused('password')} onBlur={() => setFocused('')} required
                            />

                            {/* Forgot password link */}
                            <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                                <button type="button" onClick={switchToForgot} style={S.forgotLink}>
                                    Forgot password?
                                </button>
                            </div>

                            <button className="sf-submit" type="submit" disabled={loading} style={S.submitBtn}>
                                {loading ? <span style={S.spinner} /> : <span>Sign In</span>}
                            </button>

                            <div style={S.dividerRow}>
                                <div style={S.dividerLine} />
                                <span style={S.dividerText}>or</span>
                                <div style={S.dividerLine} />
                            </div>

                            <div className="google-wrap" style={S.googleWrap}>
                                <GoogleLogin
                                    onSuccess={async (cr) => {
                                        try {
                                            const res = await googleLogin(cr.credential);

                                            localStorage.setItem('token', res.data.token);
                                            localStorage.setItem('authUserId', res.data.userId);
                                            localStorage.setItem('role', res.data.role);

                                            localStorage.setItem('justLoggedIn', 'true');

                                            window.location.href = '/';
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }}
                                    onError={() => console.log('Google Login Failed')}
                                />
                            </div>
                        </form>
                    )}

                    {/* ══════════════════════════════════════════
                        REGISTER VIEW
                    ══════════════════════════════════════════ */}
                    {view === 'register' && (
                        <form onSubmit={handleSubmit} style={S.form}>
                            <input
                                className="sf-input"
                                style={{ ...S.input, borderColor: focused === 'fullName' ? 'rgba(255,106,0,0.6)' : 'rgba(255,255,255,0.08)' }}
                                name="fullName" placeholder="Full Name"
                                value={form.fullName} onChange={handleChange}
                                onFocus={() => setFocused('fullName')} onBlur={() => setFocused('')} required
                            />
                            <input
                                className="sf-input"
                                style={{ ...S.input, borderColor: focused === 'userName' ? 'rgba(255,106,0,0.6)' : 'rgba(255,255,255,0.08)' }}
                                name="userName" placeholder="Username"
                                value={form.userName} onChange={handleChange}
                                onFocus={() => setFocused('userName')} onBlur={() => setFocused('')} required
                            />

                            {/* Email + Send OTP button */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    className="sf-input"
                                    style={{
                                        ...S.input,
                                        flex: 1,
                                        borderColor: regOtpVerified
                                            ? 'rgba(34,197,94,0.6)'
                                            : focused === 'email'
                                                ? 'rgba(255,106,0,0.6)'
                                                : 'rgba(255,255,255,0.08)',
                                        background: regOtpVerified ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.04)',
                                    }}
                                    name="email" type="email" placeholder="Email address"
                                    value={form.email} onChange={handleChange}
                                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                                    required
                                    disabled={regOtpVerified}
                                />
                                {!regOtpVerified && (
                                    <button
                                        type="button"
                                        onClick={handleSendRegOtp}
                                        disabled={sendingRegOtp || !form.email || regCooldown > 0}
                                        style={{
                                            ...S.sendOtpBtn,
                                            padding: '0 14px',
                                            height: 'auto',
                                            alignSelf: 'stretch',
                                            opacity: (!form.email || regCooldown > 0 || sendingRegOtp) ? 0.5 : 1,
                                        }}
                                    >
                                        {sendingRegOtp
                                            ? <span style={S.spinnerSm} />
                                            : regCooldown > 0
                                                ? `${regCooldown}s`
                                                : regOtpSent ? 'Resend' : 'Send OTP'
                                        }
                                    </button>
                                )}
                            </div>

                            {/* OTP verify row — appears after OTP sent */}
                            {(regOtpSent || regOtpVerified) && (
                                <div className="otp-section" style={S.otpBox}>
                                    <div style={S.otpBoxLabel}>
                                        {regOtpVerified
                                            ? '✓ Email verified successfully'
                                            : `Enter the 6-digit OTP sent to ${form.email}`
                                        }
                                    </div>
                                    {!regOtpVerified && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                className="sf-input"
                                                style={{
                                                    ...S.input,
                                                    flex: 1,
                                                    letterSpacing: '0.25em',
                                                    fontFamily: "'Space Grotesk', sans-serif",
                                                    fontSize: '16px',
                                                    borderColor: focused === 'regOtp' ? 'rgba(255,106,0,0.6)' : 'rgba(255,255,255,0.08)',
                                                }}
                                                placeholder="000000"
                                                value={regOtp}
                                                onChange={e => setRegOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                onFocus={() => setFocused('regOtp')}
                                                onBlur={() => setFocused('')}
                                                maxLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVerifyRegOtp}
                                                disabled={verifyingReg || regOtp.length < 6}
                                                style={{
                                                    ...S.otpActionBtn,
                                                    opacity: regOtp.length < 6 ? 0.45 : 1,
                                                }}
                                            >
                                                {verifyingReg ? <span style={S.spinnerSm} /> : 'Verify'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <input
                                className="sf-input"
                                style={{ ...S.input, borderColor: focused === 'password' ? 'rgba(255,106,0,0.6)' : 'rgba(255,255,255,0.08)' }}
                                name="password" type="password" placeholder="Password"
                                value={form.password} onChange={handleChange}
                                onFocus={() => setFocused('password')} onBlur={() => setFocused('')} required
                            />

                            {/* Password strength — ADD THIS ONLY HERE */}
                            {form.password && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[0,1,2,3,4].map(i => {
                                            const strength = 5 - validatePassword(form.password).length;
                                            const colors = ['#ef4444','#ef4444','#f97316','#eab308','#22c55e'];
                                            return (
                                                <div key={i} style={{
                                                    flex: 1, height: '3px', borderRadius: '999px',
                                                    background: i < strength ? colors[strength - 1] : 'rgba(255,255,255,0.08)',
                                                    transition: 'background 0.3s',
                                                }} />
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            {validatePassword(form.password).map((e, i) => (
                                                <span key={i} style={{ color: '#666', fontSize: '11px' }}>✗ {e}</span>
                                            ))}
                                        </div>
                                        {(() => {
                                            const strength = 5 - validatePassword(form.password).length;
                                            const colors = ['#ef4444','#ef4444','#f97316','#eab308','#22c55e'];
                                            const labels = ['','Weak','Fair','Good','Strong','Perfect'];
                                            return strength > 0 ? (
                                                <span style={{ color: colors[strength-1], fontSize: '11px', fontWeight: '700' }}>
                                                    {labels[strength]}
                                                </span>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>
                            )}

                            <button
                                className="sf-submit"
                                type="submit"
                                disabled={loading || !regOtpVerified}
                                style={{
                                    ...S.submitBtn,
                                    opacity: !regOtpVerified ? 0.5 : 1,
                                    cursor:  !regOtpVerified ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? <span style={S.spinner} /> : <span>Create Account</span>}
                            </button>

                            {!regOtpVerified && (
                                <p style={{ color: '#444', fontSize: '11px', textAlign: 'center', margin: '0' }}>
                                    Verify your email to enable account creation
                                </p>
                            )}
                        </form>
                    )}

                    {/* ══════════════════════════════════════════
                        FORGOT PASSWORD VIEW
                    ══════════════════════════════════════════ */}
                    {view === 'forgot' && (
                        <>
                            {fpSuccess ? (
                                <div className="fp-success" style={S.successBox}>
                                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎉</div>
                                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>
                                        Password reset!
                                    </div>
                                    <div style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>
                                        You can now sign in with your new password.
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setView('login'); setFpSuccess(false); setFpEmail(''); setFpOtp(''); setFpNewPass(''); setFpConfirmPass(''); setFpOtpSent(false); setFpOtpVerified(false); }}
                                        style={S.submitBtn}
                                    >
                                        Back to Sign In
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleResetPassword} style={S.form}>
                                    {/* Step 1 — Email + Send OTP */}
                                    <div style={S.stepLabel}>Step 1 — Verify your email</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            className="sf-input"
                                            style={{
                                                ...S.input,
                                                flex: 1,
                                                borderColor: fpOtpVerified
                                                    ? 'rgba(34,197,94,0.6)'
                                                    : focused === 'fpEmail'
                                                        ? 'rgba(255,106,0,0.6)'
                                                        : 'rgba(255,255,255,0.08)',
                                                background: fpOtpVerified ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.04)',
                                            }}
                                            type="email"
                                            placeholder="Your email address"
                                            value={fpEmail}
                                            onChange={e => setFpEmail(e.target.value)}
                                            onFocus={() => setFocused('fpEmail')}
                                            onBlur={() => setFocused('')}
                                            required
                                            disabled={fpOtpVerified}
                                        />
                                        {!fpOtpVerified && (
                                            <button
                                                type="button"
                                                onClick={handleSendFpOtp}
                                                disabled={sendingFpOtp || !fpEmail || fpCooldown > 0}
                                                style={{
                                                    ...S.sendOtpBtn,
                                                    padding: '0 14px',
                                                    height: 'auto',
                                                    alignSelf: 'stretch',
                                                    opacity: (!fpEmail || fpCooldown > 0 || sendingFpOtp) ? 0.5 : 1,
                                                }}
                                            >
                                                {sendingFpOtp
                                                    ? <span style={S.spinnerSm} />
                                                    : fpCooldown > 0
                                                        ? `${fpCooldown}s`
                                                        : fpOtpSent ? 'Resend' : 'Send OTP'
                                                }
                                            </button>
                                        )}
                                    </div>

                                    {/* OTP entry — shown after sending */}
                                    {(fpOtpSent || fpOtpVerified) && (
                                        <div className="otp-section" style={S.otpBox}>
                                            <div style={S.otpBoxLabel}>
                                                {fpOtpVerified
                                                    ? '✓ Email verified'
                                                    : `OTP sent to ${fpEmail}`
                                                }
                                            </div>
                                            {!fpOtpVerified && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        className="sf-input"
                                                        style={{
                                                            ...S.input,
                                                            flex: 1,
                                                            letterSpacing: '0.25em',
                                                            fontFamily: "'Space Grotesk', sans-serif",
                                                            fontSize: '16px',
                                                            borderColor: focused === 'fpOtp' ? 'rgba(255,106,0,0.6)' : 'rgba(255,255,255,0.08)',
                                                        }}
                                                        placeholder="000000"
                                                        value={fpOtp}
                                                        onChange={e => setFpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        onFocus={() => setFocused('fpOtp')}
                                                        onBlur={() => setFocused('')}
                                                        maxLength={6}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleVerifyFpOtp}
                                                        disabled={verifyingFp || fpOtp.length < 6}
                                                        style={{
                                                            ...S.otpActionBtn,
                                                            opacity: fpOtp.length < 6 ? 0.45 : 1,
                                                        }}
                                                    >
                                                        {verifyingFp ? <span style={S.spinnerSm} /> : 'Verify'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 2 — New password — only shown after OTP verified */}
                                    {fpOtpVerified && (
                                        <div className="otp-section" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={S.stepLabel}>Step 2 — Set new password</div>
                                            <input
                                                className="sf-input"
                                                style={{
                                                    ...S.input,
                                                    borderColor: focused === 'fpNewPass' ? 'rgba(255,106,0,0.6)' : 'rgba(255,255,255,0.08)',
                                                }}
                                                type="password"
                                                placeholder="New password"
                                                value={fpNewPass}
                                                onChange={e => setFpNewPass(e.target.value)}
                                                onFocus={() => setFocused('fpNewPass')}
                                                onBlur={() => setFocused('')}
                                                required
                                            />
                                            <input
                                                className="sf-input"
                                                style={{
                                                    ...S.input,
                                                    borderColor: fpConfirmPass && fpConfirmPass !== fpNewPass
                                                        ? 'rgba(239,68,68,0.6)'
                                                        : focused === 'fpConfirm'
                                                            ? 'rgba(255,106,0,0.6)'
                                                            : 'rgba(255,255,255,0.08)',
                                                }}
                                                type="password"
                                                placeholder="Confirm new password"
                                                value={fpConfirmPass}
                                                onChange={e => setFpConfirmPass(e.target.value)}
                                                onFocus={() => setFocused('fpConfirm')}
                                                onBlur={() => setFocused('')}
                                                required
                                            />
                                            {fpConfirmPass && fpConfirmPass !== fpNewPass && (
                                                <p style={{ color: '#f87171', fontSize: '11px', margin: 0 }}>
                                                    Passwords don't match
                                                </p>
                                            )}
                                            <button
                                                className="sf-submit"
                                                type="submit"
                                                disabled={loading || !fpNewPass || fpNewPass !== fpConfirmPass}
                                                style={{
                                                    ...S.submitBtn,
                                                    opacity: (!fpNewPass || fpNewPass !== fpConfirmPass) ? 0.5 : 1,
                                                }}
                                            >
                                                {loading ? <span style={S.spinner} /> : <span>Reset Password</span>}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            )}
                        </>
                    )}

                    {/* ── Toggle row ── */}
                    <div style={S.toggleRow}>
                        {view === 'login' && (
                            <>
                                <span style={S.toggleText}>New here?</span>
                                <button style={S.toggleBtn} onClick={switchToRegister} type="button">
                                    Create account →
                                </button>
                            </>
                        )}
                        {view === 'register' && (
                            <>
                                <span style={S.toggleText}>Have an account?</span>
                                <button style={S.toggleBtn} onClick={switchToLogin} type="button">
                                    Sign in →
                                </button>
                            </>
                        )}
                        {view === 'forgot' && !fpSuccess && (
                            <>
                                <span style={S.toggleText}>Remember it?</span>
                                <button style={S.toggleBtn} onClick={switchToLogin} type="button">
                                    Back to Sign in →
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ── Particles styles ──────────────────────────────────────────
const P = {
    canvas: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' },
    dot: { position: 'absolute', borderRadius: '50%', background: '#FF6A00', animation: 'floatY linear infinite' },
};

// ── Main styles ───────────────────────────────────────────────
const S = {
    page: {
        minHeight: '100vh',
        background: '#0B0B0B',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative', overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
    },
    meshBg: {
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 20%, rgba(255,106,0,0.07) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(255,106,0,0.05) 0%, transparent 55%)',
    },
    bgWordmark: {
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 'clamp(50px, 18vw, 110px)',
        fontWeight: '800',
        color: 'rgba(255,106,0,0.03)',
        letterSpacing: '0.12em',
        pointerEvents: 'none', userSelect: 'none',
        whiteSpace: 'nowrap', zIndex: 0,
    },
    card: {
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '400px',
        background: 'rgba(16,13,11,0.95)',
        backdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,106,0,0.12)',
        padding: '36px 28px 28px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,106,0,0.07)',
    },
    cardTopLine: {
        position: 'absolute', top: 0, left: '20%', right: '20%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,106,0,0.7), transparent)',
        borderRadius: '999px',
    },
    logoWrap: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' },
    logoIconWrap: {
        width: '44px', height: '44px',
        borderRadius: '12px',
        background: 'rgba(255,106,0,0.1)',
        border: '1px solid rgba(255,106,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulseMark 3s ease infinite', flexShrink: 0,
    },
    logoText: {
        fontFamily: "'Space Grotesk', sans-serif",
        color: '#ffffff', fontSize: '18px', fontWeight: '800',
        letterSpacing: '-0.3px', lineHeight: 1,
    },
    logoSub: { color: '#444', fontSize: '10px', fontWeight: '500', letterSpacing: '0.08em', marginTop: '3px' },
    titleWrap: { marginBottom: '24px' },
    title: {
        fontFamily: "'Space Grotesk', sans-serif",
        color: '#ffffff', fontSize: '26px', fontWeight: '800',
        margin: '0 0 10px', letterSpacing: '-0.5px',
    },
    titleLine: {
        width: '40px', height: '2px',
        background: 'linear-gradient(90deg, #FF6A00, transparent)',
        borderRadius: '999px', marginBottom: '10px',
        animation: 'lineExpand 0.8s ease 0.3s both',
    },
    subtitle: { color: '#666', fontSize: '13px', margin: 0, letterSpacing: '0.01em' },
    errorBox: {
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.25)',
        color: '#f87171',
        padding: '10px 14px', borderRadius: '10px',
        marginBottom: '16px', fontSize: '13px',
        display: 'flex', gap: '8px', alignItems: 'center',
    },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    input: {
        width: '100%', padding: '13px 16px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        color: '#ffffff', fontSize: '14px',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, background 0.2s',
        fontFamily: "'DM Sans', sans-serif",
    },
    submitBtn: {
        width: '100%', padding: '14px', marginTop: '4px',
        background: 'linear-gradient(135deg, #FF6A00 0%, #cc5200 50%, #FF6A00 100%)',
        backgroundSize: '200% auto',
        animation: 'shimmerOrange 3s linear infinite',
        color: '#ffffff', border: 'none', borderRadius: '12px',
        fontWeight: '700', fontSize: '15px',
        letterSpacing: '0.04em', cursor: 'pointer',
        transition: 'transform 0.2s, filter 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '50px',
        fontFamily: "'Space Grotesk', sans-serif",
    },
    spinner: {
        width: '18px', height: '18px', borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
    },
    spinnerSm: {
        width: '13px', height: '13px', borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
    },
    dividerRow: { display: 'flex', alignItems: 'center', gap: '12px', margin: '2px 0' },
    dividerLine: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' },
    dividerText: { color: '#333', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase' },
    googleWrap: { width: '100%', display: 'flex', justifyContent: 'center' },
    toggleRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' },
    toggleText: { color: '#555', fontSize: '13px' },
    toggleBtn: {
        background: 'none', border: 'none',
        color: '#FF6A00', fontSize: '13px', fontWeight: '700',
        cursor: 'pointer', letterSpacing: '0.02em',
        fontFamily: "'Space Grotesk', sans-serif", padding: 0,
    },
    forgotLink: {
        background: 'none', border: 'none',
        color: '#FF6A00', fontSize: '12px', fontWeight: '600',
        cursor: 'pointer', padding: 0,
        fontFamily: "'DM Sans', sans-serif",
        opacity: 0.8,
    },

    // OTP section box
    otpBox: {
        background: 'rgba(255,106,0,0.04)',
        border: '1px solid rgba(255,106,0,0.15)',
        borderRadius: '12px',
        padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: '10px',
    },
    otpBoxLabel: {
        color: '#888', fontSize: '12px', fontWeight: '500',
        letterSpacing: '0.02em',
    },

    // Send OTP button (ghost style)
    sendOtpBtn: {
        background: 'rgba(255,106,0,0.1)',
        border: '1px solid rgba(255,106,0,0.3)',
        color: '#FF6A00',
        borderRadius: '12px',
        padding: '10px 14px',
        fontSize: '12px', fontWeight: '700',
        cursor: 'pointer', whiteSpace: 'nowrap',
        fontFamily: "'Space Grotesk', sans-serif",
        display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'opacity 0.2s',
    },

    // Verify OTP button (solid small)
    otpActionBtn: {
        background: 'rgba(255,106,0,0.85)',
        border: 'none',
        color: '#fff',
        borderRadius: '10px',
        padding: '0 16px',
        fontSize: '13px', fontWeight: '700',
        cursor: 'pointer', whiteSpace: 'nowrap',
        fontFamily: "'Space Grotesk', sans-serif",
        display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'opacity 0.2s',
        minWidth: '70px', justifyContent: 'center',
    },

    verifiedBadge: {
        background: 'rgba(34,197,94,0.12)',
        border: '1px solid rgba(34,197,94,0.3)',
        color: '#4ade80',
        borderRadius: '10px',
        padding: '0 14px',
        fontSize: '12px', fontWeight: '700',
        display: 'flex', alignItems: 'center',
        whiteSpace: 'nowrap',
        fontFamily: "'Space Grotesk', sans-serif",
    },

    stepLabel: {
        color: '#FF6A00', fontSize: '11px', fontWeight: '700',
        letterSpacing: '0.08em', textTransform: 'uppercase',
    },

    successBox: {
        background: 'rgba(34,197,94,0.05)',
        border: '1px solid rgba(34,197,94,0.15)',
        borderRadius: '16px',
        padding: '28px 20px',
        textAlign: 'center',
    },
};