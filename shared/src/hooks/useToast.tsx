import React, { createContext, useContext, useState } from "react";

// Toast action element interface
export interface ToastActionElement {
  altText: string;
  onClick: () => void;
  children: React.ReactNode;
}

// Toast variants
type ToastVariant = "default" | "destructive" | "success";

// Toast interface
export interface Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: ToastVariant;
}

// Toast context interface
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  updateToast: (id: string, toast: Partial<Toast>) => void;
  dismissToast: (id: string) => void;
  removeToast: (id: string) => void;
}

// Create context
const ToastContext = createContext<ToastContextType | null>(null);

// ToastProvider props
interface ToastProviderProps {
  children: React.ReactNode;
  duration?: number;
  variant?: ToastVariant;
}

// ToastProvider component
export function ToastProvider({
  children,
  duration = 5000,
  variant = "default",
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add a new toast notification
  const addToast = React.useCallback(
    ({ ...props }: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, ...props, variant: props.variant || variant }]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [duration, variant]
  );

  // Update an existing toast
  const updateToast = React.useCallback(
    (id: string, { ...props }: Partial<Toast>) => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, ...props } : toast
        )
      );
    },
    []
  );

  // Mark a toast as being dismissed (start exit animation)
  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, dismissed: true } : toast
      )
    );

    // Remove the toast after animation (assuming 500ms for exit animation)
    setTimeout(() => {
      removeToast(id);
    }, 500);
  }, []);

  // Remove a toast from the state
  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Context value
  const value = React.useMemo(
    () => ({
      toasts,
      addToast,
      updateToast,
      dismissToast,
      removeToast,
    }),
    [toasts, addToast, updateToast, dismissToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

// Custom hook to access toast context
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    toast: context.addToast,
    dismiss: context.dismissToast,
    update: context.updateToast,
    toasts: context.toasts,
  };
}