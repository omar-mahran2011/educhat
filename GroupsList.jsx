import { useState } from 'react'
import { Avatar, RoleTag, BottomNav, EmptyState } from '../components/UI.jsx'

const MSG_TYPE_LABELS = {
  schedule:'📅', announcement:'📢', lesson:'📖', homework:'📝', resource:'📎', general:'💬'
}

function timeAgo(ts) {
  if (!ts) return ''
  const d = Date.now() - new Date(ts).getTime()
  if (d < 60000) return 'الآن'
  if (d < 3600000) return Math.floor(d/60000) + 'د'
  if (d < 86400000) return Math.floor(d/3600000) + 'س'
  return Math.floor(d/86400000) + 'ي'
}

export default function GroupsList({ user, groups, messages, users, onOpen, onNav, T }) {
  const [search, setSearch] = useState('')
  const filtered = groups.filter(g => g.name.includes(search) || g.description?.includes(search))

  return (
    <div style={{ height: '100dvh', background: T.bg, display: 'flex', flexDirection: 'column',
      direction: 'rtl', fontFamily: "'Segoe UI',Tahoma,sans-serif" }}>

      {/* Header */}
      <div style={{ background: T.header, padding: '44px 18px 14px',
        borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Avatar user={user} size={46} />
              <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12,
                borderRadius: '50%', background: '#22c55e', border: `2px solid ${T.surface}` }} />
            </div>
            <div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 16 }}>{user.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <RoleTag role={user.role} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {user.role === 'admin' && (
              <button onClick={() => onNav('admin')}
                style={{ width: 38, height: 38, background: 'rgba(99,102,241,.15)',
                  border: '1px solid rgba(99,102,241,.3)', borderRadius: 12, color: '#a5b4fc',
                  fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🛡️
              </button>
            )}
            <button onClick={() => onNav('settings')}
              style={{ width: 38, height: 38, background: T.surface2, border: `1px solid ${T.border}`,
                borderRadius: 12, color: T.textSub, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ⚙️
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ background: T.inputBg, borderRadius: 14, padding: '11px 16px',
          display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${T.border}` }}>
          <span style={{ color: T.textMuted, fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث في المجموعات..." style={{ background: 'none', border: 'none',
              outline: 'none', color: T.text, fontSize: 14, width: '100%' }} />
          {search && <button onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 16 }}>✕</button>}
        </div>
      </div>

      {/* Groups list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <EmptyState icon="💬" title={search ? 'لا نتائج' : 'لا توجد مجموعات'} sub={search ? 'جرّب كلمة أخرى' : 'ستظهر المجموعات هنا'} T={T} />
        ) : (
          <>
            <div style={{ padding: '10px 18px 4px', color: T.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: .8 }}>
              مجموعاتي ({filtered.length})
            </div>
            {filtered.map((g) => {
              const msgs = messages[g.id] || []
              const last = msgs[msgs.length - 1]
              const lastSender = last ? users.find(u => u.id === last.sender_id) : null
              return (
                <div key={g.id} onClick={() => onOpen(g)}
                  style={{ padding: '13px 18px', cursor: 'pointer', display: 'flex', gap: 14,
                    alignItems: 'center', borderBottom: `1px solid ${T.border}`, transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 54, height: 54, borderRadius: 18, background: g.color + '18',
                    border: `2px solid ${g.color}33`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 28, flexShrink: 0, position: 'relative' }}>
                    {g.icon}
                    {g.admin_only && (
                      <div style={{ position: 'absolute', bottom: -3, right: -3, width: 17, height: 17,
                        borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 9, border: `2px solid ${T.bg}` }}>🔒</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ color: T.text, fontWeight: 700, fontSize: 15, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '68%' }}>{g.name}</span>
                      {last && <span style={{ color: T.textMuted, fontSize: 11, flexShrink: 0 }}>{timeAgo(last.created_at)}</span>}
                    </div>
                    <span style={{ color: T.textMuted, fontSize: 13, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {last
                        ? `${MSG_TYPE_LABELS[last.type] || '💬'} ${lastSender?.name ? lastSender.name + ': ' : ''}${last.text.split('\n')[0]}`
                        : g.description || 'لا توجد رسائل بعد'
                      }
                    </span>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      <BottomNav active="groups" go={onNav} T={T} />
    </div>
  )
}
