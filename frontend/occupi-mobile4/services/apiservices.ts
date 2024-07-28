import { Success, Unsuccessful } from "@/models/response";
import axios from 'axios';
import { getToken } from "./securestore";

// const authToken = getToken();

export async function getUserDetails(email : string, authtoken : string): Promise<Success | Unsuccessful> {
    console.log(authtoken);
    try {
        const response = await axios.get(`https://dev.occupi.tech/api/user-details`, {
            params: {
                email: email
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authtoken
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