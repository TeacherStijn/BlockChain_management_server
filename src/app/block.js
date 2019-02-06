"use strict";

class Block {

  constructor (index, timestamp, transactions, pow, previousHash = '', hash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.pow = pow;
    this.previousHash = previousHash;
	this.hash = hash;
  }

  toJSON() {
    return {
      "index": this.index,
      "timestamp": this.timestamp,
      "transactions": this.transactions,
      "pow": this.pow,
      "previousHash": this.previousHash,
	  "hash": this.hash
    };
  }
}

module.exports = Block;
