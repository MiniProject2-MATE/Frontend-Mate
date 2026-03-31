// components/common/Button.jsx

export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  type = 'button',
  style,
}) {

  const getStyle = () => {
    if (disabled) return { ...s.base, ...s.disabled }
    switch (variant) {
      case 'primary':   return { ...s.base, ...s.primary }
      case 'secondary': return { ...s.base, ...s.secondary }
      case 'ghost':     return { ...s.base, ...s.ghost }
      case 'danger':    return { ...s.base, ...s.danger }
      default:          return { ...s.base, ...s.primary }
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...getStyle(), ...style }}
    >
      {children}
    </button>
  )
}

const s = {
  base: {
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    padding: '8px 20px',
    borderRadius: 99,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    transition: 'opacity 0.15s',
  },
  primary: {
    background: '#6C63FF',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(108,99,255,0.35)',
  },
  secondary: {
    background: '#fff',
    color: '#6B7280',
    border: '1.5px solid #E5E7EB',
  },
  ghost: {
    background: 'none',
    color: '#6B7280',
    border: 'none',
  },
  danger: {
    background: '#EF4444',
    color: '#fff',
    border: '1.5px solid #EF4444',
  },
  disabled: {
    background: '#F3F4F6',
    color: '#9CA3AF',
    border: '1.5px solid #E5E7EB',
    cursor: 'not-allowed',
  },
}