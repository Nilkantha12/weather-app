import type { ReactNode } from 'react'

type ModalProps = {
  title: string
  children: ReactNode
  isOpen: boolean
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export default function Modal({
  title,
  children,
  isOpen,
  confirmText = 'Ok',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.()
      }}
    >
      <div className="glass modal">
        <h3>{title}</h3>
        <p>{children}</p>
        <div className="modalActions">
          {onCancel ? (
            <button className="btn" onClick={onCancel}>
              {cancelText}
            </button>
          ) : null}
          <button
            className="btn"
            onClick={() => {
              onConfirm?.()
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
