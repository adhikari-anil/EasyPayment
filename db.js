const mongoose = require("mongoose");

let isConnected = false;

async function connectToDataBase() {
  if (isConnected) {
    console.log("Using Existing Connection!");
    return;
  }
  console.log("URL", process.env.DBURL);
  await mongoose.connect(process.env.DBURL);
  isConnected = true;
  console.log("DataBase is Connected!");
}

module.exports = { connectToDataBase };
