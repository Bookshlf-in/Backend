const mongoose = require("mongoose");
const Users = require("../models/users");
const Addresses = require("../models/addresses");
const Orders = require("../models/orders");

exports.getUserList = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const noOfUsersInOnePage = Number(req.query.noOfUsersInOnePage) || 10;
    if (page < 1) {
      return res.status(400).json({ error: "page value should be positive" });
    }
    if (noOfUsersInOnePage < 1) {
      return res
        .status(400)
        .json({ error: "noOfUsersInOnePage should be positive" });
    }
    const userCount = await Users.countDocuments();
    const userList = await Users.find()
      .skip((page - 1) * noOfUsersInOnePage)
      .limit(noOfUsersInOnePage);
    const data = userList.map((user) => {
      user.salt = undefined;
      user.encryPassword = undefined;
      return user;
    });
    return res.json({
      totalPages: Math.ceil(userCount / noOfUsersInOnePage),
      data,
    });
  } catch (error) {
    console.log("Error occurred in /admin-getUserList ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const email = req.query?.email;
    const userId = req.query?.userId;
    let findObj = {};
    if (email) {
      findObj = { email };
    } else if (userId && mongoose.isValidObjectId(userId)) {
      findObj = { _id: userId };
    } else {
      return res.status(400).json({ error: "Email or userId required" });
    }
    const user = await Users.findOne(findObj).select({
      salt: 0,
      encryPassword: 0,
    });
    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }
    res.json(user);
  } catch (error) {
    console.log("Error occurred in /admin-getUserProfile ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.getUserAddressList = async (req, res) => {
  try {
    const userId = req.query?.userId;
    const user = await Users.findOne({ _id: userId }).select({ _id: 1 });
    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }
    const addressList = await Addresses.find({ userId });
    res.json(addressList);
  } catch (error) {
    console.log("Error occurred in /admin-getUserAddressList ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.getUserOrderList = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const noOfOrdersInOnePage = Number(req.query.noOfOrdersInOnePage) || 10;
    if (page < 1) {
      return res.status(400).json({ error: "page value should be positive" });
    }
    if (noOfOrdersInOnePage < 1) {
      return res
        .status(400)
        .json({ error: "noOfOrdersInOnePage should be positive" });
    }
    const userId = req.query?.userId;
    const user = await Users.findOne({ _id: userId }).select({ _id: 1 });
    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }
    const orderCount = await Orders.countDocuments({ customerId: userId });
    const orderList = await Orders.find({ customerId: userId });
    return res.json({
      totalPages: Math.ceil(orderCount / noOfOrdersInOnePage),
      data: orderList,
    });
  } catch (error) {
    console.log("Error occurred in /admin-getUserOrderList ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
