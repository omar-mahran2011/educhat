import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { Spinner, ErrBox } from '../components/UI.jsx'

export default function LoginScreen({ T }) {
  const [step, setStep]     = useState(0) // 0=email, 1=otp
  const [email, setEmail]   = useState('')
  const [otp, setOtp]       = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [err, setErr]       = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!countdown) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  async function sendOtp() {
    setErr('')
    const e = email.trim().toLowerCase()
    if (!e.includes('@') || !e.includes('.')) {
      setErr('ادخل إيميل صحيح مثال: name@gmail.com')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: e,
      options: { shouldCreateUser: true }
    })
    setLoading(false)
    if (error) {
      if (error.message.includes('rate')) setErr('تجاوزت الحد — انتظر دقيقة وحاول مرة أخرى')
      else setErr('حدث خطأ: ' + error.message)
      return
    }
    setCountdown(60)
    setStep(1)
  }

  async function verifyOtp() {
    setErr('')
    const code = otp.join('')
    if (code.length < 6) { setErr('ادخل الكود كامل (6 أرقام)'); return }
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code,
      type: 'email'
    })
    setLoading(false)
    if (error) { setErr('الكود غلط أو انتهت صلاحيته — تحقق من إيميلك'); return }
  }

  async function loginWithGoogle() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin, queryParams: { prompt: 'select_account' } }
    })
    if (error) { setErr('فشل الدخول بـ Google: ' + error.message); setLoading(false) }
  }

  function handleOtpKey(i, val) {
    if (!/^\d*$/.test(val)) return
    const n = [...otp]; n[i] = val.slice(-1); setOtp(n)
    if (val && i < 5) document.getElementById('otp' + (i + 1))?.focus()
    if (!val && i > 0) document.getElementById('otp' + (i - 1))?.focus()
  }

  const WRAP = {
    minHeight: '100dvh',
    background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#0f172a 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '24px 20px',
    fontFamily: "'Segoe UI',Tahoma,sans-serif", direction: 'rtl',
    position: 'relative', overflow: 'hidden',
  }
  const CARD = {
    background: T.surface, border: `1px solid ${T.borderStrong}`,
    borderRadius: 24, padding: '36px 28px', width: '100%', maxWidth: 420,
    boxShadow: '0 30px 60px rgba(0,0,0,.6)', position: 'relative', zIndex: 1,
  }
  const BG = <>
    <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%',
      background:'radial-gradient(circle,rgba(99,102,241,.12) 0%,transparent 70%)',
      top:-150, right:-150, pointerEvents:'none' }}/>
    <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%',
      background:'radial-gradient(circle,rgba(14,165,233,.08) 0%,transparent 70%)',
      bottom:-100, left:-100, pointerEvents:'none' }}/>
  </>
  const LOGO = (
    <div style={{ textAlign:'center', marginBottom:32 }}>
      <div style={{ width:80, height:80, borderRadius:24,
        background:'linear-gradient(135deg,#6366f1,#7c3aed)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:42, margin:'0 auto 16px', boxShadow:'0 14px 40px rgba(99,102,241,.45)' }}>🎓</div>
      <h1 style={{ color:T.text, margin:0, fontSize:28, fontWeight:800 }}>EduChat</h1>
      <p style={{ color:T.textMuted, margin:'6px 0 0', fontSize:14 }}>منصة التواصل التعليمي</p>
    </div>
  )

  const PrimaryBtn = ({ active, text, fn }) => (
    <button onClick={fn} disabled={loading || !active}
      style={{ width:'100%', padding:15,
        background: active && !loading ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : T.surface2,
        border:'none', borderRadius:14,
        color: active && !loading ? '#fff' : T.textMuted,
        fontSize:16, fontWeight:700, cursor: active && !loading ? 'pointer' : 'default',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        boxShadow: active && !loading ? '0 8px 24px rgba(99,102,241,.4)' : 'none',
        transition:'all .2s' }}>
      {loading ? <Spinner size={20} color="#fff" /> : text}
    </button>
  )

  // ── STEP 0: Email ────────────────────────────────
  if (step === 0) return (
    <div style={WRAP}>{BG}
      <div style={CARD}>
        {LOGO}

        <label style={{ color:T.textSub, fontSize:13, display:'block', marginBottom:8 }}>
          البريد الإلكتروني
        </label>
        <div style={{ position:'relative', marginBottom:14 }}>
          <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:18 }}>✉️</span>
          <input type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendOtp()}
            placeholder="example@gmail.com" autoFocus
            style={{ width:'100%', padding:'14px 48px 14px 14px',
              background:T.inputBg, border:`1.5px solid ${T.inputBorder}`,
              borderRadius:14, color:T.text, fontSize:15, outline:'none',
              boxSizing:'border-box', direction:'ltr', transition:'border-color .2s' }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = T.inputBorder} />
        </div>

        <ErrBox msg={err} T={T} />

        <div style={{ marginBottom:16 }}>
          <PrimaryBtn
            active={email.includes('@') && email.includes('.')}
            text="📧 إرسال كود التحقق"
            fn={sendOtp} />
        </div>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ flex:1, height:1, background:T.border }}/>
          <span style={{ color:T.textMuted, fontSize:12 }}>أو</span>
          <div style={{ flex:1, height:1, background:T.border }}/>
        </div>

        {/* Google */}
        <button onClick={loginWithGoogle} disabled={loading}
          style={{ width:'100%', padding:'13px 20px', background:T.surface2,
            border:`1.5px solid ${T.border}`, borderRadius:14, color:T.text,
            fontSize:15, fontWeight:600, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            transition:'all .2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#4285F4'}
          onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          تسجيل الدخول بـ Google
        </button>

        <p style={{ color:T.textMuted, fontSize:11, textAlign:'center', marginTop:18, lineHeight:1.6 }}>
          بالدخول أنت توافق على شروط الاستخدام وسياسة الخصوصية
        </p>
      </div>
    </div>
  )

  // ── STEP 1: OTP ──────────────────────────────────
  return (
    <div style={WRAP}>{BG}
      <div style={CARD}>
        <button onClick={() => { setStep(0); setOtp(['','','','','','']); setErr('') }}
          style={{ background:'none', border:'none', color:T.textMuted, cursor:'pointer',
            marginBottom:20, display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
          ← رجوع
        </button>

        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:72, height:72, borderRadius:20,
            background:'linear-gradient(135deg,rgba(99,102,241,.2),rgba(14,165,233,.15))',
            border:'1px solid rgba(99,102,241,.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:36, margin:'0 auto 16px' }}>📧</div>
          <h2 style={{ color:T.text, fontSize:20, fontWeight:800, margin:'0 0 8px' }}>
            تحقق من إيميلك
          </h2>
          <p style={{ color:T.textMuted, fontSize:13, lineHeight:1.7, marginBottom:10 }}>
            أرسلنا كود مكوّن من 6 أرقام إلى
          </p>
          <div style={{ background:T.surface2, border:`1px solid ${T.border}`,
            borderRadius:10, padding:'8px 16px', display:'inline-block',
            color:T.textSub, fontWeight:600, fontSize:14, direction:'ltr' }}>
            {email}
          </div>
          <div style={{ marginTop:12, background:'rgba(16,185,129,.08)',
            border:'1px solid rgba(16,185,129,.2)', borderRadius:10,
            padding:'8px 14px', color:'#34d399', fontSize:12, lineHeight:1.6 }}>
            💡 افتح إيميلك وانسخ الكود<br/>لو مش لاقيه — افتح مجلد <strong>Spam</strong>
          </div>
        </div>

        {/* OTP Boxes */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:20, direction:'ltr' }}>
          {otp.map((d, i) => (
            <input key={i} id={'otp' + i}
              type="tel" inputMode="numeric" maxLength={1} value={d}
              onChange={e => handleOtpKey(i, e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Backspace' && !otp[i] && i > 0)
                  document.getElementById('otp' + (i - 1))?.focus()
                if (e.key === 'Enter' && otp.join('').length === 6) verifyOtp()
              }}
              style={{ width:48, height:58, textAlign:'center', fontSize:24, fontWeight:700,
                background:T.inputBg,
                border:`2px solid ${d ? '#6366f1' : T.inputBorder}`,
                borderRadius:14, color:T.text, outline:'none',
                transition:'border-color .2s, box-shadow .2s' }}
              onFocus={e => { e.target.style.borderColor='#6366f1'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,.2)' }}
              onBlur={e => { e.target.style.borderColor=d?'#6366f1':T.inputBorder; e.target.style.boxShadow='none' }}
            />
          ))}
        </div>

        <ErrBox msg={err} T={T} />

        <div style={{ marginBottom:16 }}>
          <PrimaryBtn
            active={otp.join('').length === 6}
            text="تحقق وادخل ✓"
            fn={verifyOtp} />
        </div>

        {/* Resend */}
        <div style={{ textAlign:'center' }}>
          {countdown > 0 ? (
            <div style={{ color:T.textMuted, fontSize:13 }}>
              إعادة الإرسال بعد{' '}
              <span style={{ color:T.textSub, fontWeight:700 }}>{countdown}</span> ثانية
            </div>
          ) : (
            <button onClick={() => { sendOtp(); setOtp(['','','','','','']) }}
              style={{ background:'none', border:'none', color:'#6366f1',
                fontSize:13, cursor:'pointer', fontWeight:600, textDecoration:'underline' }}>
              لم يصلك الكود؟ أعد الإرسال
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
