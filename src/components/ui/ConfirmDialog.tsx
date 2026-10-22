import { useEffect } from 'react'
export default function ConfirmDialog({ title, body, confirmLabel = 'Delete', onConfirm, onCancel }: { title: string; body: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k) }, [onCancel])
  return <div className="ui-modal-backdrop" onClick={onCancel}><div className="ui-modal" role="alertdialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
    <h3>{title}</h3><p>{body}</p>
    <div className="ui-modal-actions"><button className="secondary-btn" onClick={onCancel}>Cancel</button><button className="primary-btn danger" onClick={onConfirm}>{confirmLabel}</button></div>
  </div></div>
}
