import express from "express";

const app = express();

app
    .listen(3001, () => {
        console.log("Server running at PORT: ", 3001);
    })
    .on("error", (error) => {
        throw new Error(error.message);
    });