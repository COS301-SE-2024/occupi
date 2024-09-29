import axios from 'axios';
import { HourlyPrediction, Prediction } from '@/models/data';

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

export async function getDatePredictions(date: string): Promise<Prediction | undefined> {
    // let authToken = await SecureStore.getItemAsync('Token');
    try {
        const response = await axios.get(`https://ai.occupi.tech/predict_date?date=${date}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        // console.log('here buddy',response.data);
        return response.data as Prediction;
    } catch (error) {
        console.error(`Error in ${Function}:`, error);
        if (axios.isAxiosError(error) && error.response?.data) {
            return error.response.data;
        }
    }

    return undefined;
}

export async function getWeekPredictions(date: string): Promise<Prediction[] | undefined> {
    // let authToken = await SecureStore.getItemAsync('Token');
    try {
        const response = await axios.get(`https://ai.occupi.tech/predict_week_from_date?date=${date}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        // console.log(response.data);
        return response.data as Prediction[];
    } catch (error) {
        console.error(`Error in ${Function}:`, error);
        if (axios.isAxiosError(error) && error.response?.data) {
            return error.response.data;
        }
    }

    return undefined;
}

export async function fetchHourlyPredictions(): Promise<HourlyPrediction | undefined> {
    // let authToken = await SecureStore.getItemAsync('Token');
    try {
        const response = await axios.get(`https://ai.occupi.tech/predict_day?start_hour=7&end_hour=17`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        // console.log(response.data);
        return response.data as HourlyPrediction;
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