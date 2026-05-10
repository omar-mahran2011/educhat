export function Avatar({ user, size = 40 }) {
  const c = user?.color || '#64748b'
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: c + '22',
      border: `2px solid ${c}44`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * .46, flexShrink: 0 }}>
      {user?.avatar || '👤'}
    </div>
  )
}

export function RoleTag({ role, sm }) {
  const map = { admin: ['مدير','#6366f1'], teacher: ['مدرس','#0ea5e9'], student: ['طالب','#10b981'] }
  const [label, color] = map[role] || ['؟','#64748b']
  return (
    <span style={{ background: color + '1a', color, fontSize: sm ? 9 : 10, fontWeight: 700,
      padding: sm ? '1px 5px' : '2px 8px', borderRadius: 20,
      border: `1px solid ${color}33`, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

export function Spinner({ size = 22, color = '#6366f1' }) {
  return <div style={{ width: size, height: size, border: `3px solid ${color}33`,
    borderTopColor: color, borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 }} />
}

export function Toggle({ value, onChange, disabled }) {
  return (
    <div onClick={() => !disabled && onChange(!value)} style={{ width: 46, height: 26, borderRadius: 13,
      background: value ? '#6366f1' : 'rgba(255,255,255,.12)', position: 'relative',
      cursor: disabled ? 'default' : 'pointer', transition: 'background .25s',
      opacity: disabled ? .5 : 1, flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 20, height: 20,
        borderRadius: '50%', background: '#fff', transition: 'left .25s',
        boxShadow: '0 1px 4px rgba(0,0,0,.3)' }} />
    </div>
  )
}

export function BottomNav({ active, go, T }) {
  const tabs = [
    { id: 'groups', icon: '💬', label: 'الرسائل' },
    { id: 'settings', icon: '⚙️', label: 'الإعدادات' },
  ]
  return (
    <div style={{ background: T.navBg, borderTop: `1px solid ${T.border}`, display: 'flex', flexShrink: 0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => go(t.id)} style={{ flex: 1, background: 'none', border: 'none',
          cursor: 'pointer', padding: '10px 0 8px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 22 }}>{t.icon}</span>
          <span style={{ fontSize: 10, color: active === t.id ? T.accent || '#6366f1' : T.textMuted,
            fontWeight: active === t.id ? 700 : 400 }}>{t.label}</span>
          {active === t.id && <div style={{ width: 4, height: 4, borderRadius: '50%',
            background: T.accent || '#6366f1' }} />}
        </button>
      ))}
    </div>
  )
}

export function Modal({ show, onClose, title, children, T }) {
  if (!show) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: T.overlay, zIndex: 1000,
      display: 'flex', alignItems: 'flex-end', direction: 'rtl' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: T.surface, borderRadius: '22px 22px 0 0', width: '100%',
        maxHeight: '92dvh', overflowY: 'auto', animation: 'slideUp .3s ease' }}>
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0,
          background: T.surface, zIndex: 1 }}>
          <span style={{ color: T.text, fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{ background: T.surface2, border: 'none', borderRadius: 10,
            width: 32, height: 32, color: T.textSub, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: '20px 18px' }}>{children}</div>
      </div>
    </div>
  )
}

export function Input({ label, icon, style: extraStyle = {}, T, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ color: T.textSub, fontSize: 13, display: 'block', marginBottom: 7 }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 17, pointerEvents: 'none' }}>{icon}</span>}
        <input style={{ width: '100%', padding: icon ? '13px 44px 13px 14px' : '13px 14px',
          background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, borderRadius: 14,
          color: T.text, fontSize: 15, outline: 'none', boxSizing: 'border-box',
          transition: 'border-color .2s', ...extraStyle }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = T.inputBorder}
          {...props} />
      </div>
    </div>
  )
}

export function Btn({ children, onClick, disabled, variant = 'primary', size = 'md', T }) {
  const pad = size === 'sm' ? '8px 16px' : size === 'lg' ? '16px 24px' : '13px 20px'
  const fsize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14
  const styles = {
    primary: { background: disabled ? T.surface2 : 'linear-gradient(135deg,#6366f1,#7c3aed)', color: disabled ? T.textMuted : '#fff', boxShadow: disabled ? 'none' : '0 6px 20px rgba(99,102,241,.35)' },
    danger:  { background: 'rgba(239,68,68,.15)', color: '#f87171', border: '1px solid rgba(239,68,68,.3)' },
    ghost:   { background: T.surface2, color: T.textSub, border: `1px solid ${T.border}` },
    success: { background: 'rgba(16,185,129,.15)', color: '#34d399', border: '1px solid rgba(16,185,129,.3)' },
  }
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: pad, borderRadius: 14, border: 'none', fontSize: fsize, fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer', transition: 'all .2s', display: 'flex',
        alignItems: 'center', justifyContent: 'center', gap: 8, ...styles[variant] }}>
      {children}
    </button>
  )
}

export function Card({ children, style = {}, T }) {
  return <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', ...style }}>{children}</div>
}

export function SRow({ icon, label, sub, right, onClick, danger, last, T }) {
  return <>
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px',
      cursor: onClick ? 'pointer' : 'default', transition: 'background .15s' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = T.surface2)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0,
        background: danger ? 'rgba(239,68,68,.12)' : T.surface2,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: danger ? '#f87171' : T.text, fontSize: 14, fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
    {!last && <div style={{ height: 1, background: T.border, margin: '0 16px' }} />}
  </>
}

export function SecLabel({ t, T }) {
  return <div style={{ padding: '16px 18px 6px', color: '#6366f1', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>{t}</div>
}

export function ErrBox({ msg, T }) {
  return msg ? <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)',
    borderRadius: 10, padding: '10px 14px', color: '#fca5a5', fontSize: 12,
    lineHeight: 1.6, marginBottom: 12 }}>⚠️ {msg}</div> : null
}

export function EmptyState({ icon, title, sub, T }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 24px', color: T.textMuted }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 16, color: T.textSub, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 13 }}>{sub}</div>}
    </div>
  )
}
