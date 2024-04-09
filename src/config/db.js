import mongoose from "mongoose"; 

const Mongoose = process.env.MONGO_URL; 

export const db = mongoose.connect(Mongoose, { })
.then(() => console.log('Connected to Dateconnect database...')) 
.catch(err => console.log('Could not connect to dateconnect database...'))