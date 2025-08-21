import React, {createContext, useContext} from 'react';
import {io, Socket} from 'socket.io-client';
import { BaseUrl } from '../Redux/baseurl';

const socket = io(BaseUrl); // Assuming your Express server runs on port 3000

interface SocketContextType {
  socket: Socket;
}

const SocketContext = createContext<SocketContextType>({socket});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  return (
    <SocketContext.Provider value={{socket}}>{children}</SocketContext.Provider>
  );
};
