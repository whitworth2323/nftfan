//Hedera, Hashconnect, Firebase and Axios imports
require("dotenv").config();
import { Client, Hbar, HbarUnit, TokenAssociateTransaction, TransactionReceipt, TransferTransaction, TransactionId, AccountId, PrivateKey, TokenSupplyType } from '@hashgraph/sdk';
import { HashConnect } from 'hashconnect';
import { initializeApp } from 'firebase/app';
const axios = require('axios');
import { doc, addDoc, getFirestore, collection, getDocs, setDoc, Timestamp } from "firebase/firestore";
import { Account, ApiSession, Contract, Token, TokenTypes } from '@buidlerlabs/hedera-strato-js';

//Firebase config
const functions = require("firebase-functions");
const admin = require("firebase-admin");
var serviceAccount = require("./nft-fan-firebase-adminsdk-1rgug-87ce887a7d.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const firestore = admin.firestore();
firestore.settings({ timestampsInSnapshots: true, ignoreUndefinedProperties: true });

//Node config
const express = require('express');
const cors = require('cors');
const request = require('request');
const app = express();
const bodyParser = require('body-parser')

//Server and Hashconnect start
const port = process.env.port || 3333;
let hashconnect = new HashConnect();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }))


//variables that manage which account is paid into by Users of the App
const toAccTestnet    = process.env.TO_ACCOUNT;
const toAccountMainnet = process.env.TO_ACCOUNT_M;

//setting Owner's wallet as Client (for sending transactions, NFTs, and royalties)
const myAccountIdTestnet = process.env.MY_ACCOUNT_ID;
const myPrivateKeyTestnet = process.env.MY_PRIVATE_KEY;
const auroraAccountIdTestnet = process.env.AURORA_ID;

const myAccountIdMainnet = process.env.MY_ACCOUNT_ID_M;
const myPrivateKeyMainnet = process.env.MY_PRIVATE_KEY_M;
const auroraAccountIdMainnet = process.env.AURORA_ID_M;

//initial client for Hedera operations
let client = Client.forTestnet();
client.setOperator(myAccountIdTestnet, myPrivateKeyTestnet);


// Handle GET requests to / route (Base test route)
app.get('/', async (req, res) => {
  
    return res.status(200).send({ success: true});
});
const kPurchase1Token = ".tokens.1";
const kPurchase4Token = ".tokens.4";
const kAppleIAPService = "Hbar";
const kAndroidIAPService = "android-iap";

//Get the HashConnect Pairing Code
app.get("/getPairKey/:memberID/:hederaNetwork", async (req, res) => {
  try {
    const appMetadata = {
      name: "NFT Fan",
      description: "Fan Club for Hedera",
      icon: "https://firebasestorage.googleapis.com/v0/b/nft-fan.appspot.com/o/Files%2F1024.svg?alt=media&token=dc2fbbd0-98f2-4110-9e05-01529db42937",
      url: "https://nftfan.host/"
    }
    var memberID = req.params.memberID;
    var hederaNetwork = req.params.hederaNetwork;

    let initData = await hashconnect.init(appMetadata);
    let privKey = initData.privKey;
    let state = await hashconnect.connect();
    let pairingString = await hashconnect.generatePairingString(state, hederaNetwork, true);
    let pairedStatus = await hashconnect.pairingEvent.once(async (data) => {
      console.log('Paired', data);
    
      const docRef = {
        accountIds: data.accountIds,
        network: data.network,
        responseID: data.id,
        topic: data.topic,
        userID: memberID,
        metadata: data.metadata,
      };
      admin.firestore().collection('walletresponses').add(docRef);

    });

    const data = {
      privKey: privKey,
      pairingString: pairingString,
      topic: state.topic,
      status: pairedStatus,
    };
    return res.status(200).send({ success: true, data: data });
  } catch (error) {
    return res.status(400).send({ success: false, message: error.message });
  }
});

