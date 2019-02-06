var db = require('./db');
var mongoose = require('mongoose');

// Definieer een validatieschema:
var NodeSchema = new mongoose.Schema({
	node: { type: String }
}, { collection: 'nodes', versionKey: false });

// Modelleer de collectie op basis van het validatieschema:
var NodeModel = mongoose.model('nodes', NodeSchema);

module.exports = NodeModel;