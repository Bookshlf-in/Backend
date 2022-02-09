exports.getShippingCharge = (price) => {
  if (price < 999) return 29;
  return 0;
};
