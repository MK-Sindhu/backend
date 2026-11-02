import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({exptended: true, limit: "16kb"}))
app.use(express.static("public")) // to store public assets like images, pdfs, etc
app.use(cookieParser())


// routes import 
import userRouter from "./routes/user.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)

// https://localhost:<>/api/vi/users/<>

export { app }