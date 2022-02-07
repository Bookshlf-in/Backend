exports.getShippingCharge = (price) => {
  if (price < 999) return 19;
  return 0;
};
