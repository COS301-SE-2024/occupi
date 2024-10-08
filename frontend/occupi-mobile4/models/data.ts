//these models describe the room structure as well as booking information structure

export interface Room {
    description: string;
    floorNo: string;
    maxOccupancy: string;
    minOccupancy:string;
    roomId: string;
    roomName: string;
    roomNo: string; 
}

interface Images {
    highRes: string;
    lowRes: string;
    midRes: string;
    thumbnailRes: string;
  }

export interface Booking {
    checkedIn: boolean;
    creators: string;
    date: string;
    emails: string[];
    end: string;
    floorNo: string;
    occupiID: string;
    roomId: string;
    roomName: string;
    start: string;
    roomImage : Images;
}

export interface User {
    email: string;
    name: string;
    dob: string;
    gender: "Male" | "Female" | "Other";
    session_email: string;
    employeeid: string;
    number: string;
    pronouns?: string;
}

export interface Notification {
    message: string;
    send_time: string;
    title: string;
    unreadEmails: string[];
}

export interface SecuritySettings {
    mfa: "on" | "off";
    forceLogout: "on" | "off";
}

export interface NotificationSettings {
    invites: "on" | "off";
    bookingReminder: "on" | "off";
}

export interface Prediction {
    Date: number,
    Day_of_Week: number,
    Day_of_month: number,
    Is_Weekend: boolean,
    Month: number,
    Predicted_Attendance_Level: string,
    Predicted_Class: number,
    Special_Event: number
}

export interface HourlyPrediction {
    Date: number,
    Day_of_Week: number,
    Day_of_month: number,
    Is_Weekend: boolean,
    Month: number,
    Hourly_Predictions: HourPrediction[],
    Special_Event: number
}

export interface HourPrediction {
    Hour: number;
    Predicted_Attendance_Level: string,
    Predicted_Class: number,
}