//Send HBAR transaction for Comm Tokens
app.post("/sendTransaction", async (req, res) => {
  
  const appMetadata = {
    name: "NFT Fan",
    description: "Fan Club for Hedera Aurora Project",
    icon: "https://firebasestorage.googleapis.com/v0/b/nft-fan.appspot.com/o/Files%2F1024.svg?alt=media&token=dc2fbbd0-98f2-4110-9e05-01529db42937",
    url: "https://nftfan.host/"
  }
  const network = req.body.network;
  const memberID = req.body.memberID;
  const from = req.body.from;
  const topic = req.body.topic;
  const walletmetadata = req.body.metadata;
  const amount = req.body.amount;
  const memo = req.body.memo;
  const tokenAmount = req.body.tokenAmount;
  const initData = await hashconnect.init(appMetadata);
  const state = await hashconnect.connect(topic, walletmetadata);
  const trans = new TransferTransaction().setTransactionMemo(memo);

  console.log("Walletmetadata: ", walletmetadata);

  const dataTransfer = {
    transfer: {
      include_hbar: true,
      to_hbar_amount: amount,
      from_hbar_amount: -amount,
      toAcc: network == 'testnet' ? toAccTestnet : toAccountMainnet,
      include_token: false,
      return_transaction: false,
    },
  }
  trans.addHbarTransfer(dataTransfer.transfer.toAcc, Hbar.from(dataTransfer.transfer.to_hbar_amount, HbarUnit.Hbar)).addHbarTransfer(from, Hbar.from(dataTransfer.transfer.from_hbar_amount, HbarUnit.Hbar))
  const acctToSign = from;
  const transactionBytes = await makeBytes(trans, acctToSign);
  const transaction = {
    topic: topic,
    byteArray: transactionBytes,
    metadata: {
      accountToSign: acctToSign,
      returnTransaction: false
    }
  };
  const response = await hashconnect.sendTransaction(topic, transaction);
  if (response != null) {
    try {

      //console.Log("response: ", response);
      if (response.success === true) {

        // transaction Completed
        const topic = response.topic;
        const success = response.success;
        const receipt = response.receipt;
        const id = response.id;

        //save result in Firebase for the Mobile App to get notified
        const docRef = {
          topic: topic,
          network: network,
          responseID: id,
          response: success,
          userID: memberID,
          metadata: walletmetadata,
          HBARamount: amount,
          tokenAmount: tokenAmount,
          msg: "TRANSACTION COMPLETED"
        };

        admin.firestore().collection('transactionresponses').add(docRef);


        //Add Comm Tokens to the User's balance
        //creditTokens(memberID,amount,tokenAmount);
        createBilling(memberID, amount, tokenAmount);
        return res.status(200).send({ success: true, data: { msg: "TRANSACTION COMPLETED", topic: topic, success: success, receipt: receipt, id: id } });
      } else {
        // transaction failed
        const topic = response.topic;
        const success = response.success;
        const error = response.error;
        const id = response.id;

        const docRef = {
          topic: topic,
          network: network,
          responseID: id,
          response: success,
          userID: memberID,
          metadata: walletmetadata,
          HBARamount: amount,
          tokenAmount: tokenAmount,
          msg: "TRANSACTION FAILED"
        };

        admin.firestore().collection('transactionresponses').add(docRef);

        return res.status(200).send({ success: true, data: { msg: "TRANSACTION FAILED", topic: topic, success: success, error: error, id: id } });
      }
    } catch (error) {

      const topic = response.topic;
      const success = response.success;
      const id = response.id;

      const docRef = {
        topic: topic,
        network: network,
        responseID: id,
        response: success,
        userID: memberID,
        metadata: walletmetadata,
        msg: error.message
      };

      admin.firestore().collection('transactionresponses').add(docRef);

      return res.status(400).send({ success: false, message: error.message });
    }
  }
  
});

//Start Server
app.listen(port, () => {
  console.log('Server is up on port ' + port)
});

