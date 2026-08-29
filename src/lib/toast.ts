export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastOptions {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

type Listener = (toasts: ToastOptions[]) => void;

class ToastManager {
  private toasts: ToastOptions[] = [];
  private listeners: Listener[] = [];
  private count = 0;

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  add(type: ToastType, message: string, duration = 4000) {
    const id = this.count++;
    const toast = { id, type, message, duration };
    this.toasts = [...this.toasts, toast];
    this.notify();

    if (type !== 'loading') {
      setTimeout(() => this.remove(id), duration);
    }
    return id;
  }

  remove(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  success(msg: string) { this.add('success', msg); }
  error(msg: string) { this.add('error', msg); }
  info(msg: string) { this.add('info', msg); }
  warning(msg: string) { this.add('warning', msg); }
  loading(msg: string) { return this.add('loading', msg); }
}

export const toast = new ToastManager();