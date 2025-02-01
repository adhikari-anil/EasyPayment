const {connectToDataBase}  = require("./db");

const dbMiddleware = async (req, res, next) => {
  try {
    await connectToDataBase();
    next();
  } catch (error) {
    console.log("Database connection error!", error);
    res.status(500).send("Database connection error!");
  }
};

module.exports = { dbMiddleware };