//initial QR verficiation function (for verifying subNFTs)
app.post("/getMetadata", async (req, res) => {
  try {
    const qr = req.body.qr;
    const pairedWallets = req.body.pairedWallets;
    const network = req.body.network;
    const tokenID = qr.tokenID;
    const serialNumber = qr.serial;

    let data;
    let rawTokendata;

    if (network === "testnet") {


      data = await axios.get(`https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenID}/nfts/${serialNumber}`);
      rawTokendata = await axios.get(`https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenID}`);
    }
    else if (network === "mainnet") {

      data = await axios.get(`https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${tokenID}/nfts/${serialNumber}`);
      rawTokendata = await axios.get(`https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${tokenID}`);

    }


    //console.log("pulled tokenData: ", rawTokendata);
    //console.log("pulled subNFT Data: ", data);

    const tokenData = {
      name: rawTokendata.data.name,
      symbol: rawTokendata.data.symbol,
      supplyType: rawTokendata.data.supply_type,
      type: rawTokendata.data.type,
      total_supply: rawTokendata.data.total_supply,
      tokenID: rawTokendata.data.token_id,
      created_timestamp: rawTokendata.data.created_timestamp,
    };

    //console.log("tokenData: ", tokenData);

    // Hedera strato repo storing metadata URL in encoded base64 so we have to first decode it 
    const decodedBase6String = Buffer.from(data.data.metadata, 'base64').toString('ascii')
    const metadata = await axios.get(decodedBase6String) // fetch metadata from IPFS
    const operatorKey = PrivateKey.fromString(qr.privateKey);
    const PB_KEY = operatorKey.publicKey.toStringDer()

    // console.log("metadata: ", metadata);

    //if we've found any metadata of a real NFT
    if (PB_KEY === metadata.data.publicKey, metadata.data) {

      let dragonGlassLinkAccount = "https://testnet.dragonglass.me/hedera/accounts/" + qr.accountID;
      let dragonGlassTokenAccount = "https://testnet.dragonglass.me/hedera/tokens/" + qr.tokenID;
      if (network === "testnet") {
        dragonGlassLinkAccount = "https://testnet.dragonglass.me/hedera/accounts/" + qr.accountID;
        dragonGlassTokenAccount = "https://testnet.dragonglass.me/hedera/tokens/" + qr.tokenID;
        //console.log("DragonGlass link for Account: ", dragonGlassLinkAccount)
      }
      else if (network === "mainnet") {
        dragonGlassLinkAccount = "https://app.dragonglass.me/hedera/accounts/" + qr.accountID;
        dragonGlassTokenAccount = "https://app.dragonglass.me/hedera/tokens/" + qr.tokenID;
        //console.log("DragonGlass link for Account: ", dragonGlassLinkAccount)
      }
      else {
        dragonGlassLinkAccount = "https://" + network + "/hedera/accounts/" + qr.accountID;
        dragonGlassTokenAccount = "https://" + network + "/hedera/tokens/" + qr.tokenID;
        //console.log("DragonGlass link for Account: ", dragonGlassLinkAccount)
      }

      console.log("Owner of the subNFT: ", data.data.account_id);
      const ownerOfTheSubNFT = data.data.account_id;

      let foundInPairedWallet = false;
      let foundPairedWalletID = "0.0.0000000";

      if (pairedWallets.includes(ownerOfTheSubNFT)) {
        foundInPairedWallet = true;
        foundPairedWalletID = ownerOfTheSubNFT;
      }
      else {
        foundInPairedWallet = false;
        foundPairedWalletID = "0.0.0000000";
      }


      return res.status(200).send({ success: true, data: { metadata: metadata.data, dragonGlassAccount: dragonGlassLinkAccount, dragonGlassToken: dragonGlassTokenAccount, foundInAPairedWallet: foundInPairedWallet, ownerOfSubNFT: ownerOfTheSubNFT, tokenData: tokenData } });


    } //could be invalid QR code or any minted NFT without our metadata
    else {
      return res.status(400).send({ success: false, message: "Your scanned QR Code did not return a valid subNFT Item." });
    }


  } catch (error) {
    return res.status(400).send({ success: false, message: error.message });
  }
});

