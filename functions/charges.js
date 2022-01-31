exports.getShippingCharge = (price) => {
  if (price < 500) return 19;
  return 0;
};
