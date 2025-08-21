import { useTokens } from '../../Context/TokenProvider';
import { useToast } from '../../Context/useToast';
import axios from 'axios';
import { BaseUrl } from '../../Redux/baseurl';
import { useState, useCallback } from 'react';

export const useVerifyToken = () => {
    const { tokens } = useTokens();
    const { addToast } = useToast();

    const [status, setStatus] = useState<'pending' | 'valid' | 'invalid' | 'error'>('pending');
    const [shouldPromptLogin, setShouldPromptLogin] = useState(false); // ← Controls auth redirection

    const verifyToken = useCallback(async () => {
        if (!tokens?.refreshToken) {
            setStatus('invalid');
            setShouldPromptLogin(true);
            return;
        }

        try {
            const res = await axios.post(`${BaseUrl}/api/auth/verify-refresh-token-driver`, {
                refreshToken: tokens.refreshToken,
            });

            if (res.data?.success) {
                setStatus('valid');
                setShouldPromptLogin(false);
                addToast('Welcome back', 'success', 'title', 'Welcome back', () => { });
            } else {
                setStatus('invalid');
                setShouldPromptLogin(true);
                addToast(
                    'Session expired. Please log in again.',
                    'error',
                    'Authentication Required',
                );
            }

            
        } catch (err: any) {
            console.error('❌ Token verification failed:', err?.response?.data || err.message);
            setStatus('error');
            setShouldPromptLogin(false);
            addToast(
                'Server error occurred. Please try again later.',
                'error',
                'Connection Error',
            );
        }
    }, [tokens?.refreshToken]);

    return {
        verifyToken,
        tokenStatus: status,
        shouldPromptLogin,
    };
};