const Orders = require("../models/orders");
const SellerProfiles = require("../models/sellerProfiles");

exports.getOrderList = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const noOfOrdersInOnePage = Number(req.query.noOfOrdersInOnePage) || 10;
    const active = Boolean(req.query.active) || false;
    if (page < 1) {
      return res.status(400).json({ error: "page value should be positive" });
    }
    if (noOfOrdersInOnePage < 1) {
      return res
        .status(400)
        .json({ error: "noOfOrdersInOnePage should be positive" });
    }
    let findObj = {};
    if (active) {
      findObj = { progress: { $ne: 100 } };
    }
    const orderCount = await Orders.countDocuments(findObj);
    const orderList = await Orders.find(findObj)
      .sort({ createdAt: -1 })
      .skip((page - 1) * noOfOrdersInOnePage)
      .limit(noOfOrdersInOnePage)
      .exec();

    return res.json({
      totalPages: Math.ceil(orderCount / noOfOrdersInOnePage),
      data: orderList,
    });
  } catch (error) {
    console.log("Error in /admin-getOrderList ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.query?.orderId;
    const order = await Orders.findOne({ _id: orderId });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    res.json(order);
  } catch (error) {
    console.log("Error in /admin-getOrderDetails ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Orders.findOne({ _id: orderId }).select({ _id: 1 });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    const updatedOrder = await Orders.updateOne({ _id: orderId }, req.body);
    if (updatedOrder.nModified !== 1) {
      return res.status(500).json({ error: "Failed to update order" });
    }
    res.json({ msg: "Order updated" });
  } catch (error) {
    console.log("Error in /admin-updateOrder ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.changeOrderProgress = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const progress = req.body.progress;
    const order = await Orders.findOne({ _id: orderId }).select({ _id: 1 });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    const updatedOrder = await Orders.updateOne({ _id: orderId }, { progress });
    if (updatedOrder.nModified !== 1) {
      return res.status(500).json({ error: "Failed to change progress" });
    }
    res.json({ msg: "Order progress updated" });
  } catch (error) {
    console.log("Error in /admin-changeOrderProgress ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.addOrderStatus = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const status = req.body.status;
    const order = await Orders.findOne({ _id: orderId }).select({
      _id: 1,
      status: 1,
    });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    if (order.status?.slice(-1)[0] == status) {
      return res
        .status(400)
        .json({ error: `Order's last status is already ${status}` });
    }
    const updatedOrder = await Orders.updateOne(
      { _id: orderId },
      { $push: { status: status } }
    );
    if (updatedOrder.nModified !== 1) {
      return res.status(500).json({ error: "Failed to update order" });
    }
    res.json({ msg: "Order updated" });
  } catch (error) {
    console.log("Error in /admin-addOrderStatus ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.markOrderAsPacked = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Orders.findOne({ _id: orderId }).select({
      _id: 1,
      status: 1,
    });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    if (order.status?.slice(-1)[0] == "Packed") {
      return res.status(400).json({ error: "Order already marked as packed" });
    }
    const updatedOrder = await Orders.updateOne(
      { _id: orderId },
      { progress: 25, $push: { status: "Packed" } }
    );
    if (updatedOrder.nModified !== 1) {
      return res.status(500).json({ error: "Failed to mark as packed" });
    }
    res.json({ msg: "Order updated" });
  } catch (error) {
    console.log("Error in /admin-markOrderAsPacked ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.markOrderAsShipped = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Orders.findOne({ _id: orderId }).select({
      _id: 1,
      status: 1,
    });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    if (order.status?.slice(-1)[0] == "Shipped") {
      return res.status(400).json({ error: "Order already marked as shipped" });
    }
    const updatedOrder = await Orders.updateOne(
      { _id: orderId },
      { progress: 50, $push: { status: "Shipped" } }
    );
    if (updatedOrder.nModified !== 1) {
      return res.status(500).json({ error: "Failed to mark as shipped" });
    }
    res.json({ msg: "Order updated" });
  } catch (error) {
    console.log("Error in /admin-markOrderAsShipped ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.markOrderAsCompleted = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Orders.findOne({ _id: orderId }).select({
      _id: 1,
      status: 1,
      sellerId: 1,
    });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    if (order.status?.slice(-1)[0] == "Delivered") {
      return res
        .status(400)
        .json({ error: "Order already marked as delivered" });
    }
    const updatedOrder = await Orders.updateOne(
      { _id: orderId },
      { paymentStatus: "Paid", progress: 100, $push: { status: "Delivered" } }
    );
    if (updatedOrder.nModified !== 1) {
      return res.status(500).json({ error: "Failed to mark as delivered" });
    }
    await SellerProfiles.updateOne(
      { _id: order.sellerId },
      { $inc: { noOfBooksSold: 1 } }
    );
    res.json({ msg: "Order updated" });
  } catch (error) {
    console.log("Error in /admin-markOrderAsCompleted ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.markOrderAsCancelled = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Orders.findOne({ _id: orderId }).select({
      _id: 1,
      status: 1,
    });
    if (!order) {
      return res.status(400).json({ error: "Order does not exist" });
    }
    if (order.status?.slice(-1)[0] == "Cancelled") {
      return res
        .status(400)
        .json({ error: "Order already marked as cancelled" });
    }
    const updatedOrder = await Orders.updateOne(
      { _id: orderId },
      { progress: 100, $push: { status: "Cancelled" } }
    );
    if (updatedOrder.nModified !== 1) {
      return res.status(500).json({ error: "Failed to mark as cancelled" });
    }
    res.json({ msg: "Order updated" });
  } catch (error) {
    console.log("Error in /admin-cancelOrder ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
