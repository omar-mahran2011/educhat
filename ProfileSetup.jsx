import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { Spinner, ErrBox } from '../components/UI.jsx'

const AVATARS = ['👤','👨','👩','👧','👦','🧑','👨‍💼','👩‍🏫','👨‍🏫','🧑‍🎓','👩‍🎓','👨‍🎓','🧑‍💼','👷','👩‍💻']
const COLORS  = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16']

export default function ProfileSetup({ authUser, T, onDone }) {
  const [name, setName]     = useState(authUser.user_metadata?.full_name || authUser.user_metadata?.name || '')
  const [avatar, setAvatar] = useState('👤')
  const [color, setColor]   = useState('#6366f1')
  const [loading, setLoading] = useState(false)
  const [err, setErr]       = useState('')

  async function save() {
    setErr('')
    if (!name.trim()) { setErr('ادخل اسمك الكامل'); return }
    setLoading(true)
    const { data, error } = await supabase.from('users')
      .upsert({ id: authUser.id, name: name.trim(), avatar, color,
        email: authUser.email || null })
      .select().single()
    if (error) { setErr(error.message); setLoading(false); return }
    // Add user to all existing groups
    const { data: groups } = await supabase.from('groups').select('id')
    if (groups?.length) {
      await supabase.from('group_members')
        .upsert(groups.map(g => ({ group_id: g.id, user_id: authUser.id })))
    }
    onDone(data)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0f172a,#1e1b4b,#0f172a)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, direction: 'rtl', fontFamily: "'Segoe UI',Tahoma,sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(99,102,241,.12) 0%,transparent 70%)',
        top: -100, right: -100, pointerEvents: 'none' }} />
      <div style={{ background: T.surface, border: `1px solid ${T.borderStrong}`, borderRadius: 24,
        padding: '36px 28px', width: '100%', maxWidth: 440,
        boxShadow: '0 30px 60px rgba(0,0,0,.6)', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 78, height: 78, borderRadius: '50%', background: color + '25',
            border: `3px solid ${color}55`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 38, margin: '0 auto 14px' }}>{avatar}</div>
          <h2 style={{ color: T.text, fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>أهلاً! أكمل ملفك الشخصي</h2>
          <p style={{ color: T.textMuted, fontSize: 13 }}>اختار أيقونتك ولونك المفضل</p>
        </div>

        {/* Avatar picker */}
        <p style={{ color: T.textMuted, fontSize: 12, marginBottom: 8 }}>اختار أيقونة</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 16 }}>
          {AVATARS.map(a => (
            <button key={a} onClick={() => setAvatar(a)} style={{
              background: avatar === a ? 'rgba(99,102,241,.2)' : T.surface2,
              border: avatar === a ? '2px solid #6366f1' : `1px solid ${T.border}`,
              borderRadius: 12, padding: '10px 4px', fontSize: 24, cursor: 'pointer', transition: 'all .15s' }}>
              {a}
            </button>
          ))}
        </div>

        {/* Color picker */}
        <p style={{ color: T.textMuted, fontSize: 12, marginBottom: 10 }}>اختار لون</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width: 32, height: 32, borderRadius: '50%', background: c,
              border: color === c ? '3px solid #fff' : '2px solid transparent',
              cursor: 'pointer', transition: 'transform .15s', boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.15)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
          ))}
        </div>

        {/* Name */}
        <label style={{ color: T.textSub, fontSize: 13, display: 'block', marginBottom: 8 }}>اسمك الكامل</label>
        <input value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          placeholder="ادخل اسمك الكامل" autoFocus
          style={{ width: '100%', padding: '13px 14px', background: T.inputBg,
            border: `1.5px solid ${T.inputBorder}`, borderRadius: 14, color: T.text,
            fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 14 }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = T.inputBorder} />

        <ErrBox msg={err} T={T} />
        <button onClick={save} disabled={loading || !name.trim()}
          style={{ width: '100%', padding: 15,
            background: name.trim() && !loading ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : T.surface2,
            border: 'none', borderRadius: 14,
            color: name.trim() && !loading ? '#fff' : T.textMuted,
            fontSize: 16, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: name.trim() ? '0 8px 24px rgba(99,102,241,.4)' : 'none' }}>
          {loading ? <Spinner size={20} color="#fff" /> : 'ابدأ الاستخدام 🎉'}
        </button>
      </div>
    </div>
  )
}
