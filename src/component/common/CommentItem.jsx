// components/common/CommentItem.jsx

import Avatar from './Avatar'

export default function CommentItem({ comment, currentUserId, onEdit, onDelete }) {
  const isMine = comment.authorId === currentUserId

  return (
    <div style={s.wrap}>
      <Avatar name={comment.authorNickname} size="md" src={comment.authorImage} />
      <div style={s.body}>
        <div style={s.top}>
          <span style={s.name}>{comment.authorNickname}</span>
          {comment.isLeader && (
            <span style={s.leaderBadge}>방장</span>
          )}
          <span style={s.date}>{comment.createdAt}</span>
        </div>
        <div style={s.text}>{comment.content}</div>
        {isMine && (
          <div style={s.actions}>
            <button style={s.actBtn} onClick={() => onEdit(comment)}>수정</button>
            <button style={{ ...s.actBtn, color: '#EF4444' }} onClick={() => onDelete(comment.id)}>삭제</button>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  wrap: { display: 'flex', gap: 10, padding: '12px 0', borderBottom: '1px solid #F9FAFB' },
  body: { flex: 1 },
  top: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
  name: { fontSize: 12, fontWeight: 700, color: '#1A1A2E' },
  leaderBadge: {
    fontSize: 10, fontWeight: 700, padding: '1px 7px',
    borderRadius: 99, background: '#EDE9FF', color: '#6C63FF',
  },
  date: { fontSize: 10, color: '#9CA3AF', marginLeft: 'auto' },
  text: { fontSize: 12, color: '#6B7280', lineHeight: 1.6 },
  actions: { display: 'flex', gap: 8, marginTop: 4 },
  actBtn: { fontSize: 10, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
}