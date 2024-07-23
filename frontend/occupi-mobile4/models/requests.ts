//these models describe data to be sent to the api (POST body)

//Auth Requests

export interface Login {
	email: string;
	password: string;
}

export interface Register {
    email: string;
    password: string;
    employee_id: string;
}

export interface VerifyOTP {
    email: string;
    otp: string;
}

export interface ResetPassword {
    email: string;
    newPassword: string;
    newPasswordConfirm: string;
    otp: string;
}

//API models

//Rooms & Bookings

export interface BookRoom {
    roomId: string;
    emails: string[];
    creator: string;
    floorNo: string; //string integer
    date: string;
    start: string;
    end: string;
}

export interface ViewBookings {
    operator: string;
    filter: {
        email: string;
        date?: string;
    };
    order_asc?: string;
    order_desc?: string;
    projection?: string[];
    limit?: number;
    page?: number;
}

export interface ViewRooms {
    operator: string;
    filter: {
        floorNo: string;
    };
    order_asc?: string;
    order_desc?: string;
    projection?: string[];
    limit?: number;
    page?: number;
}

export interface CancelBooking {
    bookingId: string;
    roomId: string;
    emails: string[];
    creator: string;
    floorNo: string; //string integer
    date: string;
    start: string;
    end: string;
}

export interface CheckIn {
    bookingId: string;
    email: string;
}