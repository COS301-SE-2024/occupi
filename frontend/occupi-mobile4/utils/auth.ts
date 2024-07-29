//this folder contains functions that will call the service functions which make api requests for authentication
//the purpose of this file is to refine and process the data and return these to the View

import { login, logout } from "../services/authservices";
import { fetchNotificationSettings, fetchSecuritySettings, fetchUserDetails } from "./user";
import { router } from 'expo-router';
import { storeUserEmail, storeToken, setState, deleteToken, deleteUserData, deleteUserEmail, deleteNotificationSettings, deleteSecuritySettings } from "../services/securestore";


export async function UserLogin(email: string, password: string) {
    storeUserEmail(email);
    try {
        const response = await login({
            email: email,
            password: password
        });
        if (response.status === 200) {
            // console.log('responseee',response);
            if (response.data.token) {
                setState('logged_in');
                storeToken(response.data.token);
                // console.log('here');
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