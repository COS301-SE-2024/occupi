import { LoginReq, RegisterReq, VerifyOTPReq } from "@/models/requests";
import { LoginSuccess, Unsuccessful, Success } from "@/models/response";
import axios from 'axios';
import dotenv from 'dotenv';
import * as SecureStore from 'expo-secure-store';

// dotenv.config();
// const devUrl = process.env.EXPO_PUBLIC_DEVELOP_API_URL;
// console.log(devUrl);

export async function login(req: LoginReq): Promise<LoginSuccess | Unsuccessful> {
        try {
        console.log(req);
        const response = await fetch("https://dev.occupi.tech/auth/login-mobile", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(req)
        });
    
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error02', errorData);
            return errorData as Unsuccessful;
        }
    
        const data = await response.json();
        return data as LoginSuccess;
    } catch (error) {
        console.error('Error03', error);
        throw error;
    }
}

export async function register(req: RegisterReq): Promise<Success | Unsuccessful> {
    console.log(req);
    try {
        const response = await axios.post("https://dev.occupi.tech/auth/register", req, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        console.log(response.data);
        return response.data as Success;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.log(error.response.data);
            return error.response.data as Unsuccessful;
        } else {
            throw error;
        }
    }
}

export async function verifyOtpRegister(req: VerifyOTPReq): Promise<LoginSuccess | Unsuccessful> {
    console.log('sending',req);
    try {
        const response = await axios.post("https://dev.occupi.tech/auth/verify-otp-mobile-login", req, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        console.log(response.data);
        return response.data as LoginSuccess;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.log(error.response.data);
            return error.response.data as Unsuccessful;
        } else {
            throw error;
        }
    }
}

export async function verifyOtplogin(req: VerifyOTPReq): Promise<LoginSuccess | Unsuccessful> {
    console.log(req);
    try {
        const response = await axios.post("https://dev.occupi.tech/auth/verify-otp-mobile-login", req, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        // console.log(response.data);
        return response.data as LoginSuccess;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // console.log(error.response.data);
            return error.response.data as Unsuccessful;
        } else {
            throw error;
        }
    }
}

export async function verifyOtp(req: VerifyOTPReq): Promise<LoginSuccess | Unsuccessful> {
    console.log(req);
    try {
        const response = await axios.post("https://dev.occupi.tech/auth/verify-otp", req, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        // console.log(response.data);
        return response.data as LoginSuccess;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // console.log(error.response.data);
            return error.response.data as Unsuccessful;
        } else {
            throw error;
        }
    }
}

export async function forgotPassword(req: any): Promise<Success | Unsuccessful> {
    try {
        const response = await axios.post("https://dev.occupi.tech/auth/forgot-password", req, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        console.log(response.data);
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

export async function resetPassword(req: any): Promise<LoginSuccess | Unsuccessful> {
    try {
        const response = await axios.post("https://dev.occupi.tech/auth/reset-password-mobile-login", req, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        console.log(response.data);
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

export async function getRTCToken(): Promise<Success | Unsuccessful> {
    let authToken = await SecureStore.getItemAsync('Token');
    // console.log('token',authToken);
    try {
        const response = await axios.get("https://dev.occupi.tech/rtc/get-token", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${authToken}`
            },
            withCredentials: true
        });
        console.log('token here',response.data);
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

export async function logout(): Promise<Success | Unsuccessful> {
    let authToken = await SecureStore.getItemAsync('Token');
    // console.log('token',authToken);
    try {
        const response = await axios.post("https://dev.occupi.tech/auth/logout", {},{
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