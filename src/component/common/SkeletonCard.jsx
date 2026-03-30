// components/common/SkeletonCard.jsx

export default function SkeletonCard() {
  return (
    <div style={s.card}>
      <div style={{ ...s.bar, width: '40%', marginBottom: 12 }} />
      <div style={{ ...s.bar, width: '80%', height: 20, marginBottom: 8 }} />
      <div style={{ ...s.bar, width: '90%', marginBottom: 4 }} />
      <div style={{ ...s.bar, width: '60%', marginBottom: 16 }} />
      <div style={s.tags}>
        <div style={{ ...s.bar, width: 50, borderRadius: 99 }} />
        <div style={{ ...s.bar, width: 60, borderRadius: 99 }} />
      </div>
      <div style={{ ...s.bar, width: '100%', marginTop: 12 }} />
    </div>
  )
}

const s = {
  card: {
    background: '#fff', borderRadius: 16, padding: 24,
    border: '1px solid rgba(0,0,0,0.06)',
  },
  bar: {
    height: 14, background: '#E5E7EB', borderRadius: 6,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  tags: { display: 'flex', gap: 6 },
}