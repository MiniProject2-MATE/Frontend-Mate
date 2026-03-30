// components/common/ToastMessage.jsx

import { useEffect } from 'react'

export default function ToastMessage({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [])

  const colors = {
    success: { bg: '#DCFCE7', color: '#166534', icon: '✓' },
    error:   { bg: '#FEE2E2', color: '#991B1B', icon: '✗' },
    warning: { bg: '#FEF3C7', color: '#92400E', icon: '!' },
  }
  const { bg, color, icon } = colors[type]

  return (
    <div style={{ ...s.wrap, background: bg, color }}>
      <span style={s.icon}>{icon}</span>
      <span style={s.text}>{message}</span>
      <button style={{ ...s.close, color }} onClick={onClose}>×</button>
    </div>
  )
}

const s = {
  wrap: {
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 18px', borderRadius: 12,
    fontSize: 14, fontWeight: 500,
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    minWidth: 240,
  },
  icon: { fontSize: 16, fontWeight: 700 },
  text: { flex: 1 },
  close: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 },
}