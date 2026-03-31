// components/common/Pagination.jsx

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div style={s.wrap}>
      <button
        style={s.btn}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
      >◀</button>

      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          style={i === page ? s.btnActive : s.btn}
          onClick={() => onPageChange(i)}
        >
          {i + 1}
        </button>
      ))}

      <button
        style={s.btn}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
      >▶</button>
    </div>
  )
}

const s = {
  wrap: { display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40 },
  btn: {
    width: 36, height: 36, borderRadius: 8,
    border: '1px solid #E5E7EB', background: '#fff',
    color: '#6B7280', cursor: 'pointer', fontSize: 13,
  },
  btnActive: {
    width: 36, height: 36, borderRadius: 8,
    border: '1px solid #6C63FF', background: '#6C63FF',
    color: '#fff', cursor: 'pointer', fontSize: 13,
  },
}