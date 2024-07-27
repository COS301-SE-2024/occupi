//this folder contains functions that will call the service functions which make api requests for authentication
//the purpose of this file is to refine and process the data and return these to the View

import { login } from "../services/authservices";
import { router } from 'expo-router';


export async function UserLogin(email: string, password: string) {
    try {
        const response = await login({
            email: email,
            password: password
        });
        if (response.status === 200) {
            console.log(response.message);
            router.replace('/home');
            return response.message;
        }
        else {
            return response.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// UserLogin("boygenius31115@gmail.com", "Qwert@123"); //test