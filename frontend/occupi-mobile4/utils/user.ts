import { getUserDetails, getNotificationSettings, getSecuritySettings, updateSecuritySettings, updateNotificationSettings } from "../services/apiservices";
import { storeUserData, storeNotificationSettings, getUserData, storeSecuritySettings } from "../services/securestore";
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
                console.log(response)
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
                console.log(response);
                return response.message;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

export async function updateNotifications(values: any) {
    let userData = await SecureStore.getItemAsync('UserData');
    let user = JSON.parse(userData || "");
    let email = user.email;
    try {
        const request = {
            email: email,
            invites: values.mfa,
            bookingReminder: values.forceLogout
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