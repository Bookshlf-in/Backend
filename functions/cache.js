const LRU = require("lru-cache");

const ttl = 1000 * 60 * 60 * 6; // 6 hours

const websiteReviewCache = new LRU({ max: 1, ttl: ttl });
const searchTitleCache = new LRU({ max: 500, ttl: ttl });
const searchTagCache = new LRU({ max: 250, ttl: ttl });

module.exports = { websiteReviewCache, searchTitleCache, searchTagCache };
