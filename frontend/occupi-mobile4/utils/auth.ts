//this folder contains functions that will call the service functions which make api requests for authentication
//the purpose of this file is to refine and process the data and return these to the View

import { forgotPassword, login, logout, register, resetPassword, verifyOtp, verifyOtplogin, verifyOtpRegister } from "../services/authservices";
import { fetchNotificationSettings, fetchSecuritySettings, fetchUserDetails } from "./user";
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { storeUserEmail, storeToken, setState, deleteAllData, storeOtp } from "../services/securestore";
import { retrievePushToken } from "./notifications";


export async function UserLogin(email: string, password: string) {
    storeUserEmail(email);
    try {
        const response = await login({
            email: email,
            password: password
        });
        if (response.status === 200) {
            console.log('responseee',response);
            if (response.data !== null) {
                setState('logged_in');
                await storeToken(response.data.token);
                console.log('log in token',response.data.token);
                fetchUserDetails(email, response.data.token);
                fetchNotificationSettings(email);
                fetchSecuritySettings(email);
                router.replace('/viewbookings');
            }
            else {
                setState('verify_otp_login');
                router.replace('/verify-otp')
            }

            return response.message;
        }
        else {
            console.log('woahhh', response)
            return response.message;
        }
    } catch (error) {
        console.error('Error01:', error);
    }
}

export async function userRegister(email: string, password: string, employeeId: string) {
    let expoPushToken = await retrievePushToken();
    storeUserEmail(email);
    try {
        const response = await register({
            email: email,
            password: password,
            // employee_id: employeeId,
            expoPushToken: expoPushToken
        });
        if (response.status === 200) {
            // console.log('responseee',response);
            setState('verify_otp_register');
            router.replace('/verify-otp');
            return response.message;
        }
        else {
            console.log('woahhh', response)
            return response.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function verifyUserOtpRegister(email: string, otp: string) {
    try {
        const response = await verifyOtpRegister({
            email: email,
            otp: otp
        });
        if (response.status === 200) {
            // console.log('responseee',response);
            storeToken(response.data.token);
            router.replace('/set-details');
            // router.replace('/login');
            return response.message;
        }
        else {
            console.log('woahhh', response)
            return response.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function VerifyUserOtpLogin(email: string, otp: string) {
    try {
        const response = await verifyOtplogin({
            email: email,
            otp: otp
        });
        if (response.status === 200) {
            // console.log('responseee',response)
            setState('logged_in');
            storeToken(response.data.token);
            console.log('here');
            fetchUserDetails(email, response.data.token);
            fetchNotificationSettings(email);
            fetchSecuritySettings(email);
            router.replace('/home');
            return response.message;
        }
        else {
            console.log('woahhh', response)
            return response.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function verifyUserOtp(email: string, otp: string) {
    try {
        const response = await verifyOtp({
            email: email,
            otp: otp
        });
        console.log(response);
        if (response.status === 200) {
            storeOtp(otp);
            router.replace('/create-password');
            return response.message;
        }
        else {
            console.log('woahhh', response)
            return response.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function userForgotPassword(email: string) {
    storeUserEmail(email);
    const body = {
        email: email
    }
    try {
        const response = await forgotPassword(body);
        if (response.status === 200) {
            console.log('responseee', response);
            setState('reset_password');
            router.replace('/verify-otp');
            return response.message as string;
        }
        else {
            console.log('woahhh', response)
            return response.message as string;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function userResetPassword(newPassword: string, newPasswordConfirm: string) {
    const email = await SecureStore.getItemAsync('Email') || "";
    const otp = await SecureStore.getItemAsync('Otp');
    const body = {
        email: email,
        otp: otp,
        newPassword: newPassword,
        newPasswordConfirm: newPasswordConfirm
    }
    try {
        const response = await resetPassword(body);
        if (response.status === 200) {
            console.log('responseee', response);
            setState('logged_in');
            storeToken(response.data.token);
            fetchUserDetails(email, response.data.token);
            fetchNotificationSettings(email);
            fetchSecuritySettings(email);
            router.replace('/home');
            return response.message as string;
        }
        else {
            console.log('woahhh', response)
            return response.message as string;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


export async function UserLogout() {
    // console.log('hhhh');
    try {
        const response = await logout();
        if (response.status === 200) {
            // console.log('responseee',response);
            setState('logged_out');
            deleteAllData();
            router.replace('/login');
            return response.message;
        }
        else {
            console.log('woahhh', response)
            return response.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}