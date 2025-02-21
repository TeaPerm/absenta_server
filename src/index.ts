import 'module-alias/register';
import express from "express";
import { connectToDatabase } from "./config/db";
import dotenv from "dotenv"
import apiRouter from "@/routes/routes";
import { envconfig } from './config/env.config';
import cors from "cors";

//SETUP
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  });


connectToDatabase();

app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use("/api", apiRouter);

app
    .listen(envconfig.port, () => {
        console.log("Server running at PORT: ", envconfig.port);
    })
    .on("error", (error) => {
        throw new Error(error.message);
    });