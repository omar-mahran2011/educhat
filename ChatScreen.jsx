import { useState, useRef, useEffect } from 'react'
import { Avatar, RoleTag, EmptyState, Spinner } from '../components/UI.jsx'

export const MSG_TYPES = {
  general:      { label: '💬 عام',    color: '#64748b' },
  schedule:     { label: '📅 جدول',  color: '#6366f1' },
  announcement: { label: '📢 إعلان', color: '#ef4444' },
  lesson:       { label: '📖 درس',   color: '#0ea5e9' },
  homework:     { label: '📝 واجب',  color: '#f59e0b' },
  resource:     { label: '📎 مصدر',  color: '#10b981' },
}
export const EMOJIS = ['👍','❤️','😂','😮','😢','🔥','✅','🎯','💯','🧠']

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}
function fmtDate(ts) {
  const d = new Date(ts), now = new Date()
  if (d.toDateString() === now.toDateString()) return 'اليوم'
  const y = new Date(now); y.setDate(y.getDate() - 1)
  if (d.toDateString() === y.toDateString()) return 'أمس'
  return d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function ChatScreen({ user, users, group, messages, onSend, onReact, onBack, T, loading }) {
  const [text, setText] = useState('')
  const [msgType, setMsgType] = useState('general')
  const [pickerFor, setPickerFor] = useState(null)
  const endRef = useRef(null)

  const canSend = user.role === 'admin' || user.role === 'teacher'
  const typeOpts = user.role === 'admin' ? ['schedule','announcement','general'] : ['lesson','homework','resource','general']
  const members = (group.memberIds || []).map(id => users.find(u => u.id === id)).filter(Boolean)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.length])

  function send() {
    if (!text.trim() || !canSend) return
    onSend(group.id, text.trim(), msgType)
    setText('')
  }

  // Group by date
  const grouped = []
  let lastD = null
  ;(messages || []).forEach(m => {
    const d = fmtDate(m.created_at)
    if (d !== lastD) { grouped.push({ type: 'date', d }); lastD = d }
    grouped.push({ type: 'msg', m })
  })

  return (
    <div style={{ height: '100dvh', background: T.bg, display: 'flex', flexDirection: 'column',
      direction: 'rtl', fontFamily: "'Segoe UI',Tahoma,sans-serif" }}
      onClick={() => setPickerFor(null)}>

      {/* Header */}
      <div style={{ background: T.header, padding: '44px 16px 12px',
        borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ width: 38, height: 38, background: T.surface2,
            border: `1px solid ${T.border}`, borderRadius: 12, color: T.textSub,
            fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div style={{ width: 46, height: 46, borderRadius: 15, background: group.color + '18',
            border: `2px solid ${group.color}33`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{group.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 15, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</div>
            <div style={{ color: T.textMuted, fontSize: 12 }}>
              {members.length} أعضاء • {members.filter(u => u.role === 'student').length} طالب
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            {members.slice(0, 4).map((u, i) => (
              <div key={u.id} style={{ width: 26, height: 26, borderRadius: '50%',
                background: u.color + '30', border: `2px solid ${T.bg}`,
                marginLeft: i > 0 ? -9 : 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 12, zIndex: 4 - i }}>{u.avatar}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        ) : messages?.length === 0 ? (
          <EmptyState icon={group.icon} title="لا توجد رسائل بعد"
            sub={canSend ? 'ابدأ بإرسال رسالة' : 'انتظر رسائل من المدرس أو المدير'} T={T} />
        ) : grouped.map((item, idx) => {
          if (item.type === 'date') return (
            <div key={idx} style={{ textAlign: 'center', margin: '14px 0' }}>
              <span style={{ background: T.surface2, color: T.textMuted, fontSize: 11,
                padding: '4px 14px', borderRadius: 20, border: `1px solid ${T.border}` }}>{item.d}</span>
            </div>
          )
          const m = item.m
          const sender = users.find(u => u.id === m.sender_id)
          const mine = m.sender_id === user.id
          const info = MSG_TYPES[m.type] || MSG_TYPES.general
          const totalR = Object.values(m.reactions || {}).reduce((s, a) => s + a.length, 0)
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: mine ? 'row-reverse' : 'row',
              gap: 8, marginBottom: 14, alignItems: 'flex-end', animation: 'fadeUp .2s ease' }}>
              {!mine && <Avatar user={sender} size={30} />}
              <div style={{ maxWidth: '76%', position: 'relative' }}>
                {!mine && (
                  <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: sender?.color || T.textSub, fontSize: 12, fontWeight: 700 }}>{sender?.name}</span>
                    {sender && <RoleTag role={sender.role} sm />}
                  </div>
                )}
                {m.type && m.type !== 'general' && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 4,
                    background: info.color + '18', border: `1px solid ${info.color}33`,
                    borderRadius: 20, padding: '2px 10px', color: info.color, fontSize: 10, fontWeight: 700 }}>
                    {info.label}
                  </div>
                )}
                <div onDoubleClick={e => { e.stopPropagation(); setPickerFor(m.id) }}
                  style={{ background: mine ? T.msgOwn : T.msgOther,
                    border: mine ? 'none' : `1px solid ${T.border}`,
                    borderRadius: mine ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    padding: '11px 13px', cursor: 'default',
                    boxShadow: mine ? '0 4px 14px rgba(99,102,241,.25)' : 'none', position: 'relative' }}>
                  <p style={{ color: mine ? '#fff' : T.msgOtherText, margin: 0, fontSize: 14,
                    lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.text}</p>
                  <div style={{ color: mine ? 'rgba(255,255,255,.55)' : T.textMuted, fontSize: 10,
                    marginTop: 5, textAlign: 'left', direction: 'ltr' }}>
                    {fmtTime(m.created_at)}{mine && ' ✓✓'}
                  </div>
                  {/* Emoji picker */}
                  {pickerFor === m.id && (
                    <div onClick={e => e.stopPropagation()}
                      style={{ position: 'absolute', bottom: 'calc(100% + 8px)',
                        right: mine ? 0 : 'auto', left: mine ? 'auto' : 0, zIndex: 100,
                        background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20,
                        padding: '8px 12px', display: 'flex', gap: 4,
                        boxShadow: '0 10px 30px rgba(0,0,0,.5)', whiteSpace: 'nowrap' }}>
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => { onReact(group.id, m.id, e); setPickerFor(null) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22,
                            padding: '4px 3px', borderRadius: 8, transition: 'transform .1s' }}
                          onMouseEnter={ev => ev.target.style.transform = 'scale(1.3)'}
                          onMouseLeave={ev => ev.target.style.transform = 'scale(1)'}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {totalR > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5,
                    justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    {Object.entries(m.reactions || {}).map(([e, arr]) => arr.length > 0 ? (
                      <button key={e} onClick={() => onReact(group.id, m.id, e)}
                        title={users.filter(u => arr.includes(u.id)).map(u => u.name).join('، ')}
                        style={{ background: arr.includes(user.id) ? 'rgba(99,102,241,.2)' : T.surface2,
                          border: arr.includes(user.id) ? '1px solid rgba(99,102,241,.5)' : `1px solid ${T.border}`,
                          borderRadius: 20, padding: '2px 8px', fontSize: 12, color: T.text,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                        {e}<span style={{ fontSize: 10, color: T.textMuted }}>{arr.length}</span>
                      </button>
                    ) : null)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ background: T.surface, borderTop: `1px solid ${T.border}`, padding: '10px 14px 14px', flexShrink: 0 }}>
        {canSend ? (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, overflowX: 'auto', paddingBottom: 2 }}>
              {typeOpts.map(t => (
                <button key={t} onClick={() => setMsgType(t)} style={{
                  background: msgType === t ? MSG_TYPES[t].color + '25' : T.surface2,
                  border: msgType === t ? `1.5px solid ${MSG_TYPES[t].color}55` : `1.5px solid ${T.border}`,
                  borderRadius: 20, padding: '5px 12px', color: msgType === t ? MSG_TYPES[t].color : T.textMuted,
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .2s' }}>
                  {MSG_TYPES[t].label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder={user.role === 'admin' ? 'اكتب إعلاناً أو جدول...' : 'اكتب رسالتك للطلاب...'} rows={2}
                style={{ flex: 1, background: T.inputBg, border: `1.5px solid ${T.inputBorder}`,
                  borderRadius: 16, padding: '12px 14px', color: T.text, fontSize: 14,
                  resize: 'none', outline: 'none', lineHeight: 1.5, transition: 'border-color .2s' }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = T.inputBorder} />
              <button onClick={send} disabled={!text.trim()}
                style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, border: 'none',
                  background: text.trim() ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : T.surface2,
                  cursor: text.trim() ? 'pointer' : 'default', fontSize: 20,
                  boxShadow: text.trim() ? '0 4px 14px rgba(99,102,241,.35)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                ✈️
              </button>
            </div>
          </>
        ) : (
          <div style={{ background: 'rgba(16,185,129,.07)', border: '1px solid rgba(16,185,129,.18)',
            borderRadius: 16, padding: '12px 16px' }}>
            <div style={{ color: '#34d399', fontSize: 13, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>
              👨‍🎓 تفاعل على الرسائل — اضغط مرتين لإضافة إيموجي
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {EMOJIS.slice(0, 6).map(e => (
                <button key={e} onClick={() => {
                  const last = messages?.[messages.length - 1]
                  if (last) onReact(group.id, last.id, e)
                }} style={{ background: T.surface2, border: `1px solid ${T.border}`,
                  borderRadius: 20, padding: '5px 10px', fontSize: 18, cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
