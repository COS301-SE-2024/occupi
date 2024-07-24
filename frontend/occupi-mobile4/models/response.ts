//these models describe the structure of the responses from the api

export interface Error {
    code: string;
    details: string;
    message: string;
}
export interface Unsuccessful {
    status: string;
    message: string;
    error: Error;
}

export interface LoginSuccess {
    data: {
        token: string;
    };
    message: string;
    status: number;
}

export interface Success {
    status: number;
    message: string;
    data: any;
}