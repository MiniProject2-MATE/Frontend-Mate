// components/layout/Footer.jsx

export default function Footer() {
  return (
    <footer style={s.footer}>
      <span style={s.text}>ⓒ 2026 Mate. All rights reserved.</span>
    </footer>
  )
}

const s = {
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    background: '#fff',
    borderTop: '1px solid #F3F4F6',
    marginTop: 'auto',
  },
  text: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: 400,
  },
}