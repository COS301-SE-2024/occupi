//this folder contains functions that will call the service functions which make api requests for authentication
//the purpose of this file is to refine and process the data and return these to the View

import { login } from "../services/authservices";

export async function UserLogin(email: string, password: string) {
    try {
        const response = await login({
            email: email,
            password: password
        });
        console.log(response);
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}

UserLogin("boygenius31115@gmail.com", "Qwert@123"); //test