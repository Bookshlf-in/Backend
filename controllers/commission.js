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
        .json({ error: "Price cannot be smaller than 100" });
    }
    const commissionChart = await Commissions.find().sort({ priceLimit: 1 });
    let fixedCommission = 0;
    let percentCommission = 0;
    for (let i = 0; i < commissionChart.length; i++) {
      const obj = commissionChart[i];
      fixedCommission = obj.fixedCommission;
      percentCommission = obj.percentCommission;
      if (obj.priceLimit >= price) {
        break;
      }
    }
    const sellerEarning =
      ((price - fixedCommission) * (100 - percentCommission)) / 100;

    res.json({
      sellerEarning,
    });
  } catch (error) {
    console.log("Error in /getSellerEarning ", error);
    res.status(500).json({ error: "Some error occurred" });
  }
};
