var db = require('./db');
var mongoose = require('mongoose');
var transactie = require('./transactie_db_model');

// Definieer een validatieschema:
var BlockChainSchema = new mongoose.Schema({
	index: { type: Number },
	timestamp: { type: String },
	
	/* om te populaten (vullen) vanuit andere doc zou het volgende mooi zijn, maar werkt niet goed ivm legen v/d transactielijst
	   voor maken block en kan als 'exec' pas na opzoeken block gedaan worden (er is dan nog geen block...) */
	//transactions: [{ type: mongoose.Schema.ObjectId, ref: 'transacties' }],		
	transactions: [
		{
			zender: { type: String },
			ontvanger: { type: String },
			amount: { type: Number }
		}
	],
	pow: { type: Number },
	previousHash: { type: String },
	hash: { type: String }
}, { collection: 'chain', versionKey: false  });

// Modelleer de collectie op basis van het validatieschema:
var BlockChainModel = mongoose.model('chain', BlockChainSchema);

module.exports = BlockChainModel;