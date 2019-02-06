"use strict";

var db = require('./db');


/* Express web server instellen */
const express = require('express');
const server = express();


/* Body-parser instellen */
const bodyParser = require('body-parser');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


/* Zorg voor CORS? We moeten vanaf onze Angular server, bij de Node.js Express server kunnen als we andere 'server' gebruiken: */
const cors = require('cors');
server.use(cors());
server.options('*', cors());	// voor nu even helemaal open zetten
/*
var whitelist = ['http://localhost:8001/', 'http://localhost:8003/'];
var corsOpties = {
  origin: function (origin, callback) {
	  console.log(origin + " " + whitelist.indexOf(origin));
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
*/

/* Lokale stuff instellen */
const os = require( 'os' );

var networkInterfaces = os.networkInterfaces( );
const LOCAL_IP = networkInterfaces.enp0s8[0].address;
const LOCAL_PORT = "8001";
const HOST = LOCAL_IP + ':' + LOCAL_PORT + '/';

console.log( "Running on: " + LOCAL_IP );
console.log( "Via port: " + LOCAL_PORT );

var TransactieModel = require('./transactie_db_model');
var NodeModel = require('./node_db_model');

/* vars van de server */
var resultaat;
var nodes = [];
var transacties = [];


/* GET root */
server.get(['/','/index.html'], function(request, response) {
    console.log('Get of /');
	
	response.sendFile(__dirname + '/index.html');
});


/* NODES uitlezen */
server.get('/nodes', function(request, response){
	console.log('GET van /nodes');
	
	response.status(201).send(nodes);
	//response.send(nodes);
});


/* POST van nieuwe NODE registreren */
server.post('/nodes/add', function(request, response) {
	
	console.log('POST van /nodes/add');
	console.log('De request body: ' + request.body.node);
	
	if (request.body.node=='' || request.body.node==null){
		console.log('Geef een valide lijst met nodes door');
		//response.status(200).send({ "status": "Geef een valide lijst met nodes door"});
	} else {
		// Toekomstig: meerdere nodes via lijst die binnenkomt registreren
		
		NodeModel.find({ "node": request.body.node }).then(function(gevonden){	
		
			NodeModel.count({}).then(function(aantalNodes){
				
				console.log('Match gevonden (bestaande node registratie)? 0 = nee, 1 = ja: ' + aantalNodes);
				
				if (aantalNodes==0){
		
					// Nieuwe node toevoegen					
					NodeModel.create(request.body).then(function(result){
						nodes.push(result);
						console.log('Node geregistreerd: ' + nodes[nodes.length-1]);
					}, function(err){
						console.log('Registratie nieuwe node niet gelukt');
					});	
					
				} else {
					console.log("Deze node is al eens toegevoegd");
				}		
			
				response.status(201).send(nodes);
				
			}, function(err){
				console.log('Check of node bestaat niet gelukt');
			});
		}, function(err){
			console.log('Ophalen nodes niet gelukt');
		});		
	}	
});




/* GET openstaande TRANSACTIES */
server.get('/transacties', function(request, response) {
	console.log('GET van /transacties/');
	
	TransactieModel.find({}).then(function(result){
		console.log("Collectie opgehaald");
		resultaat = result;
		console.log("Transacties: " + JSON.stringify(resultaat));		
		response.status(201).send(resultaat);
	}, function(err){
		console.log('Ophalen transacties niet gelukt');
	});
});


/* POST nieuwe TRANSACTIE */
server.post('/transacties/nieuw', function(request, response) {
	
	console.log('POST van /transacties/nieuw');
	let transactie = new TransactieModel({ 
		zender: request.body.zender,
		ontvanger: request.body.ontvanger,
		amount: request.body.amount
	});
	
	TransactieModel.create(selectedChain.newTransactie(transactie)).then(function(result){
		let latestTransactie = selectedChain.currentTransactions[selectedChain.currentTransactions.length-1];
		console.log("Transactie toegevoegd met waarden: " + JSON.stringify(latestTransactie));
		//response.status(201).send(latestTransactie);		
	}, function(err){
		console.log('Transactie toevoegen niet gelukt');
	});
});


/* Webserver starten */
server.listen(LOCAL_PORT, function() {
    console.log('Server started!');
	console.log("Verbonden aan management server");
	
	// Inladen nodes:
	NodeModel.find({ "node": request.body.node }).then(function(gevonden){	
		console.log("nodes opgehaald");	
		nodes = gevonden;
	}, function(err){
		console.log('Ophalen nodes niet gelukt');
	});			
	
	
	// Inladen recente transacties:
	TransactieModel.find({}).then(function(gevonden){
		console.log("transacties opgehaald");
		transacties = gevonden;
		console.log("Transacties: " + JSON.stringify(transacties));		
		response.status(201).send(transacties);
	}, function(err){
		console.log('Ophalen transacties niet gelukt');
	});
});
