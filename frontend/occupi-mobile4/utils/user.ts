import { UpdateDetailsReq } from "@/models/requests";
import { getUserDetails, getNotificationSettings, getSecuritySettings, updateSecuritySettings, updateNotificationSettings, updateUserDetails } from "../services/apiservices";
import { storeUserData, storeNotificationSettings, getUserData, storeSecuritySettings, setState } from "../services/securestore";
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';


export async function fetchUserDetails(email: string, token: string) {
    try {
        const response = await getUserDetails(email, token);
        if (response.status === 200) {
            storeUserData(JSON.stringify(response.data));
        }
        else {
            console.log(response)
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function fetchNotificationSettings(email: string) {
    try {
        const response = await getNotificationSettings(email);
        if (response.status === 200) {
            const settings = {
                invites: response.data.invites,
                bookingReminder: response.data.bookingReminder
            };
            // console.log('settings response', response.data);
            // console.log(settings);
            storeNotificationSettings(JSON.stringify(settings));
        }
        else {
            console.log(response)
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function fetchSecuritySettings(email: string) {
    try {
        const response = await getSecuritySettings(email);
        if (response.status === 200) {
            const settings = {
                mfa: response.data.mfa,
                forcelogout: response.data.forceLogout
            };
            // console.log('settings response', response.data);
            // console.log(settings);
            storeSecuritySettings(JSON.stringify(settings));
        }
        else {
            console.log(response)
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function updateSecurity(type: string, values: any) {
    let userData = await SecureStore.getItemAsync('UserData');
    let user = JSON.parse(userData || "");
    let email = user.email;
    if (type === "settings") {
        try {
            const request = {
                email: email,
                mfa: values.mfa,
                forceLogout: values.forceLogout
            }
            const response = await updateSecuritySettings(request);
            if (response.status === 200) {
                const settings = {
                    mfa: values.mfa,
                    forceLogout: values.forceLogout
                };
                console.log('settings response', response);
                console.log(settings);
                storeSecuritySettings(JSON.stringify(settings));
                router.replace('/settings')
                return "Settings updated successfully"
            }
            else {
                // console.log(response)
                return response.message;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        try {
            const request = {
                email: email,
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                newPasswordConfirm: values.newPasswordConfirm
            }
            const response = await updateSecuritySettings(request);
            if (response.status === 200) {
                router.replace('/set-security')
                return "Successfully changed password"
            }
            else {
                // console.log(response);
                return response.message;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

export async function updateDetails(name: string, dob: string, gender: string, cellno: string, pronouns: string) {
    const email = await SecureStore.getItemAsync('Email');
    const state = await SecureStore.getItemAsync('AppState');
    try {
        const request : UpdateDetailsReq = {
            session_email: email,
            name: name,
            dob: dob + "T00:00:00.000Z",
            gender: gender,
            number: cellno,
            pronouns: pronouns,
        }
        const response = await updateUserDetails(request);
        if (response.status === 200) {
            console.log(response);
            if (state === "verify_otp_register") {
                setState("logged_out");
                router.replace('/home');
                return "Details updated successfully";
            }
            router.replace('/settings')
            return "Details updated successfully"
        }
        else {
            // console.log(response)
            return response.message;
        }
    } catch (error) {
        console.error('Error:', error);
        return 'Error occurred';
    }
}

export async function updateNotifications(values: any) {
    let userData = await SecureStore.getItemAsync('UserData');
    let user = JSON.parse(userData || "");
    let email = user.email;
    try {
        const request = {
            email: email,
            invites: values.invites,  // Changed from values.mfa
            bookingReminder: values.bookingReminder  // Changed from values.forceLogout
        }
        const response = await updateNotificationSettings(request);
        if (response.status === 200) {
            const settings = {
                invites: values.invites,
                bookingReminder: values.bookingReminder
            };
            console.log('settings response', response);
            console.log(settings);
            storeNotificationSettings(JSON.stringify(settings));
            router.replace('/settings')
            return "Settings updated successfully"
        }
        else {
            console.log(response)
            return response.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function fetchUsername() {
    let userData = await SecureStore.getItemAsync('UserData');
    let user = JSON.parse(userData || "{}");
    // console.log(user.name);
    return user.name;
}