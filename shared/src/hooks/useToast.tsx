import React from "react";

// Define types for toast components
type ToastActionElement = React.ReactElement;

interface ToastProps {
  title?: string;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  className?: string;
}

// Stub implementation for a simple toast system
// In a real project, you would import these from your UI library
const useToastPrimitive = () => {
  const toast = (props: ToastProps) => {
    console.log("Toast:", props);
    return { id: Date.now().toString() };
  };
  
  return {
    toast,
    dismiss: (id: string) => console.log(`Dismiss toast: ${id}`),
  };
};

export interface ToastOptions {
  title?: string;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success";
}

export function useToast() {
  const { toast: primitiveToast, ...rest } = useToastPrimitive();

  // Enhanced toast function with success variant and simplified API
  const toast = ({ 
    title, 
    description, 
    action, 
    variant = "default" 
  }: ToastOptions) => {
    const toastOptions: ToastProps = {
      title,
      description,
      action,
    };

    // Map variants to UI classes
    if (variant === "destructive") {
      toastOptions.variant = "destructive";
    } else if (variant === "success") {
      toastOptions.className = "bg-green-500 text-white";
    }

    return primitiveToast(toastOptions);
  };

  // Returns enhanced toast function with additional options
  return {
    toast,
    ...rest,
  };
}