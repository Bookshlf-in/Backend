const SellerProfiles = require("../models/sellerProfiles");
const SellerTransactions = require("../models/sellerTransactions");
const WithdrawRequests = require("../models/withdrawRequests");

exports.getWithdrawRequests = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const itemsPerPage = Number(req.query.itemsPerPage) || 10;
    if (page < 1) {
      return res.status(400).json({ error: "page value should be positive" });
    }
    if (itemsPerPage < 1) {
      return res.status(400).json({ error: "itemsPerPage should be positive" });
    }

    let findObj = {};
    if (req.query.status) findObj.status = req.query.status;

    const dataCount = await WithdrawRequests.countDocuments(findObj);
    const withdrawRequests = await WithdrawRequests.find(findObj)
      .sort({ createdAt: -1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    const data = await Promise.all(
      withdrawRequests.map(async (withdrawRequest) => {
        withdrawRequest = withdrawRequest._doc;
        const seller = (
          await SellerProfiles.findOne({
            _id: withdrawRequest.sellerId,
          }).select({
            _id: 0,
            walletBalance: 1,
          })
        )?._doc;
        withdrawRequest.currentBalance = seller.walletBalance;
        return withdrawRequest;
      })
    );

    return res.json({
      totalPages: Math.ceil(dataCount / itemsPerPage),
      data,
    });
  } catch (error) {
    console.log("Error occurred in /admin-getWithdrawRequests: ", error);
    res.status(500).json({ error: "Some error occured" });
  }
};

exports.getWithdrawRequest = async (req, res) => {
  try {
    const requestId = req.query.requestId;
    let data = (await WithdrawRequests.findOne({ _id: requestId }))?._doc;
    const seller = (
      await SellerProfiles.findOne({
        _id: data.sellerId,
      }).select({
        _id: 0,
        walletBalance: 1,
      })
    )?._doc;
    data.currentBalance = seller.walletBalance;
    res.json(data);
  } catch (error) {
    console.log("Error occurred in /admin-getWithdrawRequests: ", error);
    res.status(500).json({ error: "Some error occured" });
  }
};

exports.cancelWithdrawRequest = async (req, res) => {
  try {
    const requestId = req.body.requestId;
    const withdrawRequest = await WithdrawRequests.findOne({ _id: requestId })
      .select({ status: 1 })
      .exec();

    if (withdrawRequest.status == "CANCELLED") {
      return res.status(400).json({ error: "Request already cancelled" });
    } else if (withdrawRequest.status == "COMPLETED") {
      return res.status(400).json({
        error: "Request is already completed and cannot be cancelled",
      });
    }

    let updateObj = { status: "CANCELLED" };
    if (req.body.message) updateObj.adminMessage = req.body.message;
    const query = WithdrawRequests.updateOne({ _id: requestId }, updateObj);
    await query.exec((error, withdrawRequest) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "Failed to update withdraw request" });
      }
      res.json({ msg: "Withdraw request cancelled" });
    });
  } catch (error) {
    console.log("Error occurred in /admin-cancelWithdrawRequests: ", error);
    res.status(500).json({ error: "Some error occured" });
  }
};

exports.withdrawRequestMarkComplete = async (req, res) => {
  try {
    const requestId = req.body.requestId;
    const withdrawRequest = await WithdrawRequests.findOne({ _id: requestId });

    if (withdrawRequest.status == "CANCELLED") {
      return res.status(400).json({
        error: "Request is already cancelled and cannot be completed",
      });
    } else if (withdrawRequest.status == "COMPLETED") {
      return res
        .status(400)
        .json({ error: "Request is already marked as completed" });
    }

    const seller = await SellerProfiles.findOne({
      _id: withdrawRequest.sellerId,
    }).select({
      _id: 0,
      walletBalance: 1,
    });

    if (seller?.walletBalance < withdrawRequest.amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const finalWalletBalance = seller.walletBalance - withdrawRequest.amount;

    const modifiedSellerProfile = await SellerProfiles.updateOne(
      { _id: withdrawRequest.sellerId },
      { walletBalance: finalWalletBalance }
    );

    if (modifiedSellerProfile.modifiedCount != 1) {
      return res.status(500).json({ error: "Some error occurred" });
    }

    let transactionObj = {
      type: "DEBIT",
      title: "Withdraw from wallet",
      amount: withdrawRequest.amount,
      sellerId: withdrawRequest.sellerId,
      txnNumber: req.body.txnNumber,
    };
    if (req.body.description) {
      transactionObj.description = req.body.description;
    }
    const sellerTransaction = new SellerTransactions(transactionObj);
    const newSellerTransaction = await sellerTransaction.save();

    const query = WithdrawRequests.updateOne(
      { _id: requestId },
      { status: "COMPLETED" }
    );
    await query.exec((error, withdrawRequest) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "Failed to update withdraw request" });
      }
      res.json({ msg: "Withdraw request marked completed" });
    });
  } catch (error) {
    console.log(
      "Error occurred in /admin-withdrawRequestMarkComplete: ",
      error
    );
    res.status(500).json({ error: "Some error occured" });
  }
};

exports.getSellerTransactionList = async (req, res) => {
  try {
    const sellerId = req.query.sellerId;
    const data = await SellerTransactions.find({ sellerId })
      .sort({ createdAt: -1 })
      .exec();
    res.json(data);
  } catch (error) {
    console.log("Error occurred in /admin-getSellerTransactionList: ", error);
    res.status(500).json({ error: "Some error occured" });
  }
};
