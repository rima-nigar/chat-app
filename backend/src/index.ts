import express from "express"
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import dotenv from 'dotenv';
dotenv.config();

const app = express()

app.use(cookieParser());
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes)

app.listen(5001, () => {
    console.log("Sever is running on port 5001");
    
})