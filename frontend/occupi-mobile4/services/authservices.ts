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
        const response = await axios.post("https://dev.occupi.tech/auth/login-mobile", req, {
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

export async function register(req: RegisterReq): Promise<Success | Unsuccessful> {
    // console.log(req);
    try {
        const response = await axios.post("https://dev.occupi.tech/auth/register", req, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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

export async function verifyOtpRegister(req: VerifyOTPReq): Promise<LoginSuccess | Unsuccessful> {
    // console.log('sending',req);
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

export async function verifyOtplogin(req: VerifyOTPReq): Promise<LoginSuccess | Unsuccessful> {
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

// login({
//     email: "boygenius31115@gmail.com",
//     password: "Qwert@123"
// })