import { getUserDetails } from "../services/apiservices";
import { storeUserData } from "../services/securestore";

export async function fetchUserDetails(email: string, token : string) {
    try {
        const response = await getUserDetails(email, token);
        if (response.status === 200) {
            console.log(response.data);
            storeUserData(response.data);
            return response.message;
        }
        else {
            console.log(response)
            return response.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// fetchUserDetails("kamogelomoeketse@gmail.com");