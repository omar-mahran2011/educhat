import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Override Supabase URL/KEY from localStorage if set via setup screen
const storedUrl = localStorage.getItem('ec_sb_url')
const storedKey = localStorage.getItem('ec_sb_key')
if (storedUrl && storedKey) {
  // These override the env vars at runtime via the supabase.js module
  window.__EC_SB_URL__ = storedUrl
  window.__EC_SB_KEY__ = storedKey
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
