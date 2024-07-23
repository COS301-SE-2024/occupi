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