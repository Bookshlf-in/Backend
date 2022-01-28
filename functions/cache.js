const LRU = require("lru-cache");

const maxAge = 1000 * 60 * 60 * 6; // 6 hours

const websiteReviewCache = new LRU({ max: 1, maxAge: maxAge });
const searchTitleCache = new LRU({ max: 1000, maxAge: maxAge });

module.exports = { websiteReviewCache, searchTitleCache };