//Launch Initial Smart Contract for Minting subNFTs and paying Royalties
app.post("/launchContract", async (req, res) => {
  try {

    const name = req.body.name;
    const symbol = req.body.symbol;
    // const maxsupply = req.body.maxSupply;


    const nftPriceInHbar = new Hbar(1);
    // const amountToMint = 1;


    const defaultNonFungibleTokenFeatures = {
      decimals: 0,
      initialSupply: 0,
      keys: {
        kyc: null
      },
      maxSupply: 1000,
      name: name,
      supplyType: TokenSupplyType.Finite,
      symbol: symbol,
      type: TokenTypes.NonFungibleUnique,
    };
    console.log(defaultNonFungibleTokenFeatures)


    // Initialize the session
    const { session } = await ApiSession.default();

    // Create the CreatableEntities and the UploadableEntities

    const token = new Token(defaultNonFungibleTokenFeatures);

    const contract = await Contract.newFrom({ path: 'NFTShop.sol' });

    const liveToken = await session.create(token);

    const liveContract = await session.upload(
      contract,
      { _contract: { gas: 200_000 } },
      liveToken,
      session,
      nftPriceInHbar._valueInTinybar

    );

    // Assign supply control of the token to the live contract
    liveToken.assignSupplyControlTo(liveContract);

    const contractInfo = await liveContract.getLiveEntityInfo();

    // console.log(`HBar balance of contract: ${contractInfo.balance.toBigNumber().toNumber()}`);
    const livetokenInfo = await liveToken.getLiveEntityInfo();

    const contractID = await liveContract.id.toString();
    const tokenID = await liveToken.id.toString();

    const abi = contract.interface;

    const docRef = {
      contractID: contractID,
      tokenID: tokenID,
      // abi:JSON.parse(JSON.stringify(abi)),
      msg: "LIVE CONTRACT DEPLOYED SUCCESSFULLY"
    };
    admin.firestore().collection('livecontracts').add(docRef);

    const data = {
      contractID: contractID,
      tokenID: tokenID
    }

    return res.status(200).send({ success: true, message: "LIVE CONTRACT DEPLOYED SUCCESSFULLY", data: data });

  }

  catch (error) {
    return res.status(400).send({ success: false, message: error.message });
  }
});

//Minting subNFTs on a live contract
app.post("/mintNFT", async (req, res) => { 
    try{

      const contractId = req.body.contractID;
      const toAccount = req.body.toaccount;
      const toPrivateKey = req.body.privatekey;
      const amountToMint = req.body.amountmint;
      const metadata = req.body.metadata;
      const network = req.body.network;

      let contractData;
      const ans = await admin.firestore().collection('livecontracts').where('contractID','==',contractId)
      .get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
            contractData = doc.data();             
          })
      })
      .catch(err => console.log(err.message))
      
      let accId = AccountId.fromString(toAccount);
      let singsKey = PrivateKey.fromString(toPrivateKey);
      let toMintAccount = AccountId.fromString(toAccount).toSolidityAddress();
      
      //we will always mint new subNFTs as 1 HBAR
      const nftPriceInHbar = new Hbar(1);
              
      // const account = new Account({ maxAutomaticTokenAssociations: 10});
      
      // Initialize the session
      const { session } = await ApiSession.default();
      const contract = await Contract.newFrom({ path: 'NFTShop.sol' });  
      const liveContract = await session.getLiveContract({ id:contractData.contractID , abi: contract.interface});
      
      
      let operatorId = AccountId.fromString(process.env.HEDERAS_OPERATOR_ID);
      let operatorKey = PrivateKey.fromString(process.env.HEDERAS_OPERATOR_KEY);
      
      // Call the Solidity mint function


      if (network === 'testnet')
      {
        
        client = Client.forTestnet().setOperator(operatorId, operatorKey);
      }
      else
      {
        operatorId = AccountId.fromString(process.env.HEDERAS_OPERATOR_ID_M);
        operatorKey = PrivateKey.fromString(process.env.HEDERAS_OPERATOR_KEY_M);
        client = Client.forMainnet().setOperator(operatorId, operatorKey);
       
      }

      
      
      
      let associateTx = await new AccountUpdateTransaction()
      .setAccountId(accId)
      .setMaxAutomaticTokenAssociations(10)
      .freezeWith(client)
      .sign(singsKey);
      let associateTxSubmit = await associateTx.execute(client);
      let associateRx = await associateTxSubmit.getReceipt(client);
      
      
      const convertBigNumberArrayToNumberArray = (array) => array.map(item => item.toNumber());
      
      
      const cidd = metadata;      
      
          const serialNumbers = await liveContract.mint(
          {
              amount: new Hbar(nftPriceInHbar.toBigNumber().toNumber() * amountToMint).toBigNumber().toNumber(),
              gas: 1_500_000
          },
          toMintAccount,
          amountToMint,
          cidd
      );
      
      const tokenID = contractData.tokenID;
      const serialNumber = convertBigNumberArrayToNumberArray(serialNumbers);
      
      const docRef = {
          contractID: contractId,
          tokenID: tokenID,
          serialNumber: serialNumber,
          toAccount: toAccount,
          // abi:JSON.parse(JSON.stringify(abi)),
          msg : "TOKEN SERIAL MINTED SUCCESSFULLY SUCCESSFULLY"
        };
        admin.firestore().collection('tokenmints').add(docRef);
      
        const data= {
          contractID:contractId,
          tokenID:tokenID,
          serialNumber:serialNumber,
          toAccount:toAccount
        }
      const message = "Serial Number " + serialNumber + " Minted on Token ID " + tokenID + " Successfully.";

      const contractInfo = await liveContract.getLiveEntityInfo();
      
      
      
      return res.status(200).send({success: true, message: message,data:data});

    }
