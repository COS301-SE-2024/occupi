//this folder contains functions that will call the service functions which make api requests for authentication
//the purpose of this file is to refine and process the data and return these to the View

import { login, logout, register, verifyOtplogin, verifyOtpRegister } from "../services/authservices";
import { fetchNotificationSettings, fetchSecuritySettings, fetchUserDetails } from "./user";
import { router } from 'expo-router';
import { storeUserEmail, storeToken, setState, deleteToken, deleteUserData, deleteUserEmail, deleteNotificationSettings, deleteSecuritySettings } from "../services/securestore";
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
                storeToken(response.data.token);
                console.log('here');
                fetchUserDetails(email, response.data.token);
                fetchNotificationSettings(email);
                fetchSecuritySettings(email);
                router.replace('/home');
            } 
            else {
                setState('verify_otp_login');
                router.replace('verify-otp')
            }

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
            console.log('responseee',response);
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
            console.log('responseee',response);
            setState('logged_out');
            router.replace('/set-details');
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

export async function VerifyUserOtpLogin(email : string, otp : string) {
    try {
        const response = await verifyOtplogin({
            email: email,
            otp: otp
        });
        if (response.status === 200) {
            console.log('responseee',response);
            if (response.data !== null) {
                setState('logged_in');
                storeToken(response.data.token);
                console.log('here');
                fetchUserDetails(email, response.data.token);
                fetchNotificationSettings(email);
                fetchSecuritySettings(email);
                router.replace('/home');
            }

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

export async function UserLogout() {
    // console.log('hhhh');
    try {
        const response = await logout();
        if (response.status === 200) {
            // console.log('responseee',response);
            setState('logged_out');
            deleteNotificationSettings();
            deleteSecuritySettings();
            deleteUserData();
            deleteToken();
            deleteUserEmail();
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

// UserLogin("kamogelomoeketse@gmail.com", "Qwerty@123"); //test