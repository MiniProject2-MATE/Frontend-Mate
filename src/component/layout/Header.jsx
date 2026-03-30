import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'

export default function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.logo}>mate</Link>

      <div style={s.links}>
        <Link to="/" style={s.link}>Explore</Link>
        {isAuthenticated && <Link to="/posts/new" style={s.link}>Post</Link>}
        <Link to="/community" style={s.link}>Community</Link>
      </div>

      <div style={s.right}>
        {isAuthenticated ? (
          <>
            <span style={s.welcome}>{user?.nickname}</span>
            <Link to="/mypage" style={s.btnGhost}>마이페이지</Link>
            <button onClick={handleLogout} style={s.btnGhost}>로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login" style={s.btnGhost}>로그인</Link>
            <Link to="/register" style={s.btnPrimary}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  )
}

const s = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', padding: '0 40px',
    height: 60,
    background: 'rgba(238,242,248,0.85)',  // ✅ 수정
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255,255,255,0.6)',  // ✅ 수정
  },
  logo: {
    fontSize: 20, fontWeight: 800, color: '#6C63FF',  // ✅ 수정
    letterSpacing: '-0.5px', marginRight: 48,
    textDecoration: 'none',
  },
  links: { display: 'flex', gap: 32, marginRight: 'auto' },
  link: {
    fontSize: 14, fontWeight: 500, color: '#6B7280',
    textDecoration: 'none',
  },
  right: { display: 'flex', gap: 12, alignItems: 'center' },
  welcome: { fontSize: 13, color: '#9CA3AF', fontWeight: 500 },
  btnGhost: {
    fontSize: 14, fontWeight: 500, color: '#6B7280',
    background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px',
    borderRadius: 99,  // ✅ 수정
    textDecoration: 'none', display: 'inline-block',
  },
  btnPrimary: {
    fontSize: 14, fontWeight: 600, color: '#fff',
    background: '#6C63FF', border: 'none', cursor: 'pointer',  // ✅ 수정
    padding: '8px 20px', borderRadius: 99,  // ✅ 수정
    textDecoration: 'none', display: 'inline-block',
    boxShadow: '0 4px 14px rgba(108,99,255,0.35)',  // ✅ 추가
  },
}