catch (error) {
    return res.status(400).send({success: false, message: error.message});
}
});

//Transfer a subNFT to an Auction winner (triggered by Firebase Cloud functions when user has won auction)
app.post("/transferNFT", async (req, res) => { 
  try
  {
      
    const tokenId = req.body.tokenID;
    const serialNo = req.body.serial;
    const network = req.body.network;
    const account = req.body.toAccount;

    let treasuryId = myAccountIdTestnet;
    let treasuryKey = myPrivateKeyTestnet;

    if (network === "testnet")
    {
      client = Client.forTestnet().setOperator(operatorId, operatorKey);

    }
    else
    {
      treasuryId = myAccountIdMainnet;
      treasuryKey = myPrivateKeyMainnet;
      client = Client.forMainnet().setOperator(operatorId, operatorKey);
    }

    let tokenTransferTx = await new TransferTransaction()
      .addNftTransfer(tokenId, serialNo, treasuryId, account)
      .freezeWith(client)
      .sign(treasuryKey);
    let tokenTransferSubmit = await tokenTransferTx.execute(client);
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
    console.log(`\n NFT transfer Treasury->${account} status: ${tokenTransferRx.status} \n`); 
  
    return res.status(200).send({success: true, message: `\n NFT transfer Treasury->${account} status: ${tokenTransferRx.status} \n`});
  }
  catch (error) {
          return res.status(400).send({success: false, message: error.message});
      }
  });



async function makeBytes(trans, signingAcctId) {
  let transId = TransactionId.generate(signingAcctId);
  trans.setTransactionId(transId);
  trans.setNodeAccountIds([new AccountId(3)]);
  await trans.freeze();
  let transBytes = trans.toBytes();
  return transBytes;
}
const getCurrentTokenBalanceForUserId = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const document = await firestore.collection("users").doc(userId).get();
      const user = document.data();
      const tokenBalance = user.token_balance ? user.token_balance : 0;
      if (isNaN(tokenBalance)) {
        return resolve(0);
      } else {
        return resolve(tokenBalance);
      }
    } catch (error) {
      return reject(error);
    }
  });
};


