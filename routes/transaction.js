const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { User } = require("../model/dataModel");
const { Transaction } = require("../model/dataModel");

router.get("/alltransaction", authMiddleware, async (req, res) => {

  const signedInUser = req.userId;
  console.log("Signed user: ", signedInUser);
  const filter = req.query.filter || "";

  const transactions = await Transaction.find({
    $and: [{
      from: signedInUser
    },{
      to: {
        $regex: filter,
      },
    }],
  });

  console.log("transaction filter garera aako: ", transactions);

  if (transactions.length == 0) {
    return res.status(400).json({
      message: "No any transaction with such name...",
    });
  }
  return res.status(200).json({
    transaction: transactions.map((trans) => ({
      from: trans.from,
      to: trans.to,
      amount: trans.amount,
      date: trans.date,
      createdAt: trans.createdAt,
      _id: trans._id
    })),
  });
});

router.get("/alltransaction/:id", async (req,res)=>{
  const transaction = await Transaction.findById(req.params.id);

  if(!transaction){
    return res.status(404).json({
      message: "Transaction not found..."
    })
  }

  const sender = await User.findOne({
    _id: transaction.from
  })

  return res.status(200).json({
    transaction,
    sender
  })
})

module.exports = router;
