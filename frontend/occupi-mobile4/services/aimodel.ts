import axios from 'axios';
import { Prediction } from '@/models/data';

export async function getPredictions(): Promise<Prediction[] | undefined> {
    // let authToken = await SecureStore.getItemAsync('Token');
    try {
        const response = await axios.get("https://ai.occupi.tech/predict_week", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        return response.data as Prediction[];
    } catch (error) {
        console.error(`Error in ${Function}:`, error);
        if (axios.isAxiosError(error) && error.response?.data) {
            return error.response.data;
        }
    }

    return undefined;
}

export async function getDayPredictions(): Promise<Prediction | undefined> {
    // let authToken = await SecureStore.getItemAsync('Token');
    try {
        const response = await axios.get("https://ai.occupi.tech/predict", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        return response.data as Prediction;
    } catch (error) {
        console.error(`Error in ${Function}:`, error);
        if (axios.isAxiosError(error) && error.response?.data) {
            return error.response.data;
        }
    }

    return undefined;
}


export { Prediction };
// getPredictions();