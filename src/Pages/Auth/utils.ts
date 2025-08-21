import AsyncStorage from '@react-native-async-storage/async-storage';

export async function handleVerificationResponse(response: any) {
    if (response.payload.message === 'Account verified successfully') {
        const { accessToken, refreshToken } = response.payload;
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        try {
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            console.log('Tokens stored in AsyncStorage');
        } catch (error) {
            console.error('Error storing tokens in AsyncStorage:', error);
        }
    }
}