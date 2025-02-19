import dotenv from "dotenv"

export interface IConfigVariables {
    port: number;
    database: {
        username: string;
        uri: string;
        password: string;
    };
    auth: {
        'jwt-secret': string;
        'jwt-expiration': number;
    };
}

dotenv.config();

export const envconfig : IConfigVariables = {
    port: parseInt(process.env.PORT!, 10) || 3000,
    database: {
        username: process.env.DB_USERNAME || 'username',
        password: process.env.DB_PASSWORD || 'password',
        uri: process.env.DB_URI || 'mongodb://localhost:27017',
    },
    auth: {
        'jwt-secret': process.env.JWT_SECRET || '',
        'jwt-expiration': 60*60*24*7 // 7 days,
    },
};