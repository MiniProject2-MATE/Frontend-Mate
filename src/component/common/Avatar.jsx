// components/common/Avatar.jsx

export default function Avatar({ name = '?', size = 'md', src }) {
  const colors = ['#6C63FF', '#FF6B9D', '#34D399', '#F59E0B']
  const colorIndex = name.charCodeAt(0) % colors.length
  const bg = colors[colorIndex]
  const sizes = { sm: 24, md: 32, lg: 48 }
  const fontSize = { sm: 10, md: 13, lg: 18 }
  const sz = sizes[size]

  if (src) return (
    <img src={src} alt={name}
      style={{ width: sz, height: sz, borderRadius: '50%', objectFit: 'cover' }} />
  )

  return (
    <div style={{
      width: sz, height: sz, borderRadius: '50%',
      background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: fontSize[size], fontWeight: 700, flexShrink: 0,
    }}>
      {name[0]}
    </div>
  )
}