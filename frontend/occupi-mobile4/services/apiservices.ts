import { Success, Unsuccessful } from "@/models/response";
import { SecuritySettingsReq, NotificationSettingsReq } from "@/models/requests";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export async function getUserDetails(email : string, authtoken : string): Promise<Success | Unsuccessful> {
    // console.log(authtoken);
    try {
        const response = await axios.get(`https://dev.occupi.tech/api/user-details`, {
            params: {
                email: email
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authtoken
            },
            withCredentials: true
        });
        // console.log(response.data);
        return response.data as Success;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // console.log(error.response.data);
            return error.response.data as Unsuccessful;
        } else {
            throw error;
        }
    }
}

export async function getNotificationSettings(email : string): Promise<Success | Unsuccessful> {
    let authToken = await SecureStore.getItemAsync('Token');
    // console.log(authToken);
    try {
        const response = await axios.get(`https://dev.occupi.tech/api/get-notification-settings`, {
            params: {
                email: email
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${authToken}`
            },
            withCredentials: true
        });
        // console.log(response.data);
        return response.data as Success;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // console.log(error.response.data);
            return error.response.data as Unsuccessful;
        } else {
            throw error;
        }
    }
}

export async function getSecuritySettings(email : string): Promise<Success | Unsuccessful> {
    let authToken = await SecureStore.getItemAsync('Token');
    // console.log(authToken);
    try {
        const response = await axios.get(`https://dev.occupi.tech/api/get-security-settings`, {
            params: {
                email: email
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${authToken}`
            },
            withCredentials: true
        });
        // console.log(response.data);
        return response.data as Success;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // console.log(error.response.data);
            return error.response.data as Unsuccessful;
        } else {
            throw error;
        }
    }
}

export async function updateSecuritySettings(req: SecuritySettingsReq): Promise<Success | Unsuccessful> {
    let authToken = await SecureStore.getItemAsync('Token');
    try {
        const response = await axios.post("https://dev.occupi.tech/api/update-security-settings", req, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authToken
            },
            withCredentials: true
        });
        // console.log(response.data);
        return response.data as Success;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // console.log(error.response.data);
            return error.response.data as Unsuccessful;
        } else {
            throw error;
        }
    }
}

export async function updateNotificationSettings(req: NotificationSettingsReq): Promise<Success | Unsuccessful> {
    let authToken = await SecureStore.getItemAsync('Token');
    try {
        const response = await axios.get("https://dev.occupi.tech/api/update-notification-settings",{
            params: {
                req
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authToken
            },
            withCredentials: true
        });
        // console.log(response.data);
        return response.data as Success;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // console.log(error.response.data);
            return error.response.data as Unsuccessful;
        } else {
            throw error;
        }
    }
}