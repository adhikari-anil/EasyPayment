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

// Store SSE clients
const clients = new Map();

// SSE endpoint
app.get('/api/v1/balance-updates', (req, res) => {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };
    clients.set(clientId, newClient);

    req.on('close', () => {
        clients.delete(clientId);
    });
});

// Function to send SSE updates
function sendSSEUpdate(userId, balance) {
    clients.forEach(client => {
        client.res.write(`data: ${JSON.stringify({ userId, balance })}\n\n`);
    });
}

// Add sendSSEUpdate to app for use in routes
app.set('sendSSEUpdate', sendSSEUpdate);


app.use("/api/v1",mainRouter);

//for testing backend...
app.get("/test",(req,res)=>{
    res.send("Hello World");
});

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








