const LRU = require("lru-cache");

const maxAge = 1000 * 60 * 60 * 24; // refresh every day

const websiteReviewCache = new LRU({ max: 1, maxAge: maxAge });

module.exports = { websiteReviewCache };
