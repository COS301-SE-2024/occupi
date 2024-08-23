import { Booking, Room } from "@/models/data";
import { bookRoom, cancelBooking, checkin, getAvailableTimes, getExpoPushTokens, getRooms, getUserBookings } from "../services/apiservices";
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { BookRoomReq, CancelBookingReq, ViewBookingsReq, ViewRoomsReq } from "@/models/requests";
import { sendPushNotification } from "./notifications";

export async function fetchUserBookings(): Promise<Booking[]> {
    let email = await SecureStore.getItemAsync('Email');
    try {
      const response = await getUserBookings(email);
      if (response.status === 200) {
        return response.data;
      } else {
        console.log(response);
        return response.data as Booking[];
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

export async function fetchRooms(floorNo: string, roomName: string) {
    let body: ViewRoomsReq = {};
    if (floorNo !== '') {
        body = {
            operator: "eq",
            filter: {
                floorNo: floorNo,
            }
        }
    }
    else if (roomName !== '') {
        body = {
            operator: "eq",
            filter: {
                roomName: roomName,
            }
        }
    }
    else {
        body = {
            operator: "eq",
            filter: {
                floorNo: "0"
            }
        }
    }
    try {
        const response = await getRooms(body);
        if (response.status === 200) {
            // console.log('response', response.data);
            return response.data;
            // console.log(settings);
        }
        else {
            console.log(response)
        }
        return response.data as Room[];
    } catch (error) {
        console.error('Error:', error);
        throw error; // Add a throw statement to handle the error case
    }
}

export async function fetchSlots(roomId: string, date: string) {
    const body = {
        roomId: roomId,
        date: date
    }
    try {
        const response = await getAvailableTimes(body);
        if (response.status === 200) {
            return response.data;
        }
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

fetchSlots("RM002", "2024-07-01T00:00:00.000Z");

export async function userBookRoom(attendees: string[], startTime: string, endTime: string) {
    let roomstring = await SecureStore.getItemAsync("BookingInfo");
    let email = await SecureStore.getItemAsync("Email");
    const room: Booking = JSON.parse(roomstring as string);
    const body: BookRoomReq = {
      roomName: room.roomName,
      creator: email,
      date: room.date + "T00:00:00.000+00:00",
      start: room.date + "T" + startTime + ":00.000+00:00",
      end: room.date + "T" + endTime + ":00.000+00:00",
      floorNo: room.floorNo,
      emails: attendees,
      roomId: room.roomId
    };
    console.log(body);
    try {
      const response = await bookRoom(body);
      if (response.status === 'success') {
        console.log('attendees', attendees);
        const response = await getExpoPushTokens(attendees);
        const pushTokens: string[] = response?.data || [];
        console.log(pushTokens);
        sendPushNotification(pushTokens, 'Meeting Invite', `${email} has invited you to a meeting in ${room.roomName} on ${room.date}`);
        return response.message || 'Room booked successfully';
      }
      return response.message || 'Booking failed';
    } catch (error) {
      console.error('Error:', error);
      throw error;
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

export async function userCancelBooking() {
    let roomstring = await SecureStore.getItemAsync("CurrentRoom");
    const room : Booking = JSON.parse(roomstring as string);
    let email = await SecureStore.getItemAsync('Email');
    const body : CancelBookingReq = {
        bookingId: room?.occupiId,
        emails: room?.emails,
        roomId: room?.roomId,
        creator: room.creator,
        date: room?.date,
        start: room?.start,
        end: room?.end,
        floorNo: room?.floorNo,
        roomName: room?.roomName
    }
    try {
        const response = await cancelBooking(body);
        if (response.status === 200) {
            router.replace('/home');
            return response.message;
        }
        return response.message;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
