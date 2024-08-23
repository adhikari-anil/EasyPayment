const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  
});

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectId, //reference to the User model
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    required: true
  }
})

const transactionSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true 
  },
  to: {
    type: String,
    required: true    
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
},{timestamps: true})

const Transaction = mongoose.model("Transaction", transactionSchema);
const Account = mongoose.model("Account", accountSchema);
const User = mongoose.model("User", userSchema);


module.exports = {
  Transaction,
  User,
  Account
};

