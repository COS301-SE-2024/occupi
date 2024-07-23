//these models describe data to be sent to the api (POST body)

/* ---Auth Requests--- */

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

/* ---API Requests--- */

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
    filter?: {
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


//Users

export interface UpdateDetails {
    email?: string;
    name?: string;
    dob?: string;
    gender?: string;
    session_email: string;
    employeeid?: string;
    number?: string;
    pronouns?: string;
}

export interface Notifications {
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

export interface SecuritySettings {
    email: string;
    mfa: "on" | "off";
    forceLogout: "on" | "off";
    currentPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
}

export interface NotificationSettings {
    email: string;
    invites: "on" | "off";
    bookingReminder: "on" | "off";
}