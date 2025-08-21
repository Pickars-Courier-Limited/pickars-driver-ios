import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
  } from 'react';
  import NetInfo from '@react-native-community/netinfo';
  
  // Define context type
  interface InternetContextProps {
    isConnected: boolean;
    refreshInternetStatus: () => Promise<void>;
  }
  
  // Create the context
  const InternetContext = createContext<InternetContextProps | undefined>(
    undefined,
  );
  
  // Create the provider component
  export const InternetProvider: React.FC<{children: React.ReactNode}> = ({
    children,
  }) => {
    const [isConnected, setIsConnected] = useState(true);
  
    // Function to manually refresh internet status
    const refreshInternetStatus = useCallback(async () => {
      try {
        const state = await NetInfo.fetch();
        const connected = state.isConnected ?? false;
        setIsConnected(connected);
        console.log('🔁 Manual internet refresh:', connected);
      } catch (error) {
        console.error('⚠️ Error checking internet status:', error);
      }
    }, []);
  
    // Watch for changes in internet connection
    useEffect(() => {
      const unsubscribe = NetInfo.addEventListener(state => {
        const connected = state.isConnected ?? false;
        setIsConnected(connected);
        console.log('📶 Internet status changed:', connected);
      });
  
      return () => unsubscribe();
    }, []);
  
    return (
      <InternetContext.Provider
        value={{isConnected, refreshInternetStatus}}>
        {children}
      </InternetContext.Provider>
    );
  };
  
  // Custom hook to use the context
  export const useInternet = () => {
    const context = useContext(InternetContext);
    if (!context) {
      throw new Error('useInternet must be used within an InternetProvider');
    }
    return context;
  };