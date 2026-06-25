import { create } from 'zustand'

type ToastKind = 'info' | 'success' | 'error'

interface ToastState {
  visible: boolean
  message: string
  kind: ToastKind
  timeoutId: ReturnType<typeof setTimeout> | null
  show: (message: string, kind?: ToastKind, durationMs?: number) => void
  hide: () => void
}

const DEFAULT_DURATION_MS = 2600

export const useToastStore = create<ToastState>((set, get) => ({
  visible: false,
  message: '',
  kind: 'info',
  timeoutId: null,
  show: (message, kind = 'info', durationMs = DEFAULT_DURATION_MS) => {
    const active = get().timeoutId
    if (active) clearTimeout(active)

    const id = setTimeout(() => {
      set({ visible: false, timeoutId: null })
    }, durationMs)

    set({ visible: true, message, kind, timeoutId: id })
  },
  hide: () => {
    const active = get().timeoutId
    if (active) clearTimeout(active)
    set({ visible: false, timeoutId: null })
  },
}))

export function showAppToast(message: string, kind: ToastKind = 'info', durationMs?: number) {
  useToastStore.getState().show(message, kind, durationMs)
}
