const express = require("express");
const cors = require("cors");
const mainRouter = require("./routes/routes");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT;
const hostname = process.env.HOSTNAME;

const app = express();

app.use(cors({
    origin: process.env.ORIGIN
}));
app.use(express.json());
app.use("/api/v1", mainRouter);


const connectDB = async ()=>{
    try {
        mongoose.connect(process.env.DBURL);
        console.log("Database is connected..");
    } catch (error) {
        console.log("Error From the Server connect DataBase..", error);
        process.exit(1);
    }
}
connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`The Server is running at http://${hostname}:${port}`);
    })
}).catch((err)=>{
    console.log("Error while calling ConnectDB function..", err);
})








