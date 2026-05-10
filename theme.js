export const THEMES = {
  dark: {
    id: 'dark', label: 'داكن', emoji: '🌙',
    bg: '#0d1420', surface: '#1a2235', surface2: '#213047',
    border: 'rgba(255,255,255,0.07)', borderStrong: 'rgba(255,255,255,0.12)',
    text: '#f1f5f9', textSub: '#94a3b8', textMuted: '#64748b',
    msgOwn: 'linear-gradient(135deg,#6366f1,#7c3aed)',
    msgOther: 'rgba(255,255,255,0.07)', msgOtherText: '#e2e8f0',
    header: 'linear-gradient(180deg,#14102a 0%,#1a2235 100%)',
    inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.1)',
    overlay: 'rgba(0,0,0,0.75)', navBg: '#161f2e',
  },
  light: {
    id: 'light', label: 'فاتح', emoji: '☀️',
    bg: '#f0f4f8', surface: '#ffffff', surface2: '#f8fafc',
    border: 'rgba(0,0,0,0.08)', borderStrong: 'rgba(0,0,0,0.15)',
    text: '#0f172a', textSub: '#475569', textMuted: '#94a3b8',
    msgOwn: 'linear-gradient(135deg,#6366f1,#7c3aed)',
    msgOther: '#e2e8f0', msgOtherText: '#1e293b',
    header: 'linear-gradient(180deg,#ede9fe 0%,#ffffff 100%)',
    inputBg: '#f1f5f9', inputBorder: 'rgba(0,0,0,0.12)',
    overlay: 'rgba(0,0,0,0.5)', navBg: '#ffffff',
  },
  midnight: {
    id: 'midnight', label: 'منتصف الليل', emoji: '🌌',
    bg: '#06060f', surface: '#0f0f24', surface2: '#16163a',
    border: 'rgba(255,255,255,0.06)', borderStrong: 'rgba(255,255,255,0.1)',
    text: '#e2e8f0', textSub: '#8892b0', textMuted: '#495670',
    msgOwn: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    msgOther: 'rgba(255,255,255,0.06)', msgOtherText: '#ccd6f6',
    header: 'linear-gradient(180deg,#0a0a1e 0%,#0f0f24 100%)',
    inputBg: 'rgba(255,255,255,0.06)', inputBorder: 'rgba(255,255,255,0.08)',
    overlay: 'rgba(0,0,0,0.85)', navBg: '#0a0a1e',
  },
  ocean: {
    id: 'ocean', label: 'المحيط', emoji: '🌊',
    bg: '#071525', surface: '#0d2137', surface2: '#122d4d',
    border: 'rgba(255,255,255,0.07)', borderStrong: 'rgba(255,255,255,0.12)',
    text: '#e2e8f0', textSub: '#94a3b8', textMuted: '#64748b',
    msgOwn: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
    msgOther: 'rgba(255,255,255,0.07)', msgOtherText: '#e2e8f0',
    header: 'linear-gradient(180deg,#040e1a 0%,#0d2137 100%)',
    inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.1)',
    overlay: 'rgba(0,0,0,0.75)', navBg: '#071525',
  },
  forest: {
    id: 'forest', label: 'الغابة', emoji: '🌲',
    bg: '#071a0f', surface: '#0d2b18', surface2: '#143d23',
    border: 'rgba(255,255,255,0.07)', borderStrong: 'rgba(255,255,255,0.12)',
    text: '#e2e8f0', textSub: '#94a3b8', textMuted: '#64748b',
    msgOwn: 'linear-gradient(135deg,#10b981,#059669)',
    msgOther: 'rgba(255,255,255,0.07)', msgOtherText: '#e2e8f0',
    header: 'linear-gradient(180deg,#041009 0%,#0d2b18 100%)',
    inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.1)',
    overlay: 'rgba(0,0,0,0.75)', navBg: '#071a0f',
  },
}

export const ACCENT_COLORS = [
  { id:'indigo', label:'بنفسجي', value:'#6366f1' },
  { id:'blue',   label:'أزرق',   value:'#0ea5e9' },
  { id:'green',  label:'أخضر',   value:'#10b981' },
  { id:'amber',  label:'ذهبي',   value:'#f59e0b' },
  { id:'rose',   label:'وردي',   value:'#f43f5e' },
  { id:'purple', label:'بنفسجي غامق', value:'#a855f7' },
]

export const FONT_SIZES = [
  { id:'sm', label:'صغير', base:13, msg:13 },
  { id:'md', label:'متوسط', base:14, msg:14 },
  { id:'lg', label:'كبير', base:16, msg:16 },
]

export function loadSettings() {
  try {
    const s = localStorage.getItem('ec_settings')
    return s ? JSON.parse(s) : { theme:'dark', accent:'#6366f1', fontSize:'md', bubbleRadius:18 }
  } catch { return { theme:'dark', accent:'#6366f1', fontSize:'md', bubbleRadius:18 } }
}
export function saveSettings(s) {
  try { localStorage.setItem('ec_settings', JSON.stringify(s)) } catch {}
}
