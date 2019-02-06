var mongoose = require('mongoose');
/*
var dbOpties = { 
	dbName: "blockchain",
	reconnectTries: Number.MAX_VALUE
} // dbName moet ivm connectie met +srv voor gebruik met Compass DB

var db = mongoose.connect('mongodb+srv://blockchain_admin_test:12345@cluster0-itq6d.mongodb.net/', dbOpties, function(){
	console.log('Connected via Mongoose');
});
module.exports = db;
*/

var dbOpties = { 
	dbName: "blockchain",
	reconnectTries: Number.MAX_VALUE
} // dbName moet ivm connectie met +srv voor gebruik met Compass DB

var db = mongoose.connect('mongodb://localhost:27017', dbOpties, function(){
	console.log('Connected via Mongoose');
});
module.exports = db;

