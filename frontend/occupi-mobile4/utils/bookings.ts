import { Booking } from "@/models/data";
import { checkin, getUserBookings } from "../services/apiservices";
import * as SecureStore from 'expo-secure-store';

export async function fetchUserBookings(): Promise<Booking[]> {
    let email = await SecureStore.getItemAsync('Email');
    try {
        const response = await getUserBookings(email);
        if (response.status === 200) {
            // console.log('response', response.data);
            return response.data;
            // console.log(settings);
        }
        else {
            console.log(response)
        }
        return response.data as Booking[];
    } catch (error) {
        console.error('Error:', error);
        throw error; // Add a throw statement to handle the error case
    }
}

export async function userCheckin() {
    let roomstring = await SecureStore.getItemAsync("CurrentRoom");
    const room = JSON.parse(roomstring as string);
    const bookingId = room?.occupiId;
    let email = await SecureStore.getItemAsync('Email');
    const body = {
        email: email as string,
        bookingId: bookingId
    }
    try {
        const response = await checkin(body);
        if (response.status === 200) {
            return response.message;
        }
        return response.message;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
