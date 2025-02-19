export interface UserData {
    name: string;
    email: string;
    password: string;
    university: string[];
}

export interface registerRequest extends Request {
    userData: UserData;
}