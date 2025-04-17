import * as React from "react";

// Types
export interface ToastActionElement {
  altText: string;
  onClick: () => void;
  children: React.ReactNode;
}

type ToastVariant = "default" | "destructive" | "success";

export interface Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: ToastVariant;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  updateToast: (id: string, toast: Partial<Toast>) => void;
  dismissToast: (id: string) => void;
  removeToast: (id: string) => void;
}

// Toast component
const ToastComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: ToastVariant;
  }
>(({ className, variant = "default", ...props }, ref) => {
  const baseStyles = "relative rounded-md p-4 shadow-md";
  const variantStyles = {
    default: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    destructive: "bg-red-600 text-white",
    success: "bg-green-600 text-white",
  };
  
  const combinedStyles = `${baseStyles} ${variantStyles[variant]}`;
  
  return (
    <div
      ref={ref}
      className={combinedStyles}
      {...props}
    />
  );
});
ToastComponent.displayName = "Toast";

// Toast context
const ToastContext = React.createContext<ToastContextType | null>(null);

// Toast provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      setToasts((prev) => [
        ...prev,
        { id: Math.random().toString(36).substring(2, 9), ...toast },
      ]);
    },
    []
  );

  const updateToast = React.useCallback(
    (id: string, toast: Partial<Toast>) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...toast } : t))
      );
    },
    []
  );

  const dismissToast = React.useCallback(
    (id: string) => {
      // We don't immediately remove the toast to allow for exit animations
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, open: false } : t))
      );
    },
    []
  );

  const removeToast = React.useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    []
  );

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
      <div className="fixed top-0 right-0 z-50 p-4 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            variant={toast.variant}
            onClick={() => dismissToast(toast.id)}
          >
            {toast.title && (
              <div className="font-semibold">{toast.title}</div>
            )}
            {toast.description && (
              <div className="text-sm">{toast.description}</div>
            )}
            {toast.action && (
              <div className="mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.action?.onClick();
                  }}
                  className="px-3 py-1 text-xs font-medium bg-opacity-20 bg-white rounded-sm"
                >
                  {toast.action.children}
                </button>
              </div>
            )}
          </ToastComponent>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Custom hook to use toast
export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  const toast = React.useCallback(
    (props: Omit<Toast, "id">) => {
      context.addToast(props);
    },
    [context]
  );

  return {
    toast,
    toasts: context.toasts,
    updateToast: context.updateToast,
    dismissToast: context.dismissToast,
    removeToast: context.removeToast,
  };
}