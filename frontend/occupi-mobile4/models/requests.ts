//these models describe data to be sent to the api (POST body)

/* ---Auth Requests--- */

export interface LoginReq {
	email: string;
	password: string;
}

export interface RegisterReq {
    email: string;
    password: string;
    employee_id?: string;
    expoPushToken: string;
}

export interface VerifyOTPReq {
    email: string;
    otp: string;
}

export interface ResetPasswordReq {
    email: string;
    newPassword: string;
    newPasswordConfirm: string;
    otp: string;
}

/* ---API Requests--- */

//Rooms & Bookings

export interface BookRoomReq {
    roomId: string;
    roomName: string;
    emails: string[];
    creator: string;
    floorNo: string; //string integer
    date: string;
    start: string;
    end: string;
}

export interface ViewBookingsReq {
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

export interface ViewRoomsReq {
    operator: string;
    filter?: {
        floorNo: string;
    };
    order_asc?: string;
    order_desc?: string;
    projection?: string[];
    limit?: number;
    page?: number;
}

export interface CancelBookingReq {
    bookingId: string;
    roomId: string;
    emails: string[];
    creator: string;
    floorNo: string; //string integer
    date: string;
    start: string;
    end: string;
    roomName: string;
}

export interface CheckInReq {
    bookingId: string;
    email: string;
}


//Users

export interface UpdateDetailsReq {
    email?: string;
    name?: string;
    dob?: string;
    gender?: string;
    session_email: string;
    employeeid?: string;
    number?: string;
    pronouns?: string;
}

export interface NotificationsReq {
    operator: string;
    filter?: {
        emails: string[];
    };
    order_asc?: string;
    order_desc?: string;
    projection?: string[];
    limit?: number;
    page?: number;
}

//Updating settings

export interface SecuritySettingsReq {
    email: string;
    mfa?: "on" | "off";
    forceLogout?: "on" | "off";
    currentPassword?: string;
    newPassword?: string;
    newPasswordConfirm?: string;
}

export interface NotificationSettingsReq {
    email: string;
    invites: "on" | "off";
    bookingReminder: "on" | "off";
}