//Billing Log for Firebase to track HBAR purchases of Comm Tokens
async function createBilling(userid, hbarAmount, tokenamount) {

  const userId = userid;
  const service = kAppleIAPService;
  const productId = "com.tstarship.fontana.tokens.4";
  const purchaseId = Date().now;
  const quantity = tokenamount;
  var transactionDate = new Date();
  const priceValue = hbarAmount;
  const priceCurrency = "HBAR";
  const environment = "server";

  

  var amount = quantity;
  
  const batch = firestore.batch();
  const billingLogRef = firestore.collection("billing_logs").doc();
  var billingLog = {
    user_id: userId,
    service,
    product_id: productId,
    purchase_id: purchaseId,
    quantity,
    transaction_date: transactionDate,
    price_value: priceValue,
    price_currency: priceCurrency,
    environment: environment,
  };
  batch.set(billingLogRef, billingLog);

  const creationDate = new Date(transactionDate);
  var expirationDate = new Date(transactionDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);

  const tokenCreationRef = firestore.collection("token_creation_logs").doc();
  var tokenCreation = {
    user_id: userId,
    source: "purchased",
    amount: amount,
    creation_date: creationDate,
    expiration_date: expirationDate,
    price_value: priceValue,
    price_currency: priceCurrency,
  };
  batch.set(tokenCreationRef, tokenCreation);

  const tokenCreationId = tokenCreationRef.id;
  const currentUserTokenBalance = await getCurrentTokenBalanceForUserId(userId);
  //const newTokenBalance = currentUserTokenBalance + amount;
  const newTokenBalance = Number(currentUserTokenBalance) + Number(amount);
  var claims = null;
  if (currentUserTokenBalance < 0) {
    const claimsToUpdate = Math.abs(currentUserTokenBalance);
    const claimsSnapshot = await firestore.collection("claims").where("token_id", "==", null)
      .where("user_id", "==", userId).limit(claimsToUpdate).get();
    claims = claimsSnapshot.docs;
  }

  for (var i = 0; i < amount; i++) {
    const individualTokenRef = firestore.collection("tokens").doc();
    var individualToken = {
      creation_id: tokenCreationId,
      user_id: userId,
      source: tokenCreation.source,
      creation_date: creationDate,
      expiration_date: expirationDate,
    };
    if (newTokenBalance > i) {
      individualToken.status = "available";
      individualToken.status_reason = "unused";
    } else {
      const dispositionDate = new Date();
      individualToken.status = "unavailable";
      individualToken.status_reason = "negative-balance";
      individualToken.disposition_date = dispositionDate;

      if (claims !== null && claims.length > 0) {
        const claim = claims[0];
        var claimData = claim.data();
        claimData.token_id = individualTokenRef.id;
        claimData.disposition_date = dispositionDate;
        claimData.status = "passed";
        const claimRef = firestore.collection("claims").doc(claim.id);
        batch.update(claimRef, claimData);
        claims.shift();
      }
    }
    batch.set(individualTokenRef, individualToken);
  }

  const userRef = firestore.collection("users").doc(userId);
  batch.update(userRef, { token_balance: newTokenBalance });

  await batch.commit();
  billingLog.id = billingLogRef.id;
  

}

async function payRoyalty(userid, hbaramount, tokenamount, network) {

  let myAccountId;
  let myPrivateKey;
  let auroraAccountId;
  if (network === 'testnet') {
    myAccountId = myAccountIdTestnet
    myPrivateKey = myPrivateKeyTestnet
    auroraAccountId = auroraAccountIdTestnet

    client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);
  }
  else {
    myAccountId = myAccountIdMainnet
    myPrivateKey = myPrivateKeyMainnet
    auroraAccountId = auroraAccountIdMainnet

    client = Client.forMainnet();
    client.setOperator(myAccountId, myPrivateKey);
  }

  // Create a transaction to transfer the royalty to the NFT Creator in hbars
  const transaction = new TransferTransaction()
  .addHbarTransfer(myAccountId, new Hbar(-tenPercentRoyalty))
  .addHbarTransfer(auroraAccountId, new Hbar(tenPercentRoyalty))
  .setTransactionMemo("Royalty paid to Aurora Project from NFT Fan App"); //Set the node ID to submit the transaction to

 
  //Submit the transaction to a Hedera network
  const txResponse = await transaction.execute(client);

  //Request the receipt of the transaction
  const transReceipt = await txResponse.getReceipt(client);

  //Get the transaction consensus status
  const transactionStatus = transReceipt.status;

  console.log("The transaction consensus status is " +transactionStatus.toString());


}