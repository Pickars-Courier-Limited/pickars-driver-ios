// ToastManager.tsx
import React, {createContext, useContext, useState, ReactNode} from 'react';

import {StyleSheet, View} from 'react-native';
import Toast from '../Components/Toast/Toast';

interface ToastContextProps {
  addToast: (message: string, type: 'success' | 'error') => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({children}) => {
  const [toasts, setToasts] = useState<
    {message: string; type: 'success' | 'error'}[]
  >([]);

  const addToast = (message: string, type: 'success' | 'error') => {
    setToasts(prev => [...prev, {message, type}]);
  };

  return (
    <ToastContext.Provider value={{addToast}}>
      {children}
      <View style={styles.toastContainer}>
        {toasts.map((toast, index) => (
          <Toast key={index} message={toast.message} type={toast.type} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [{translateX: -150}],
    zIndex: 9999,
  },
});
