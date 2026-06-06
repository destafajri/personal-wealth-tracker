import { reactive } from 'vue'

export interface ToastAction {
  label: string
  handler: () => void
}

export interface Toast {
  id: number
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  durationMs: number
  actions: ToastAction[]
}

const state = reactive<{ toasts: Toast[] }>({ toasts: [] })
let nextId = 0

export function useToast() {
  function showToast(
    message: string,
    opts: {
      type?: Toast['type']
      durationMs?: number
      actions?: ToastAction[]
    } = {},
  ): number {
    const id = nextId++
    const toast: Toast = {
      id,
      message,
      type: opts.type ?? 'info',
      durationMs: opts.durationMs ?? 5000,
      actions: opts.actions ?? [],
    }
    state.toasts.push(toast)
    if (toast.durationMs > 0) {
      setTimeout(() => dismissToast(id), toast.durationMs)
    }
    return id
  }

  function dismissToast(id: number): void {
    const idx = state.toasts.findIndex((t) => t.id === id)
    if (idx >= 0) state.toasts.splice(idx, 1)
  }

  return { toasts: state.toasts, showToast, dismissToast }
}
