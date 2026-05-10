import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { Avatar, RoleTag, Toggle, BottomNav, Modal, Card, SRow, SecLabel, Spinner, ErrBox } from '../components/UI.jsx'
import { THEMES, ACCENT_COLORS, FONT_SIZES, saveSettings } from '../lib/theme.js'

const AVATARS = ['👤','👨','👩','👧','👦','🧑','👨‍💼','👩‍🏫','👨‍🏫','🧑‍🎓','👩‍🎓','👨‍🎓','🧑‍💼','👷','👩‍💻']
const C_LIST  = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16']

export default function SettingsScreen({ user, settings, onSettingsChange, onUserUpdate, onLogout, onNav, T }) {
  const [modal, setModal]       = useState(null)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  // profile
  const [name, setName]   = useState(user.name)
  const [bio, setBio]     = useState(user.bio || '')
  const [avatar, setAvatar] = useState(user.avatar || '👤')
  const [color, setColor]   = useState(user.color || '#6366f1')
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  async function saveProfile() {
    setErr(''); setSaving(true)
    const { data, error } = await supabase.from('users')
      .update({ name: name.trim(), bio, avatar, color }).eq('id', user.id).select().single()
    setSaving(false)
    if (error) { setErr(error.message); return }
    onUserUpdate(data); setModal(null)
  }

  function updateSettings(key, val) {
    const next = { ...settings, [key]: val }
    saveSettings(next)
    onSettingsChange(next)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    onLogout()
  }

  return (
    <div style={{ height: '100dvh', background: T.bg, display: 'flex', flexDirection: 'column',
      direction: 'rtl', fontFamily: "'Segoe UI',Tahoma,sans-serif", overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ background: T.header, padding: '44px 18px 18px',
        borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => onNav('groups')}
            style={{ width: 38, height: 38, background: T.surface2, border: `1px solid ${T.border}`,
              borderRadius: 12, color: T.textSub, fontSize: 22, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <span style={{ color: T.text, fontWeight: 800, fontSize: 20 }}>الإعدادات</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 32px' }}>

        {/* Profile card */}
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <div onClick={() => setModal('profile')}
            style={{ background: `linear-gradient(135deg,${user.color || '#6366f1'}15,${user.color || '#6366f1'}05)`,
              border: `1px solid ${user.color || '#6366f1'}22`, borderRadius: 20, padding: '18px 18px',
              display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'border-color .2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = (user.color || '#6366f1') + '55'}
            onMouseLeave={e => e.currentTarget.style.borderColor = (user.color || '#6366f1') + '22'}>
            <div style={{ position: 'relative' }}>
              <Avatar user={user} size={60} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22,
                background: '#6366f1', borderRadius: '50%', border: `2px solid ${T.bg}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✏️</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: T.text, fontWeight: 800, fontSize: 17 }}>{user.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <RoleTag role={user.role} />
                <span style={{ color: T.textMuted, fontSize: 12 }}>{user.phone || user.email || ''}</span>
              </div>
              {user.bio && <div style={{ color: T.textSub, fontSize: 12, marginTop: 4 }}>{user.bio}</div>}
            </div>
            <span style={{ color: T.textMuted, fontSize: 22 }}>›</span>
          </div>
        </div>

        {/* ── Appearance ─── */}
        <SecLabel t="المظهر" T={T} />
        <Card T={T} style={{ marginBottom: 16 }}>
          {/* Theme */}
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🎨 ثيم التطبيق</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {Object.values(THEMES).map(th => (
                <button key={th.id} onClick={() => updateSettings('theme', th.id)}
                  style={{ background: th.bg, border: settings.theme === th.id ? '2px solid #6366f1' : `1px solid ${T.border}`,
                    borderRadius: 14, padding: '12px 8px', cursor: 'pointer', transition: 'all .2s',
                    boxShadow: settings.theme === th.id ? '0 0 0 3px rgba(99,102,241,.3)' : 'none' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{th.emoji}</div>
                  <div style={{ color: th.text, fontSize: 11, fontWeight: 600 }}>{th.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🎯 لون التمييز</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {ACCENT_COLORS.map(ac => (
                <button key={ac.id} onClick={() => updateSettings('accent', ac.value)}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: ac.value,
                    border: settings.accent === ac.value ? '3px solid #fff' : '2px solid transparent',
                    cursor: 'pointer', transition: 'transform .15s',
                    boxShadow: settings.accent === ac.value ? `0 0 0 2px ${ac.value}` : 'none' }}
                  title={ac.label}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.15)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
              ))}
            </div>
          </div>

          {/* Font size */}
          <div style={{ padding: '14px 18px' }}>
            <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🔤 حجم الخط</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {FONT_SIZES.map(fs => (
                <button key={fs.id} onClick={() => updateSettings('fontSize', fs.id)}
                  style={{ flex: 1, padding: '10px 8px',
                    background: settings.fontSize === fs.id ? 'rgba(99,102,241,.2)' : T.surface2,
                    border: settings.fontSize === fs.id ? '1.5px solid rgba(99,102,241,.6)' : `1px solid ${T.border}`,
                    borderRadius: 12, color: settings.fontSize === fs.id ? '#a5b4fc' : T.textSub,
                    fontSize: fs.base, fontWeight: 600, cursor: 'pointer' }}>
                  {fs.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Notifications ── */}
        <SecLabel t="الإشعارات" T={T} />
        <Card T={T} style={{ marginBottom: 16 }}>
          <SRow T={T} icon="🔔" label="الإشعارات" sub="تفعيل إشعارات الرسائل الجديدة"
            right={<Toggle value={settings.notif !== false} onChange={v => updateSettings('notif', v)} />} />
          <SRow T={T} icon="🔊" label="الأصوات" sub="صوت عند استلام رسالة"
            right={<Toggle value={settings.sound !== false} onChange={v => updateSettings('sound', v)} />} last />
        </Card>

        {/* ── Account ── */}
        <SecLabel t="الحساب" T={T} />
        <Card T={T} style={{ marginBottom: 16 }}>
          <SRow T={T} icon="📱" label="طريقة الدخول" sub={user.phone ? `هاتف: ${user.phone}` : user.email ? `Google: ${user.email}` : 'غير محدد'} />
          <SRow T={T} icon="🏷️" label="الدور الحالي"
            right={<RoleTag role={user.role} />} last />
        </Card>

        {/* ── About ── */}
        <SecLabel t="عن التطبيق" T={T} />
        <Card T={T} style={{ marginBottom: 16 }}>
          <SRow T={T} icon="🎓" label="EduChat Pro" sub="الإصدار 2.0.0" />
          <SRow T={T} icon="🌐" label="الدعم الفني" sub="تواصل مع المطور" last />
        </Card>

        {/* ── Logout ── */}
        <Card T={T}>
          <SRow T={T} icon="🚪" label="تسجيل الخروج"
            right={<span style={{ color: '#f87171', fontSize: 20 }}>›</span>}
            onClick={() => setLogoutConfirm(true)} danger last />
        </Card>
      </div>

      <BottomNav active="settings" go={onNav} T={T} />

      {/* ── Edit Profile Modal ── */}
      <Modal show={modal === 'profile'} onClose={() => setModal(null)} title="تعديل الملف الشخصي" T={T}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: color + '25',
            border: `3px solid ${color}55`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 36, margin: '0 auto' }}>{avatar}</div>
        </div>
        <p style={{ color: T.textMuted, fontSize: 12, marginBottom: 8 }}>اختار أيقونة</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 14 }}>
          {AVATARS.map(a => (
            <button key={a} onClick={() => setAvatar(a)} style={{
              background: avatar === a ? 'rgba(99,102,241,.2)' : T.surface2,
              border: avatar === a ? '2px solid #6366f1' : `1px solid ${T.border}`,
              borderRadius: 12, padding: '9px 4px', fontSize: 22, cursor: 'pointer' }}>{a}</button>
          ))}
        </div>
        <p style={{ color: T.textMuted, fontSize: 12, marginBottom: 10 }}>اختار لون</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {C_LIST.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: '50%',
              background: c, border: color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
          ))}
        </div>
        <label style={{ color: T.textSub, fontSize: 13, display: 'block', marginBottom: 7 }}>الاسم</label>
        <input value={name} onChange={e => setName(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', background: T.inputBg,
            border: `1.5px solid ${T.inputBorder}`, borderRadius: 12, color: T.text,
            fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = T.inputBorder} />
        <label style={{ color: T.textSub, fontSize: 13, display: 'block', marginBottom: 7 }}>نبذة (اختياري)</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
          style={{ width: '100%', padding: '12px 14px', background: T.inputBg,
            border: `1.5px solid ${T.inputBorder}`, borderRadius: 12, color: T.text,
            fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 20 }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = T.inputBorder} />
        <ErrBox msg={err} T={T} />
        <button onClick={saveProfile} disabled={saving}
          style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
            border: 'none', borderRadius: 14, color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {saving ? <Spinner size={20} color="#fff" /> : 'حفظ التغييرات'}
        </button>
      </Modal>

      {/* Logout confirm */}
      {logoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: T.overlay, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, direction: 'rtl' }}>
          <div style={{ background: T.surface, borderRadius: 20, padding: '28px 24px',
            width: '100%', maxWidth: 340, textAlign: 'center', animation: 'pop .2s ease' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
            <h3 style={{ color: T.text, margin: '0 0 8px', fontSize: 18 }}>تسجيل الخروج؟</h3>
            <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 24 }}>هل أنت متأكد؟</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setLogoutConfirm(false)}
                style={{ flex: 1, padding: 13, background: T.surface2, border: `1px solid ${T.border}`,
                  borderRadius: 14, color: T.textSub, fontSize: 15, cursor: 'pointer' }}>إلغاء</button>
              <button onClick={handleLogout}
                style={{ flex: 1, padding: 13, background: 'rgba(239,68,68,.18)',
                  border: '1px solid rgba(239,68,68,.3)', borderRadius: 14, color: '#f87171',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>خروج</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
