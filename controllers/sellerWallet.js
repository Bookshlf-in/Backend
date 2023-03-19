const SellerProfiles = require("../models/sellerProfiles");
const SellerTransactions = require("../models/sellerTransactions");
const WithdrawRequests = require("../models/withdrawRequests");

exports.getCurrentBalance = async (req, res) => {
  try {
    const sellerId = req.auth.sellerId;
    const sellerProfile = await SellerProfiles.findOne({ _id: sellerId })
      .select({
        walletBalance: 1,
      })
      .exec();
    if (!sellerProfile) {
      return res.status(400).json({ error: "Seller does not exist" });
    }
    const walletBalance = sellerProfile.walletBalance || 0;
    res.json({ walletBalance });
  } catch (error) {
    console.log("Error occurred in getCurrentBalance: ", error);
    res.status(500).json({ error: "Some error occured" });
  }
};

exports.withdrawFromWallet = async (req, res) => {
  try {
    const sellerId = req.auth.sellerId;
    const { amount, bankAccountDetails } = req.body;
    const sellerProfile = await SellerProfiles.findOne({ _id: sellerId })
      .select({
        walletBalance: 1,
      })
      .exec();
    if (!sellerProfile) {
      return res.status(400).json({ error: "Seller does not exist" });
    }
    const walletBalance = sellerProfile.walletBalance;
    if (amount > walletBalance) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    const withdrawRequest = new WithdrawRequests({
      sellerId,
      amount,
      bankAccountDetails,
      status: "INITIATED",
    });
    const newWithdrawRequest = await withdrawRequest.save();

    res.json({ msg: "Withdraw request initiated", ...newWithdrawRequest._doc });
  } catch (error) {
    console.log("Error occurred in /withdrawFromWallet: ", error);
    res.status(500).json({ error: "Some error occured" });
  }
};

exports.getWithdrawRequests = async (req, res) => {
  try {
    const sellerId = req.auth.sellerId;
    let findObj = { sellerId };
    if (req.query.status) findObj.status = req.query.status;

    const data = await WithdrawRequests.find(findObj)
      .sort({ createdAt: -1 })
      .exec();
    res.json(data);
  } catch (error) {
    console.log("Error occurred in /getWithdrawRequests: ", error);
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

    const query = WithdrawRequests.updateOne(
      { _id: requestId },
      { status: "CANCELLED" }
    );
    await query.exec((error, withdrawRequest) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "Failed to update withdraw request" });
      }
      res.json({ msg: "Withdraw request cancelled" });
    });
  } catch (error) {
    console.log("Error occurred in /cancelWithdrawRequests: ", error);
    res.status(500).json({ error: "Some error occured" });
  }
};

exports.getTransactionList = async (req, res) => {
  try {
    const sellerId = req.auth.sellerId;
    const data = await SellerTransactions.find({ sellerId })
      .sort({ createdAt: -1 })
      .exec();
    res.json(data);
  } catch (error) {
    console.log("Error occurred in /getTransactionList: ", error);
    res.status(500).json({ error: "Some error occured" });
  }
};
