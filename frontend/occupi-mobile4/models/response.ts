//these models describe the structure of the responses from the api

export interface Error {
    code: string;
    details: string;
    message: string;
}
export interface Unsuccessful {
    status: 'error';
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
    status: 'success';
    message: string;
    data: any;
}