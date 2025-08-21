import AsyncStorage from "@react-native-async-storage/async-storage";

//export const BaseUrl = `http://192.168.0.20:4000`

//export const BaseUrl = `http://localhost:4000`

//export const BaseUrl = `https://pickurps-server.onrender.com`

//https://pickurps-server.onrender.com

export const BaseUrl = `https://server-9mir.onrender.com`

export const WEB_BASE_URL = 'https://www.pickars.com';

export const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    console.log(token, 'tokentoken')
    if (!token) {
        throw new Error('No access token found');
    }
    return {
        Authorization: `Bearer ${token}`,
    };
};
