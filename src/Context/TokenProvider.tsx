import React, {createContext, useState, useContext, ReactNode} from 'react';

interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  email: string;
  referralCode: string;
  verified: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  newsletterSubscription: boolean;
  promotionNotifications: boolean;
  createdAt: string;
  promoCode: string;
  __v: number;
}

interface TokenContextType {
  tokens: Tokens;
  user: User | null; // User can be null initially
  updateTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void; // Method to clear tokens
  updateUser?: (user: User) => void; // Method to update user data
  clearUser: () => void; // Method to clear user data
}

// Create the context
const TokenContext = createContext<TokenContextType | undefined>(undefined);

// TokenProvider Component
interface TokenProviderProps {
  children: ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({children}) => {
  const [tokens, setTokens] = useState<Tokens>({
    accessToken: null,
    refreshToken: null,
  });

  const [user, setUser] = useState<User | null>(null); // Initializing with null

  // Update tokens function
  const updateTokens = (accessToken: string, refreshToken: string) => {
    setTokens({accessToken, refreshToken});
  };

  // Clear tokens function
  const clearTokens = () => {
    setTokens({accessToken: null, refreshToken: null});
    console.log('Tokens cleared');
  };

  // Update user function
  const updateUser = (user: User) => {
    setUser(user);
  };

  // Clear user function
  const clearUser = () => {
    setUser(null);
    console.log('User cleared');
  };

  return (
    <TokenContext.Provider
      value={{tokens, user, updateTokens, clearTokens, updateUser, clearUser}}>
      {children}
    </TokenContext.Provider>
  );
};

// Custom Hook to use the authentication context
export const useTokens = (): TokenContextType => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useAuth must be used within an TokenProvider');
  }
  return context;
};
