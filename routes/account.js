const express = require("express");
const { Transaction, Account, User } = require("../model/dataModel");
const { authMiddleware } = require("../middleware");
const { default: mongoose } = require("mongoose");

const router = express.Router();

// Route for getting total balance of User..

router.get("/balance", authMiddleware, async (req, res)=>{
    const account = await Account.findOne({
        userId: req.userId
    });
    
    if(account){
        return res.status(200).json({
            message: "Account Found ",
            balance: account.balance
        })
    }
    return res.json({
        message: "Probelm in checking your balance"
    })
})

//Route for transfering money to another account...

router.post("/transfer", authMiddleware, async (req,res)=>{
    const session = await mongoose.startSession();  // it starts session done to handle partial operation...
    session.startTransaction();
    const {amount , to} = req.body;

    const user = await User.findOne({
        username: to
    })

    const reciever = user._id;

    // fetch the account within the transaction...
    const account = await Account.findOne({
        userId: req.userId
    }).session(session);
    
    if(!account || account.balance < amount){    // checks whether main balance is less than sent amount..
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    const toAccount = await Account.findOne({userId: reciever}).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            message: "Reciever not found..."
        })
    }

    // Perform transfer....

    await Account.updateOne({userId: req.userId}, {$inc: {balance: -amount}}).session(session);//for signed user
    await Account.updateOne({userId: reciever}, {$inc: {balance: amount}}).session(session); //for reciever


    const transaction = await Transaction.create({
        from: req.userId,
        to: to,
        amount
    });
    
    //commit the transaction...
    await session.commitTransaction();

    // Fetch updated balances
    const updatedSenderAccount = await Account.findOne({ userId: req.userId });
    const updatedReceiverAccount = await Account.findOne({ userId: reciever });

    // Send SSE updates
    const sendSSEUpdate = req.app.get('sendSSEUpdate');
    sendSSEUpdate(req.userId, updatedSenderAccount.balance);
    sendSSEUpdate(reciever, updatedReceiverAccount.balance);


    return res.status(200).json({
        message: "Transfer Successfull.."
    })
})

module.exports = router;