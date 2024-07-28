import { getUserDetails, getNotificationSettings, getSecuritySettings } from "../services/apiservices";
import { storeUserData, storeNotificationSettings, getUserData, storeSecuritySettings } from "../services/securestore";
import * as SecureStore from 'expo-secure-store';


export async function fetchUserDetails(email: string, token : string) {
    try {
        const response = await getUserDetails(email, token);
        if (response.status === 200) {
            // console.log(response.data);
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
            storeSecuritySettings(JSON.stringify(settings));
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
            console.log('settings response', response.data);
            console.log(settings);
            storeNotificationSettings(JSON.stringify(settings));
        }
        else {
            console.log(response)
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function fetchUsername() {
    // let userData = getUserData();
    let userData = await SecureStore.getItemAsync('UserData');
    let user = JSON.parse(userData);
    // console.log(user.name);
    return user.name;
}

// fetchUserDetails("kamogelomoeketse@gmail.com");