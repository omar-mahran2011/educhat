import { useState, useEffect, useRef } from 'react'
import { supabase, isConfigured } from './lib/supabase.js'
import { THEMES, loadSettings, saveSettings } from './lib/theme.js'
import LoginScreen from './screens/LoginScreen.jsx'
import ProfileSetup from './screens/ProfileSetup.jsx'
import GroupsList from './screens/GroupsList.jsx'
import ChatScreen from './screens/ChatScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
import AdminPanel from './screens/AdminPanel.jsx'
import { Spinner } from './components/UI.jsx'

function SetupScreen({ onDone }) {
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const IS = {
    width:'100%', padding:'12px 14px', background:'rgba(255,255,255,.07)',
    border:'1.5px solid rgba(255,255,255,.1)', borderRadius:12, color:'#fff',
    fontSize:13, outline:'none', boxSizing:'border-box', direction:'ltr', marginBottom:12,
  }
  return (
    <div style={{ minHeight:'100dvh', background:'linear-gradient(135deg,#0f172a,#1e1b4b,#0f172a)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      direction:'rtl', fontFamily:"'Segoe UI',Tahoma,sans-serif" }}>
      <div style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)',
        borderRadius:24, padding:'36px 28px', width:'100%', maxWidth:480,
        boxShadow:'0 30px 60px rgba(0,0,0,.6)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:56, marginBottom:12 }}>⚙️</div>
          <h1 style={{ color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 8px' }}>إعداد EduChat</h1>
          <p style={{ color:'#64748b', fontSize:13, lineHeight:1.7 }}>أضف بيانات Supabase للبدء</p>
        </div>
        <div style={{ background:'rgba(99,102,241,.1)', border:'1px solid rgba(99,102,241,.25)',
          borderRadius:14, padding:'16px 18px', marginBottom:24 }}>
          <p style={{ color:'#a5b4fc', fontWeight:700, fontSize:13, marginBottom:10 }}>📋 خطوات الإعداد:</p>
          {['اعمل حساب مجاني على supabase.com','اعمل New Project وانتظر دقيقتين',
            'افتح SQL Editor وشغّل ملف supabase-schema.sql',
            'ارجع هنا وأدخل Project URL و anon key'].map((s,i)=>(
            <div key={i} style={{ display:'flex', gap:10, marginBottom:6, alignItems:'flex-start' }}>
              <span style={{ background:'#6366f1', color:'#fff', borderRadius:'50%', width:20, height:20,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</span>
              <span style={{ color:'#cbd5e1', fontSize:13 }}>{s}</span>
            </div>
          ))}
        </div>
        <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Project URL</label>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" style={IS}
          onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.1)'}/>
        <label style={{ color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 }}>Anon Public Key</label>
        <input value={key} onChange={e=>setKey(e.target.value)} placeholder="eyJhbGci..." style={{ ...IS, marginBottom:24 }}
          onFocus={e=>e.target.style.borderColor='#6366f1'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.1)'}/>
        <button onClick={()=>{ if(url&&key){ localStorage.setItem('ec_sb_url',url); localStorage.setItem('ec_sb_key',key); onDone() }}}
          disabled={!url||!key}
          style={{ width:'100%', padding:15, background:url&&key?'linear-gradient(135deg,#6366f1,#7c3aed)':'rgba(255,255,255,.07)',
            border:'none', borderRadius:14, color:url&&key?'#fff':'#64748b', fontSize:16, fontWeight:700, cursor:url&&key?'pointer':'default' }}>
          ابدأ التطبيق ←
        </button>
        <p style={{ color:'#475569', fontSize:11, textAlign:'center', marginTop:14 }}>
          أو أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في Netlify Environment Variables
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [ready,    setReady]    = useState(false)
  const [authUser, setAuthUser] = useState(null)  // from supabase.auth
  const [profile,  setProfile]  = useState(null)  // from users table
  const [needSetup,setNeedSetup]= useState(false)
  const [screen,   setScreen]   = useState('groups')
  const [curGroup, setCurGroup] = useState(null)
  const [groups,   setGroups]   = useState([])
  const [users,    setUsers]    = useState([])
  const [messages, setMessages] = useState({})
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [settings, setSettings] = useState(loadSettings())
  const rtRef = useRef(null)

  // ── derived theme ──────────────────────────────
  const theme = THEMES[settings.theme] || THEMES.dark
  const T = { ...theme, accent: settings.accent || '#6366f1' }

  // ── check supabase config ──────────────────────
  useEffect(() => {
    const urlOk = isConfigured() ||
      (localStorage.getItem('ec_sb_url') && localStorage.getItem('ec_sb_key'))
    if (!urlOk) { setNeedSetup(true); setReady(true); return }
    initAuth()
  }, [])

  async function initAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await handleAuthUser(session.user)
    supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) await handleAuthUser(session.user)
      else { setAuthUser(null); setProfile(null); setReady(true) }
    })
    setReady(true)
  }

  async function handleAuthUser(au) {
    setAuthUser(au)
    const { data } = await supabase.from('users').select('*').eq('id', au.id).single()
    if (data) { setProfile(data); await loadData(data) }
    else setProfile(null) // needs profile setup
  }

  async function loadData(p) {
    const prof = p || profile
    if (!prof) return
    const [{ data: allUsers }, { data: memRows }] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('group_members').select('group_id').eq('user_id', prof.id),
    ])
    const gids = (memRows||[]).map(r => r.group_id)
    setUsers(allUsers||[])
    if (!gids.length) { setGroups([]); return }
    const { data: grps } = await supabase.from('groups').select('*').in('id', gids).order('created_at')
    const { data: allMem } = await supabase.from('group_members').select('group_id,user_id').in('group_id', gids)
    const membMap = {}
    ;(allMem||[]).forEach(r => { if(!membMap[r.group_id]) membMap[r.group_id]=[]; membMap[r.group_id].push(r.user_id) })
    const enriched = await Promise.all((grps||[]).map(async g => {
      const { data: last } = await supabase.from('messages').select('*')
        .eq('group_id', g.id).order('created_at',{ascending:false}).limit(1)
      return { ...g, memberIds: membMap[g.id]||[], lastMsg: last?.[0]||null }
    }))
    setGroups(enriched)
    subscribeRealtime(prof)
  }

  async function loadMessages(gid) {
    setLoadingMsgs(true)
    const { data } = await supabase.from('messages').select('*')
      .eq('group_id', gid).order('created_at',{ascending:true}).limit(200)
    setMessages(prev => ({ ...prev, [gid]: data||[] }))
    setLoadingMsgs(false)
  }

  function subscribeRealtime(prof) {
    if (rtRef.current) supabase.removeChannel(rtRef.current)
    rtRef.current = supabase.channel('rt-msgs')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'}, p => {
        const m = p.new
        setMessages(prev => {
          if ((prev[m.group_id]||[]).find(x=>x.id===m.id)) return prev
          return { ...prev, [m.group_id]: [...(prev[m.group_id]||[]), m] }
        })
        setGroups(prev => prev.map(g => g.id===m.group_id ? {...g,lastMsg:m} : g))
      })
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'messages'}, p => {
        const m = p.new
        setMessages(prev => ({
          ...prev,
          [m.group_id]: (prev[m.group_id]||[]).map(x => x.id===m.id ? m : x)
        }))
      })
      .subscribe()
  }

  async function openGroup(g) {
    setCurGroup(g); setScreen('chat')
    if (!messages[g.id]) await loadMessages(g.id)
  }

  async function sendMessage(gid, text, type) {
    const { data, error } = await supabase.from('messages')
      .insert({ group_id:gid, sender_id:profile.id, text, type, reactions:{} }).select().single()
    if (!error && data) {
      setMessages(prev => ({ ...prev, [gid]: [...(prev[gid]||[]), data] }))
      setGroups(prev => prev.map(g => g.id===gid ? {...g,lastMsg:data} : g))
    }
  }

  async function reactToMessage(gid, msgId, emoji) {
    const msg = (messages[gid]||[]).find(m=>m.id===msgId)
    if (!msg) return
    const reactions = { ...(msg.reactions||{}) }
    if (!reactions[emoji]) reactions[emoji] = []
    reactions[emoji] = reactions[emoji].includes(profile.id)
      ? reactions[emoji].filter(id=>id!==profile.id)
      : [...reactions[emoji], profile.id]
    await supabase.from('messages').update({ reactions }).eq('id', msgId)
    setMessages(prev => ({
      ...prev,
      [gid]: (prev[gid]||[]).map(m => m.id===msgId ? {...m,reactions} : m)
    }))
  }

  function handleLogout() {
    if (rtRef.current) supabase.removeChannel(rtRef.current)
    setAuthUser(null); setProfile(null); setGroups([]); setMessages({}); setScreen('groups')
  }

  function handleSettingsChange(s) { setSettings(s) }
  function handleUserUpdate(u) { setProfile(u); setUsers(prev => prev.map(x=>x.id===u.id?u:x)) }

  // ── Loading splash ─────────────────────────────
  if (!ready) return (
    <div style={{ height:'100dvh', background:'#0d1420', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:20 }}>
      <div style={{ width:88, height:88, borderRadius:26, background:'linear-gradient(135deg,#6366f1,#7c3aed)',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:46,
        boxShadow:'0 16px 48px rgba(99,102,241,.5)', animation:'pop .4s ease' }}>🎓</div>
      <Spinner size={32} color="#6366f1" />
    </div>
  )

  // ── Supabase not configured ────────────────────
  if (needSetup) return <SetupScreen onDone={() => { setNeedSetup(false); initAuth() }} />

  // ── Not logged in ──────────────────────────────
  if (!authUser) return <LoginScreen T={T} />

  // ── Logged in but no profile yet ──────────────
  if (!profile) return (
    <ProfileSetup authUser={authUser} T={T}
      onDone={async (p) => { setProfile(p); await loadData(p) }} />
  )

  // ── Admin panel ────────────────────────────────
  if (screen === 'admin') return (
    <AdminPanel user={profile} T={T} onBack={() => setScreen('groups')} />
  )

  // ── Settings ───────────────────────────────────
  if (screen === 'settings') return (
    <SettingsScreen user={profile} settings={settings}
      onSettingsChange={handleSettingsChange}
      onUserUpdate={handleUserUpdate}
      onLogout={handleLogout}
      onNav={setScreen} T={T} />
  )

  // ── Chat ───────────────────────────────────────
  if (screen === 'chat' && curGroup) return (
    <ChatScreen user={profile} users={users} group={curGroup}
      messages={messages[curGroup.id]}
      onSend={sendMessage} onReact={reactToMessage}
      onBack={() => setScreen('groups')}
      loading={loadingMsgs} T={T} />
  )

  // ── Groups list (default) ──────────────────────
  return (
    <GroupsList user={profile} groups={groups} messages={messages}
      users={users} onOpen={openGroup} onNav={setScreen} T={T} />
  )
}
