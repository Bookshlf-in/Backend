const Commissions = require("../models/commissions");

exports.getCommissionChart = async (req, res) => {
  try {
    const commissionChart = await Commissions.find().sort({ priceLimit: 1 });
    res.json(commissionChart);
  } catch (error) {
    console.log("Error in /getCommissionChart ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};

exports.getSellerEarning = async (req, res) => {
  try {
    const price = req.query.price;
    if (price < 100) {
      return res
        .status(400)
        .json({ error: "Price should be greater than or equal to 100" });
    }
    const commissionChart = await Commissions.find().sort({ priceLimit: 1 });
    let fixedCommission = 0;
    let percentCommission = 0;
    for (let i = 0; i < commissionChart.length; i++) {
      const obj = commissionChart[i];
      console.log(obj);
      fixedCommission = obj.fixedCommission;
      percentCommission = obj.percentCommission;
      if (obj.priceLimit >= price) {
        break;
      }
    }
    res.json({
      fixedCommission,
      percentCommission,
    });
  } catch (error) {
    console.log("Error in /getCommissionChart ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
