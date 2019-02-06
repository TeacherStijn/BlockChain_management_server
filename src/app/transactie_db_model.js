var db = require('./db');
var mongoose = require('mongoose');

// Definieer een validatieschema:
var TransactieSchema = new mongoose.Schema({	
	zender: { type: String },
	ontvanger: { type: String },
	amount: { type: Number }
}, { collection: 'transacties', versionKey: false  });

// Modelleer de collectie op basis van het validatieschema:
var TransactieModel = mongoose.model('transacties', TransactieSchema);

module.exports = TransactieModel;