import universities from "@/lib/universities";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
        validate: {
            validator: function (value: string[]) {
                return value.every(univ => universities.hasOwnProperty(univ));
            },
            message: (props: { value: string[] }) => {
                const invalidUniv = props.value.find(univ => !universities.hasOwnProperty(univ));
                return `${invalidUniv} is not a valid university abbreviation`;
            }
        }
    },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
