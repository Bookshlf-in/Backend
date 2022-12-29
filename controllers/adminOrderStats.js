const Orders = require("../models/orders");

exports.getMonthOrderStats = async (req, res) => {
  try {
    const month = Number(req.query.month) - 1;
    const year = Number(req.query.year);
    const startDate = new Date(0);
    const endDate = new Date(0);
    startDate.setFullYear(year, month, 1);
    endDate.setFullYear(year, month + 1, 1);
    const orders = await Orders.find({
      createdAt: { $gte: startDate, $lt: endDate },
    });
    let stats = {
      totalOrders: 0,
      placed: 0,
      cancelled: 0,
      confirmed: 0,
      packed: 0,
      shipped: 0,
      delivered: 0,
      RTO: 0,
      returned: 0,
      lost: 0,
      unknown: 0,
      RTOLoss: 0,
      DeliveredProfit: 0,
      expectedRevenue: 0,
      expectedProfit: 0,
      totalRevenue: 0,
      totalProfit: 0,
    };
    await Promise.all(
      orders.map(async (order) => {
        stats.totalOrders++;
        const orderStatus = order.status.at(-1);
        order.adminDeliveryExpense ||= 0;
        switch (orderStatus) {
          case "Order placed":
            stats.placed++;
            stats.expectedRevenue += order.orderTotal;
            stats.expectedProfit +=
              order.orderTotal - order.adminDeliveryExpense - order.price * 0.6;
            break;
          case "Order Confirmed":
            stats.confirmed++;
            stats.expectedRevenue += order.orderTotal;
            stats.expectedProfit +=
              order.orderTotal - order.adminDeliveryExpense - order.price * 0.6;
            break;
          case "Packed":
            stats.packed++;
            stats.expectedRevenue += order.orderTotal;
            stats.expectedProfit +=
              order.orderTotal - order.adminDeliveryExpense - order.price * 0.6;
            break;
          case "Shipped":
            stats.shipped++;
            stats.expectedRevenue += order.orderTotal;
            stats.expectedProfit +=
              order.orderTotal - order.adminDeliveryExpense - order.price * 0.6;
            break;
          case "Delivered":
            stats.delivered++;
            stats.expectedRevenue += order.orderTotal;
            stats.expectedProfit +=
              order.orderTotal - order.adminDeliveryExpense - order.price * 0.6;
            stats.totalRevenue += order.orderTotal;
            stats.totalProfit +=
              order.orderTotal - order.adminDeliveryExpense - order.price * 0.6;
            stats.DeliveredProfit +=
              order.orderTotal - order.adminDeliveryExpense - order.price * 0.6;
            break;
          case "RTO":
            stats.RTO++;
            stats.RTOLoss += order.adminDeliveryExpense;
            stats.totalProfit -= order.adminDeliveryExpense;
            break;
          case "Returned":
            stats.returned++;
            stats.RTOLoss += order.adminDeliveryExpense;
            stats.totalProfit -= order.adminDeliveryExpense;
            break;
          case "Cancelled":
            stats.cancelled++;
            break;
          case "Lost":
            stats.lost++;
            stats.expectedRevenue += order.orderTotal;
            stats.expectedProfit +=
              order.orderTotal - order.adminDeliveryExpense - order.price * 0.6;
            stats.totalRevenue += order.orderTotal;
            stats.totalProfit +=
              order.orderTotal - order.adminDeliveryExpense - order.price * 0.6;
            break;
          default:
            stats.unknown++;
            console.log(order._id);
        }
      })
    );
    res.json(stats);
  } catch (error) {
    console.log("Error in /admin-getMonthOrderStats ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
