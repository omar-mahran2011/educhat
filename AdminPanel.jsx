import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { Avatar, RoleTag, Spinner, ErrBox, Modal, Card, EmptyState } from '../components/UI.jsx'

const ICONS  = ['📢','📐','🔬','📚','🎨','🏃','🎵','💻','🌍','⚗️','📊','🏛️']
const COLORS  = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6']

export default function AdminPanel({ user, T, onBack }) {
  const [tab, setTab]         = useState('users')  // users | groups | broadcast
  const [users, setUsers]     = useState([])
  const [groups, setGroups]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [modal, setModal]     = useState(null)    // 'editUser'|'editGroup'|'newGroup'|'members'
  const [selected, setSelected] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [err, setErr]         = useState('')
  const [broadcastText, setBroadcastText] = useState('')
  const [broadcastType, setBroadcastType] = useState('announcement')
  const [broadcastGroup, setBroadcastGroup] = useState('all')
  const [sending, setSending] = useState(false)
  const [sentOk, setSentOk]   = useState(false)

  // Group form
  const [gName, setGName]     = useState('')
  const [gDesc, setGDesc]     = useState('')
  const [gIcon, setGIcon]     = useState('📚')
  const [gColor, setGColor]   = useState('#6366f1')
  const [gAdminOnly, setGAdminOnly] = useState(false)
  const [gTeacher, setGTeacher] = useState('')
  const [gMembers, setGMembers] = useState([]) // for members modal

  async function loadAll() {
    setLoading(true)
    const [{ data: us }, { data: gs }] = await Promise.all([
      supabase.from('users').select('*').order('created_at'),
      supabase.from('groups').select('*, group_members(user_id)').order('created_at'),
    ])
    setUsers(us || [])
    setGroups((gs || []).map(g => ({ ...g, memberIds: (g.group_members || []).map(m => m.user_id) })))
    setLoading(false)
  }
  useEffect(() => { loadAll() }, [])

  // ── Users ─────────────────────────────────────────
  async function saveUserRole(uid, role) {
    await supabase.from('users').update({ role }).eq('id', uid)
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, role } : u))
  }
  async function removeUser(uid) {
    if (!confirm('هل أنت متأكد؟ سيتم حذف الحساب نهائياً')) return
    await supabase.from('users').delete().eq('id', uid)
    setUsers(prev => prev.filter(u => u.id !== uid))
  }

  // ── Groups ────────────────────────────────────────
  function openNewGroup() {
    setGName(''); setGDesc(''); setGIcon('📚'); setGColor('#6366f1'); setGAdminOnly(false); setGTeacher('')
    setSelected(null); setErr(''); setModal('editGroup')
  }
  function openEditGroup(g) {
    setGName(g.name); setGDesc(g.description || ''); setGIcon(g.icon); setGColor(g.color)
    setGAdminOnly(g.admin_only); setGTeacher(g.teacher_id || '')
    setSelected(g); setErr(''); setModal('editGroup')
  }
  async function saveGroup() {
    setErr(''); if (!gName.trim()) { setErr('ادخل اسم المجموعة'); return }
    setSaving(true)
    const payload = { name: gName.trim(), description: gDesc, icon: gIcon, color: gColor,
      admin_only: gAdminOnly, teacher_id: gTeacher || null, created_by: user.id }
    if (selected) {
      const { error } = await supabase.from('groups').update(payload).eq('id', selected.id)
      if (error) { setErr(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('groups').insert(payload).select().single()
      if (error) { setErr(error.message); setSaving(false); return }
      // Add all users to new group
      await supabase.from('group_members').insert(users.map(u => ({ group_id: data.id, user_id: u.id })))
    }
    await loadAll(); setSaving(false); setModal(null)
  }
  async function deleteGroup(gid) {
    if (!confirm('هل أنت متأكد؟ سيتم حذف المجموعة وكل رسائلها')) return
    await supabase.from('groups').delete().eq('id', gid)
    setGroups(prev => prev.filter(g => g.id !== gid))
  }
  async function openMembers(g) {
    setSelected(g)
    setGMembers(g.memberIds || [])
    setModal('members')
  }
  async function toggleMember(uid) {
    const gid = selected.id
    const has = gMembers.includes(uid)
    if (has) {
      await supabase.from('group_members').delete().eq('group_id', gid).eq('user_id', uid)
      setGMembers(prev => prev.filter(id => id !== uid))
    } else {
      await supabase.from('group_members').insert({ group_id: gid, user_id: uid })
      setGMembers(prev => [...prev, uid])
    }
    setGroups(prev => prev.map(g => g.id === gid ? { ...g, memberIds: has ? g.memberIds.filter(id => id !== uid) : [...g.memberIds, uid] } : g))
  }
  async function addAllMembers() {
    const gid = selected.id
    const newMembers = users.filter(u => !gMembers.includes(u.id))
    if (!newMembers.length) return
    await supabase.from('group_members').upsert(newMembers.map(u => ({ group_id: gid, user_id: u.id })))
    setGMembers(users.map(u => u.id))
    setGroups(prev => prev.map(g => g.id === gid ? { ...g, memberIds: users.map(u => u.id) } : g))
  }

  // ── Broadcast ─────────────────────────────────────
  async function sendBroadcast() {
    if (!broadcastText.trim()) return
    setSending(true)
    const targetGroups = broadcastGroup === 'all' ? groups : groups.filter(g => g.id === broadcastGroup)
    await Promise.all(targetGroups.map(g =>
      supabase.from('messages').insert({
        group_id: g.id, sender_id: user.id,
        text: broadcastText.trim(), type: broadcastType, reactions: {}
      })
    ))
    setSending(false); setSentOk(true); setBroadcastText('')
    setTimeout(() => setSentOk(false), 3000)
  }

  const fUsers = users.filter(u => u.name?.includes(search) || u.phone?.includes(search) || u.email?.includes(search))
  const fGroups = groups.filter(g => g.name.includes(search))
  const teachers = users.filter(u => u.role === 'teacher' || u.role === 'admin')

  const TABS = [
    { id: 'users',     icon: '👥', label: 'المستخدمون', count: users.length },
    { id: 'groups',    icon: '💬', label: 'المجموعات',  count: groups.length },
    { id: 'broadcast', icon: '📣', label: 'إرسال جماعي' },
  ]

  return (
    <div style={{ height: '100dvh', background: T.bg, display: 'flex', flexDirection: 'column',
      direction: 'rtl', fontFamily: "'Segoe UI',Tahoma,sans-serif" }}>

      {/* Header */}
      <div style={{ background: T.header, padding: '44px 18px 14px',
        borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button onClick={onBack} style={{ width: 38, height: 38, background: T.surface2,
            border: `1px solid ${T.border}`, borderRadius: 12, color: T.textSub, fontSize: 22,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div>
            <div style={{ color: T.text, fontWeight: 800, fontSize: 20 }}>🛡️ لوحة الإدارة</div>
            <div style={{ color: T.textMuted, fontSize: 12 }}>تحكم كامل في المنصة</div>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch('') }}
              style={{ flex: 1, padding: '9px 6px',
                background: tab === t.id ? 'rgba(99,102,241,.2)' : T.surface2,
                border: tab === t.id ? '1.5px solid rgba(99,102,241,.5)' : `1px solid ${T.border}`,
                borderRadius: 12, color: tab === t.id ? '#a5b4fc' : T.textMuted,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span>{t.label}</span>
              {t.count !== undefined && <span style={{ fontSize: 10, color: tab === t.id ? '#a5b4fc' : T.textMuted }}>({t.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar for users/groups */}
      {(tab === 'users' || tab === 'groups') && (
        <div style={{ padding: '10px 18px', background: T.surface, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ background: T.inputBg, borderRadius: 12, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${T.border}` }}>
            <span style={{ color: T.textMuted }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={tab === 'users' ? 'بحث بالاسم أو الرقم...' : 'بحث في المجموعات...'}
              style={{ background: 'none', border: 'none', outline: 'none', color: T.text, fontSize: 14, width: '100%' }} />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        ) : (

          // ── USERS TAB ──
          tab === 'users' ? (
            fUsers.length === 0 ? <EmptyState icon="👤" title="لا يوجد مستخدمون" T={T} /> :
            fUsers.map(u => (
              <div key={u.id} style={{ background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 16, padding: '14px 16px', marginBottom: 10, display: 'flex',
                alignItems: 'center', gap: 14 }}>
                <Avatar user={u} size={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{u.name}</div>
                  <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>{u.phone || u.email || '—'}</div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['admin','teacher','student'].map(role => (
                      <button key={role} onClick={() => saveUserRole(u.id, role)}
                        disabled={u.id === user.id && role !== 'admin'}
                        style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          cursor: u.id === user.id && role !== 'admin' ? 'default' : 'pointer',
                          background: u.role === role
                            ? (role==='admin'?'rgba(99,102,241,.25)':role==='teacher'?'rgba(14,165,233,.25)':'rgba(16,185,129,.25)')
                            : T.surface2,
                          border: u.role === role
                            ? (role==='admin'?'1.5px solid rgba(99,102,241,.6)':role==='teacher'?'1.5px solid rgba(14,165,233,.6)':'1.5px solid rgba(16,185,129,.6)')
                            : `1px solid ${T.border}`,
                          color: u.role === role
                            ? (role==='admin'?'#a5b4fc':role==='teacher'?'#7dd3fc':'#6ee7b7')
                            : T.textMuted,
                        }}>
                        {role==='admin'?'مدير':role==='teacher'?'مدرس':'طالب'}
                      </button>
                    ))}
                  </div>
                </div>
                {u.id !== user.id && (
                  <button onClick={() => removeUser(u.id)}
                    style={{ width: 34, height: 34, background: 'rgba(239,68,68,.1)',
                      border: '1px solid rgba(239,68,68,.2)', borderRadius: 10,
                      color: '#f87171', cursor: 'pointer', fontSize: 16, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button>
                )}
              </div>
            ))

          // ── GROUPS TAB ──
          ) : tab === 'groups' ? (
            <>
              <button onClick={openNewGroup}
                style={{ width: '100%', padding: '13px 20px', marginBottom: 14,
                  background: 'linear-gradient(135deg,#6366f1,#7c3aed)', border: 'none',
                  borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                ➕ مجموعة جديدة
              </button>
              {fGroups.length === 0 ? <EmptyState icon="💬" title="لا توجد مجموعات" T={T} /> :
              fGroups.map(g => (
                <div key={g.id} style={{ background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 16, padding: '14px 16px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 14, background: g.color + '18',
                      border: `2px solid ${g.color}33`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 24 }}>{g.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{g.name}</div>
                      <div style={{ color: T.textMuted, fontSize: 12 }}>
                        {g.memberIds?.length || 0} عضو
                        {g.admin_only && ' • 🔒 للمدير فقط'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => openEditGroup(g)}
                      style={{ flex: 1, padding: '8px 12px', background: T.surface2,
                        border: `1px solid ${T.border}`, borderRadius: 10, color: T.textSub,
                        fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>✏️ تعديل</button>
                    <button onClick={() => openMembers(g)}
                      style={{ flex: 1, padding: '8px 12px', background: 'rgba(14,165,233,.1)',
                        border: '1px solid rgba(14,165,233,.25)', borderRadius: 10, color: '#7dd3fc',
                        fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>👥 الأعضاء</button>
                    <button onClick={() => deleteGroup(g.id)}
                      style={{ padding: '8px 14px', background: 'rgba(239,68,68,.1)',
                        border: '1px solid rgba(239,68,68,.2)', borderRadius: 10, color: '#f87171',
                        fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>🗑️</button>
                  </div>
                </div>
              ))}
            </>

          // ── BROADCAST TAB ──
          ) : (
            <div>
              <div style={{ background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.25)',
                borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
                <p style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>📣 إرسال لجميع المجموعات</p>
                <p style={{ color: T.textMuted, fontSize: 12 }}>اكتب رسالة ستُرسل لمجموعة أو لكل المجموعات دفعة واحدة</p>
              </div>
              <label style={{ color: T.textSub, fontSize: 13, display: 'block', marginBottom: 8 }}>المجموعة المستهدفة</label>
              <select value={broadcastGroup} onChange={e => setBroadcastGroup(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', background: T.inputBg,
                  border: `1.5px solid ${T.inputBorder}`, borderRadius: 12, color: T.text,
                  fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}>
                <option value="all">كل المجموعات</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.icon} {g.name}</option>)}
              </select>
              <label style={{ color: T.textSub, fontSize: 13, display: 'block', marginBottom: 8 }}>نوع الرسالة</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {[['announcement','📢 إعلان'],['schedule','📅 جدول'],['general','💬 عام']].map(([v,l]) => (
                  <button key={v} onClick={() => setBroadcastType(v)}
                    style={{ padding: '7px 14px', borderRadius: 20,
                      background: broadcastType === v ? 'rgba(99,102,241,.2)' : T.surface2,
                      border: broadcastType === v ? '1.5px solid rgba(99,102,241,.5)' : `1px solid ${T.border}`,
                      color: broadcastType === v ? '#a5b4fc' : T.textMuted,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{l}</button>
                ))}
              </div>
              <label style={{ color: T.textSub, fontSize: 13, display: 'block', marginBottom: 8 }}>نص الرسالة</label>
              <textarea value={broadcastText} onChange={e => setBroadcastText(e.target.value)} rows={5}
                placeholder="اكتب رسالتك هنا..."
                style={{ width: '100%', padding: '13px 14px', background: T.inputBg,
                  border: `1.5px solid ${T.inputBorder}`, borderRadius: 14, color: T.text,
                  fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 14 }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = T.inputBorder} />
              {sentOk && (
                <div style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)',
                  borderRadius: 10, padding: '10px 14px', color: '#34d399', fontSize: 13,
                  textAlign: 'center', marginBottom: 12 }}>✅ تم الإرسال بنجاح!</div>
              )}
              <button onClick={sendBroadcast} disabled={!broadcastText.trim() || sending}
                style={{ width: '100%', padding: 14,
                  background: broadcastText.trim() ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : T.surface2,
                  border: 'none', borderRadius: 14, color: broadcastText.trim() ? '#fff' : T.textMuted,
                  fontSize: 16, fontWeight: 700, cursor: broadcastText.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {sending ? <Spinner size={20} color="#fff" /> : '📣 إرسال الآن'}
              </button>
            </div>
          )
        )}
      </div>

      {/* Edit/New Group Modal */}
      <Modal show={modal === 'editGroup'} onClose={() => setModal(null)}
        title={selected ? 'تعديل المجموعة' : 'مجموعة جديدة'} T={T}>
        <label style={{ color: T.textSub, fontSize: 13, display: 'block', marginBottom: 8 }}>اختار أيقونة</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {ICONS.map(ic => (
            <button key={ic} onClick={() => setGIcon(ic)}
              style={{ width: 42, height: 42, background: gIcon === ic ? 'rgba(99,102,241,.2)' : T.surface2,
                border: gIcon === ic ? '2px solid #6366f1' : `1px solid ${T.border}`,
                borderRadius: 10, fontSize: 22, cursor: 'pointer' }}>{ic}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setGColor(c)} style={{ width: 28, height: 28, borderRadius: '50%',
              background: c, border: gColor === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
          ))}
        </div>
        <label style={{ color: T.textSub, fontSize: 13, display: 'block', marginBottom: 7 }}>اسم المجموعة *</label>
        <input value={gName} onChange={e => setGName(e.target.value)} placeholder="مثال: رياضيات الصف الثالث"
          style={{ width: '100%', padding: '12px 14px', background: T.inputBg, border: `1.5px solid ${T.inputBorder}`,
            borderRadius: 12, color: T.text, fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = T.inputBorder} />
        <label style={{ color: T.textSub, fontSize: 13, display: 'block', marginBottom: 7 }}>وصف (اختياري)</label>
        <input value={gDesc} onChange={e => setGDesc(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', background: T.inputBg, border: `1.5px solid ${T.inputBorder}`,
            borderRadius: 12, color: T.text, fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = T.inputBorder} />
        <label style={{ color: T.textSub, fontSize: 13, display: 'block', marginBottom: 7 }}>المدرس المسؤول</label>
        <select value={gTeacher} onChange={e => setGTeacher(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', background: T.inputBg, border: `1.5px solid ${T.inputBorder}`,
            borderRadius: 12, color: T.text, fontSize: 14, outline: 'none', marginBottom: 14, boxSizing: 'border-box' }}>
          <option value="">بدون مدرس محدد</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.avatar} {t.name}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', background: T.surface2, borderRadius: 12, marginBottom: 20 }}>
          <div>
            <div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>🔒 للمدير فقط</div>
            <div style={{ color: T.textMuted, fontSize: 12 }}>فقط الأدمن يقدر يبعت رسائل</div>
          </div>
          <div onClick={() => setGAdminOnly(!gAdminOnly)} style={{ width: 46, height: 26, borderRadius: 13,
            background: gAdminOnly ? '#6366f1' : 'rgba(255,255,255,.12)', position: 'relative',
            cursor: 'pointer', transition: 'background .2s' }}>
            <div style={{ position: 'absolute', top: 3, left: gAdminOnly ? 23 : 3, width: 20, height: 20,
              borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
          </div>
        </div>
        <ErrBox msg={err} T={T} />
        <button onClick={saveGroup} disabled={saving}
          style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
            border: 'none', borderRadius: 14, color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {saving ? <Spinner size={20} color="#fff" /> : selected ? 'حفظ التغييرات' : 'إنشاء المجموعة'}
        </button>
      </Modal>

      {/* Members Modal */}
      <Modal show={modal === 'members'} onClose={() => setModal(null)}
        title={`أعضاء: ${selected?.name || ''}`} T={T}>
        <button onClick={addAllMembers}
          style={{ width: '100%', padding: '10px 14px', marginBottom: 14, background: 'rgba(16,185,129,.1)',
            border: '1px solid rgba(16,185,129,.3)', borderRadius: 12, color: '#34d399',
            fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          ➕ إضافة كل المستخدمين
        </button>
        {users.map(u => {
          const isMember = gMembers.includes(u.id)
          return (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: `1px solid ${T.border}` }}>
              <Avatar user={u} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                <RoleTag role={u.role} sm />
              </div>
              <button onClick={() => toggleMember(u.id)}
                style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  background: isMember ? 'rgba(239,68,68,.15)' : 'rgba(16,185,129,.15)',
                  color: isMember ? '#f87171' : '#34d399' }}>
                {isMember ? '✕ إزالة' : '+ إضافة'}
              </button>
            </div>
          )
        })}
      </Modal>
    </div>
  )
}
