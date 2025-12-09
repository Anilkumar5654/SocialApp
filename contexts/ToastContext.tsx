// contexts/ToastContext.tsx

import React, { createContext, useContext, useRef, ReactNode } from 'react';
import AppToast, { ToastHandle, ToastType } from '@/components/ui/AppToast';

// 1. Context Interface
interface ToastContextType {
  show: (message: string, type: ToastType, duration?: number) => void;
}

// 2. Context Creation
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 3. Custom Hook to consume the context
export const useToast = (): ToastHandle => {
  const context = useContext(ToastContext);
  if (!context) {
    // This happens if useToast is called outside of the ToastProvider
    // Return a dummy object to prevent crash during context loading/undefined
    return { show: () => console.warn('Toast called outside of provider.') };
  }
  return context as ToastHandle;
};

// 4. Provider Component (Renders AppToast globally)
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toastRef = useRef<ToastHandle>(null);
  
  // This function is passed down through context
  const showToast: ToastContextType['show'] = (message, type, duration) => {
    toastRef.current?.show(message, type, duration);
  };

  return (
    <ToastContext.Provider value={{ show: showToast }}>
      {children}
      {/* AppToast is rendered here, outside of the main navigation stack */}
      <AppToast ref={toastRef} />
    </ToastContext.Provider>
  );
};
                                      
