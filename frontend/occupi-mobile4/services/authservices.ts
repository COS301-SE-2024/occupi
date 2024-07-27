import { LoginReq } from "@/models/requests";
import { LoginSuccess, Unsuccessful } from "@/models/response";
import axios from 'axios';
import dotenv from 'dotenv';

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
        return response.data as LoginSuccess;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
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