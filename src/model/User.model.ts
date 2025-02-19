import mongoose from "mongoose";


const userScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    university: {
        type: [String],
        required: true,
    },
}
    , { timestamps: true }
);

export const User = mongoose.model('User', userScheme);