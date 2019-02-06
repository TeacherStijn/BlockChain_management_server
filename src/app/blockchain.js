'use strict';

//import {Block} from './block';
var Block = require("./block.js");

//import * as SHA256 from 'crypto-js/sha256';
var SHA256 = require("crypto-js/sha256");

var db = require('./db');

var BlockChainModel = require('./blockchain_db_model');
var TransactieModel = require('./transactie_db_model');
 
class BlockChain {

	constructor(difficulty, chain, currentTransactions, nodes) {
		this.difficulty = 3;
		this.chain = [];
		this.currentTransactions = [];
		this.nodes = [];
	}


	static hash(block) {
		return SHA256('' + block.index + block.previousHash + block.timestamp + JSON.stringify(block.transactions)).toString();
	}
 
 
	static isVerified(chain, that) {
		// Genesis block telt niet mee
		for (let i = 1; i < chain.length; i++)
		{
		  let huidig = chain[i];
		  let vorige = chain[i - 1];

		  // valideer hashcode:
		  if (huidig.hash !== BlockChain.hash(huidig)) {
			console.log("Huidige hash: " + huidig.hash);
			console.log("Opnieuw gehashed: " + BlockChain.hash(huidig));
			console.log("Weer opnieuw gehashed: " + BlockChain.hash(huidig));
			console.log("valideer hashcode gaat mis op i = " + i);
			return false;
		  }

		  // valideer vorige hash op huidige block met vorige block hash:
		  if (huidig.previousHash !== BlockChain.hash(vorige)) {
			console.log("huidig previousHash: " + huidig.previousHash);
			console.log("hash vorige block: " + BlockChain.hash(vorige));
			console.log("huidig hele blok opbouw: " + JSON.stringify(huidig));
			console.log("vorige hele blok opbouw: " + JSON.stringify(vorige));
			console.log("valideer prevHash met hashcode vorige blok gaat mis op i = " + i);
			return false;
		  }
		  
		  if (that.validPow(vorige.pow, huidig.pow) === false){
			console.log("valideer POW gaat mis op i = " + i);
			return false;
		  }
		}

		console.log("Validatie gelukt");
		return true;
	}  

  
  	newPow(vorigePow) {
		// PROOF OF WORK. Je wilt niet dat iedereen 100-en block per seconde kan 'minen'  
		// POW hoort bij de chain, dus we willen geen block specifieke
		// hash toevoegen, maar enkel vorige pow gebruiken	  
		var pow = 0;

		while (this.validPow(vorigePow, pow) === false) {
		  pow += 1;
		}

		return pow;
	}
	
  
	validPow (vorigePow, pow) {
		var tmp = SHA256(vorigePow + ' ' + pow).toString().substring(1,40);

		if (tmp.substring(0, this.difficulty) == '0'.repeat(this.difficulty)) {
		  return true;
		} else {
			console.log("Difficulty: " + this.difficulty);
			console.log("Substr is: " + tmp);
			console.log("Met pow erin van: " + pow);
		  return false;
		}
	}   
	
  
	createGenesisBlock() {
		const genesis = new Block(
			0, 
			new Date().toString(), 
			[
				new TransactieModel({"zender":"Genesis blokje", 
				 "ontvanger":"Genesis blokje",
				 "amount":1 
				})
			], 
			0, 
			0
		);
		
		genesis.hash = BlockChain.hash(genesis);
		console.log('Aangemaakte hash v/d genesis: ' + genesis.hash);
		console.log('Opnieuw berekende hash v/d genesis: ' + BlockChain.hash(genesis));
		return genesis;
	}


	getLatestBlock() {
		return this.chain[this.chain.length-1];
	}

  
	newTransactie(transactie) {
		this.currentTransactions.push(transactie);

		// Geef laatste element uit de transactie array terug:
		return this.currentTransactions[this.currentTransactions.length-1];
	}

  
	newBlock(pow, previousHash = '') {
		// previousHash instellen:
		console.log('De previousHash zoals hij binnenkomt bij de newBlock() methode: ' + previousHash);
		
		const ph = (previousHash == '' ? BlockChain.hash(this.chain[-1]) : previousHash);

		console.log('PreviousHash die gebruikt wordt voor nieuw blok: ' + ph);
		console.log(JSON.stringify(this.currentTransactions));

		const nieuw = new Block(
		  this.chain.length,
		  new Date().toString(),
		  this.currentTransactions,
		  pow,
		  ph
		);

		nieuw.hash = BlockChain.hash(nieuw);	
		return nieuw;
	}

     
	registreerNode(adres) {
		var counter = 0;
		this.nodes.find(function(n){ if (n!=adres) {
			counter++;
			if (counter==1){
				this.nodes.push(adres);
				console.log("Laatst toegevoegde node: " + this.nodes[this.nodes.length-1]);
			}
		}}, this);
	}
  

	verifyChain (pad, that, local_port) {
		let hoogste = that.chain.length;
		let targetChain = [];
		const https = require('http');
		const url = pad+'/chain';
		
		console.log(pad);
		
		https.get(url, res => {
			
		  res.setEncoding("utf8");
		  let body = [];
		  
		  res.on("data", data => {
			body.push(data);
		  });
		  
		  res.on("end", () => {
			  console.log("<Hier kunnen we toekomstig nog code plaatsen>");
		  });
		  
		  res.on("end", () => {
			targetChain = JSON.parse(body);
			
			console.log("Binnen gekregen: " + targetChain + ", met als lengte: " + targetChain.length);
			if (targetChain.length > hoogste && BlockChain.isVerified(targetChain, that)) {
				console.log('Lengte eigen chain: ' + hoogste + ' en lengte targetChain: ' + targetChain.length);
				console.log('Eigen chain wordt bijgewerkt...');
				hoogste = targetChain.length;
				
				BlockChainModel.remove({}).then(function(result){
					console.log("Chain op DB leeg gemaakt");
			
					BlockChainModel.create(targetChain).then(function(result2){
						console.log("Chain op DB toegevoegd");
						that.chain = targetChain;		
						console.log("Lokale chain vervangen");

					}, function(err){
						console.log('Chain op DB toevoegen (en lokale chain vervangen) niet gelukt');
					});
				}, function(err){
					console.log('Chain op DB leegmaken niet gelukt');
				});
					
			} else {
				console.log("Eigen chain is actueel");
			}
		  });
		});
	}
  
	resolveConflict(LOCAL_PORT){				
	
		console.log("Eigen (PORT " + LOCAL_PORT + ") chain lengte:" + this.chain.length);
		
		for (let node of this.nodes) {
			
			if (node.node != 'http://localhost:' + LOCAL_PORT) {	
				
				this.verifyChain(node.node, this, LOCAL_PORT); // local_port geven we mee om bij wijzigen chain naar goede server te connecten (zichzelf)
			}
		}
	}
}

module.exports = BlockChain;
