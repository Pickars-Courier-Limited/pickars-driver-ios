import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {useDispatch} from 'react-redux';
import {useTokens} from './TokenProvider'; // Adjust path as needed
import {useToast} from './useToast'; // Adjust path as needed
import {checkServerStatus} from '../Redux/Auth/Auth';

interface ServerStatusContextType {
  serverStatus: string | null;
  serverIsDown: boolean;
  refreshServerStatus: () => void; // Method to manually refresh server status
}

const ServerStatusContext = createContext<ServerStatusContextType | undefined>(
  undefined,
);

interface ServerStatusProviderProps {
  children: ReactNode;
  reload?: boolean; // Optional reload prop to trigger status refresh
}

export const ServerStatusProvider: React.FC<ServerStatusProviderProps> = ({
  children,
  reload,
}) => {
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [serverIsDown, setServerIsDown] = useState<boolean>(false);
  const dispatch = useDispatch();
  const {updateTokens} = useTokens(); // Access updateTokens from TokenProvider
  const {addToast} = useToast();

  const refreshServerStatus = () => {
    dispatch(checkServerStatus())
      .unwrap()
      .then(response => {
        const {accessToken, refreshToken} = response; // Adjust according to API response
        updateTokens(accessToken, refreshToken);

        setServerStatus('Server is up and running');
        setServerIsDown(false);
        console.log('Server is up and running', response);
      })
      .catch(error => {
        addToast(
          'Server is experiencing downtime, please try again later.',
          'error',
          `Server Downtime`,
        );

        setServerStatus('Server is down');
        setServerIsDown(true);
        console.error('Server is down:', error);
      });
  };

  // Check server status on mount or when `reload` changes
  useEffect(() => {
    refreshServerStatus();
  }, [dispatch, reload]); // Add reload to dependency array

  return (
    <ServerStatusContext.Provider
      value={{serverStatus, serverIsDown, refreshServerStatus}}>
      {children}
    </ServerStatusContext.Provider>
  );
};

// Custom Hook to Use Server Status
export const useServerStatus = (): ServerStatusContextType => {
  const context = useContext(ServerStatusContext);
  if (!context) {
    throw new Error(
      'useServerStatus must be used within a ServerStatusProvider',
    );
  }
  return context;
};
