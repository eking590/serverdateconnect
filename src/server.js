import express from "express";
import {authRoutes, likeRoutes,profileRoutes} from '../src/routes/index.js'
import { Authorization } from "./middlewares/authorization.js";
import mongoose from "mongoose";
import { config } from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { generatedOtp } from "../utils/otpGenerator.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
//init sockect.io
const httpServer = createServer(app);
const io = new Server(httpServer);

//check io connection
io.on("connection", (socket) => {
  console.log(`${socket} connected`);
});

// Increase the payload limit (e.g., 10MB)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());
//add errorhandler here 
app.use(errorHandler);
//routes

//auth routed
app.use("/api/v1/auth", authRoutes);

//like routed 
app.use("/api/v1/like", likeRoutes); 


//profile routed 
app.use("/api/v1/profile", profileRoutes); 



//app routes
//app.use("/api/v1/app", authorization, appRoute);

//.env config
config();

 
//dbconnection
await mongoose
  .connect(process.env.MONGO_URL )
  .then(console.log("connected to MongoDB"))
  .catch(console.error);

app.listen( process.env.PORT|| 3000, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`Server listening on port ${process.env.PORT}  `);
});