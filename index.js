require("dotenv").config();
import { Client, Hbar, HbarUnit, TokenAssociateTransaction, TransactionReceipt, TransferTransaction, TransactionId, AccountId, PrivateKey } from '@hashgraph/sdk';
import { HashConnect } from 'hashconnect';
import { initializeApp } from 'firebase/app';
const axios= require('axios');
import { doc, addDoc, getFirestore, collection, getDocs, setDoc, Timestamp } from "firebase/firestore"; 

//temporary holding of firebase config. Will also be moved to an .env soon
const firebaseConfig = {
  apiKey: "AIzaSyCbtN40-kMGciSa0b0lpnA7X-mftz6kWQk",
  authDomain: "nft-fan.firebaseapp.com",
  projectId: "nft-fan",
  storageBucket: "nft-fan.appspot.com",
  messagingSenderId: "177230626920",
  appId: "1:177230626920:web:20d46981745ef127c77bdd",
  measurementId: "G-EHF4SQXNSY"
};
    

const functions = require("firebase-functions");
const admin = require("firebase-admin");
var serviceAccount = require("./nft-fan-firebase-adminsdk-1rgug-87ce887a7d.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//admin.initializeApp(firebaseConfig);
const firestore = admin.firestore();
firestore.settings({timestampsInSnapshots: true, ignoreUndefinedProperties: true});
const express       = require('express');
const cors          = require('cors');
const request       = require('request');
const app           = express();
const bodyParser    = require('body-parser')


const firebaseapp = initializeApp(firebaseConfig);
const firebasedb = getFirestore(firebaseapp);
const port          = process.env.port || 3333;
let hashconnect = new HashConnect();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded( {extended: true} ))

//temporary holding variables for Owner Testnet and Mainnet (will be moved to .env variable soon)
const toAccTestnet    = "0.0.34330894";
//const toAccountMainnet= "0.0.467121";
const toAccountMainnet = "0.0.915243";

//setting Owner's wallet as Client (for sending transactions, NFTs, and royalties)
const myAccountIdTestnet = process.env.MY_ACCOUNT_ID;
const myPrivateKeyTestnet = process.env.MY_PRIVATE_KEY;
const auroraAccountIdTestnet = process.env.AURORA_ID;

const myAccountIdMainnet = process.env.MY_ACCOUNT_IDM;
const myPrivateKeyMainnet = process.env.MY_PRIVATE_KEYM;
const auroraAccountIdMainnet = process.env.AURORA_IDM;

let client = Client.forTestnet();
client.setOperator(myAccountIdTestnet, myPrivateKeyTestnet);


// Handle GET requests to / route
app.get('/', async (req, res) => {
return res.status(200).send("NFT Fan dApp");
/*admin.auth()
  .createUser({
    email: 'admindemo@ttecht.com',
    emailVerified: true,
    password: 'aZK2b4x$',
    displayName: 'John Doe',
    photoURL: 'https://google.com/test.png',
    disabled: false,
  })
  .then((userRecord) => {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully created new user:', userRecord.uid);
  })
  .catch((error) => {
    console.log('Error creating new user:', error);
  });


  try {
    const appMetadata = {
      name: "NFT Fan",
      description: "Fan Club for Hedera",
      icon: "https://firebasestorage.googleapis.com/v0/b/nft-fan.appspot.com/o/Files%2F1024.svg?alt=media&token=dc2fbbd0-98f2-4110-9e05-01529db42937",
      url: "https://nftfan.host/"
    }
    let initData      = await hashconnect.init(appMetadata);
    let privKey       = initData.privKey;
    let state         = await hashconnect.connect();
    let pairingString = await hashconnect.generatePairingString(state, "testnet", true);
    let pairedStatus  = await hashconnect.pairingEvent.on(async(data)  => {
      console.log('Paired', data);
    });
    const data = {
      privKey: privKey,
      pairingString: pairingString,
      topic: state.topic,
      status:pairedStatus,
    };
    return res.status(200).send({success: true, data: data});
  } catch (error) {
    return res.status(400).send({success: false, message: error.message});
  }*/
});
const kPurchase1Token = ".tokens.1";
const kPurchase4Token = ".tokens.4";
const kAppleIAPService = "apple-iap";
const kAndroidIAPService = "android-iap";


//app.post("/billing_logs/create", async (req, res) => {



app.get("/getPairKey/:memberID/:hederaNetwork", async (req, res) => {
  try {
    const appMetadata = {
      name: "NFT Fan",
      description: "Fan Club for Hedera",
      icon: "https://firebasestorage.googleapis.com/v0/b/nft-fan.appspot.com/o/Files%2F1024.svg?alt=media&token=dc2fbbd0-98f2-4110-9e05-01529db42937",
      url: "https://nftfan.host/"
    }
    var memberID= req.params.memberID;
    var hederaNetwork = req.params.hederaNetwork;

    let initData      = await hashconnect.init(appMetadata);
    let privKey       = initData.privKey;
    let state         = await hashconnect.connect();
    let pairingString = await hashconnect.generatePairingString(state, hederaNetwork, true);
    let pairedStatus  = await hashconnect.pairingEvent.once(async(data) => {
      console.log('Paired', data);
      /*const docRef = await addDoc(collection(firebasedb, "walletresponses"), {
        accountIds: data.accountIds,
        network: data.network,
        responseID: data.id,
        topic: data.topic,
        userID: memberID,
        metadata: data.metadata
      });
    console.log("Document written with ID: ", docRef.id);*/

    const docRef = {
        accountIds: data.accountIds,
        network: data.network,
        responseID: data.id,
        topic: data.topic,
        userID: memberID,
        metadata: data.metadata,
      };
      admin.firestore().collection('walletresponses').add(docRef);
    //admin.firestore().doc('walletresponses').add(docRef);
    //admin.firestore().doc(collection(firebasedb, "walletresponses")).add(docRef);

    });

    const data = {
      privKey: privKey,
      pairingString: pairingString,
      topic: state.topic,
      status:pairedStatus,
    };
    return res.status(200).send({success: true, data: data});
  } catch (error) {
    return res.status(400).send({success: false, message: error.message});
  }
});

app.post("/sendTransaction", async (req, res) => {
  //try {
    const appMetadata = {
      name: "NFT Fan",
      description: "Fan Club for Hedera Aurora Project",
      icon: "https://firebasestorage.googleapis.com/v0/b/nft-fan.appspot.com/o/Files%2F1024.svg?alt=media&token=dc2fbbd0-98f2-4110-9e05-01529db42937",
      url: "https://nftfan.host/"
    }
    const network         = req.body.network;
    const memberID        = req.body.memberID;
    const from            = req.body.from;
    const topic           = req.body.topic;
    const walletmetadata  = req.body.metadata;
    const amount          = req.body.amount;
    const memo            = req.body.memo;
    const tokenAmount     = req.body.tokenAmount;
    const initData        = await hashconnect.init(appMetadata);
    const state           = await hashconnect.connect(topic, walletmetadata);
    const trans           = new TransferTransaction().setTransactionMemo(memo);

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
    const acctToSign  = from;
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
    if (response != null)
    {
    try {
      
      //console.Log("response: ", response);
      if(response.success === true){

        // transaction Completed
        const topic   = response.topic;
        const success = response.success;
        const receipt = response.receipt;
        const id      = response.id;

        //save result in Firebase for the Mobile App to get notified
        const docRef =  {
          topic: topic,
          network: network,
          responseID: id,
          response: success,
          userID: memberID,
          metadata: walletmetadata,
          HBARamount: amount,
          tokenAmount: tokenAmount,
          msg : "TRANSACTION COMPLETED"
        };

        admin.firestore().collection('transactionresponses').add(docRef);
        const tenPercentRoyalty = 0.1 * Number(amount);

        console.log("Paying tenPercentRoyalty: ", tenPercentRoyalty);

       

        //Add Comm Tokens to the User's balance
        //creditTokens(memberID,amount,tokenAmount);
        createBilling(memberID, amount, tokenAmount);
        return res.status(200).send({success: true, data: {msg: "TRANSACTION COMPLETED", topic: topic, success: success, receipt: receipt, id: id}});
      }else{
        // transaction failed
        const topic   = response.topic;
        const success = response.success;
        const error   = response.error;
        const id      = response.id;

        const docRef = {
          topic: topic,
          network: network,
          responseID: id,
          response: success,
          userID: memberID,
          metadata: walletmetadata,
          HBARamount: amount,
          tokenAmount: tokenAmount, 
          msg : "TRANSACTION FAILED"
        };

        admin.firestore().collection('transactionresponses').add(docRef);

        return res.status(200).send({success: true, data: {msg: "TRANSACTION FAILED", topic: topic, success: success, error: error, id: id}});
      }
    } catch (error) {

      const topic   = response.topic;
      const success = response.success;
      const id      = response.id;

        const docRef = {
          topic: topic,
          network: network,
          responseID: id,
          response: success,
          userID: memberID,
          metadata: walletmetadata, 
          msg : error.message
        };

        admin.firestore().collection('transactionresponses').add(docRef);

      return res.status(400).send({success: false, message: error.message});
    }
  }
 /* } catch (error) {
      const topic   = response.topic;
      const success = response.success;
      const id      = response.id;
      const docRef = await addDoc(collection(firebasedb, "transactionresponses"), {
          topic: topic,
          network: network,
          responseID: id,
          response: success,
          userID: memberID,
          metadata: walletmetadata, 
          msg : error.message
        });
        console.log("Document written with ID: ", docRef.id);
    return res.status(400).send({success: false, message: error.message});
  }*/
});

app.listen(port, ()=> {
    console.log('Server is up on port ' + port)
});

//initial QR verficiation function
app.post("/getMetadata", async (req, res) => {
  try {
    const qr  = req.body.qr;
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
    if (PB_KEY === metadata.data.publicKey, metadata.data)
    {

      let dragonGlassLinkAccount = "https://testnet.dragonglass.me/hedera/accounts/" + qr.accountID;
      let dragonGlassTokenAccount = "https://testnet.dragonglass.me/hedera/tokens/" + qr.tokenID;
      if (network === "testnet")
      {
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
        dragonGlassLinkAccount = "https://"+ network + "/hedera/accounts/" + qr.accountID;
        dragonGlassTokenAccount = "https://"+ network +"/hedera/tokens/" + qr.tokenID;
        //console.log("DragonGlass link for Account: ", dragonGlassLinkAccount)
      }

      console.log("Owner of the subNFT: ", data.data.account_id);
      const ownerOfTheSubNFT = data.data.account_id;

      let foundInPairedWallet = false;
      let foundPairedWalletID = "0.0.0000000";

      if (pairedWallets.includes(ownerOfTheSubNFT))
      {
        //console.log("pairedWallets: ", pairedWallets);
        //console.log("Yes, you own the subNFT in this wallet. ");
        foundInPairedWallet = true;
        foundPairedWalletID = ownerOfTheSubNFT;
      }
      else 
      {
        foundInPairedWallet = false;
        foundPairedWalletID = "0.0.0000000";
      }

       
      return res.status(200).send({success: true, data: {metadata: metadata.data,dragonGlassAccount:dragonGlassLinkAccount,dragonGlassToken:dragonGlassTokenAccount, foundInAPairedWallet: foundInPairedWallet, ownerOfSubNFT:ownerOfTheSubNFT, tokenData: tokenData}});


    } //could be invalid QR code or any minted NFT without our metadata
    else
    {
      return res.status(400).send({success: false, message: "Your scanned QR Code did not return a valid subNFT Item."});
    }

    
  } catch (error) {
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

async function purchaseTokens(userid, hbaramount,tokenamount) {

    const userId = userid;
    const HBARamount = hbaramount;
    const amount = tokenamount;



}

async function createBilling(userid,hbarAmount,tokenamount) {

        const userId = userid;
        const service = kAppleIAPService;
        const productId = "com.tstarship.fontana.tokens.4";
        const purchaseId = Date().now;
        const quantity = tokenamount;
        var transactionDate = new Date();
        const priceValue = hbarAmount;
        const priceCurrency = "HBAR";
        const environment = "server";

        /*if (!userId || !service || !productId || !purchaseId || !quantity || !transactionDate || !priceValue || !priceCurrency || !environment) {
            throw new Error("Missing fields. Expected fields: user_id, service, product_id, purchase_id, quantity, transanction_date, price_value, price_currency, environment.");
        }

        if (service !== kAppleIAPService && service !== kAndroidIAPService) {
            throw new Error("No valid service.");
        }

        if (isNaN(priceValue)) {
            throw new Error("No valid price value. A number is expected.");
        }

        if (isNaN(quantity)) {
            throw new Error("No valid quantity. A number is expected.");
        }

        transactionDate = new Date(transactionDate);
        if (isNaN(transactionDate)) {
            throw new Error("No valid transaction date.");
        }*/

        var amount = quantity;
       /* if (productId.includes(kPurchase1Token)) {
            amount = 1;
        } else if (productId.includes(kPurchase4Token)) {
            amount = 4;
        }
        if (amount === 0) {
            throw new Error("Unknown product identifier.");
        }*/

       // const billingLogsSnapshot = await firestore.collection("billing_logs").where("service", "==", service)
        //    .where("purchase_id", "==", purchaseId).where("transaction_date", "==", transactionDate)
        //    .where("product_id", "==", productId).get();
        //if (billingLogsSnapshot.docs.length > 0) {
            //var exisitingBillingLog = billingLogsSnapshot.docs[0].data();
           // exisitingBillingLog.id = billingLogsSnapshot.docs[0].id;
           /* if (exisitingBillingLog.user_id === userId) {
                return res.status(200).send({success: true, data: exisitingBillingLog, message: "Billing log already saved"});
            } else {
                throw new Error("This purchase is associated with another user.");
            }*/
       // } else {
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
            batch.update(userRef, {token_balance: newTokenBalance});

            await batch.commit();
            billingLog.id = billingLogRef.id;
            //return res.status(200).send({success: true, data: billingLog});
       // }
    
    } 

async function payRoyalty(userid, hbaramount, tokenamount,network) {

        let myAccountId;
        let myPrivateKey;
        let auroraAccountId;
        if (network === 'testnet')
        {
          myAccountId = myAccountIdTestnet
          myPrivateKey = myPrivateKeyTestnet
          auroraAccountId = auroraAccountIdTestnet

          client = Client.forTestnet();
          client.setOperator(myAccountId, myPrivateKey);
        }
        else
        {
          myAccountId = myAccountIdMainnet
          myPrivateKey = myPrivateKeyMainnet
          auroraAccountId = auroraAccountIdMainnet

          client = Client.forMainnet();
          client.setOperator(myAccountId, myPrivateKey);
        }

        console.log("myAccountId: ", myAccountId);
        console.log("myPrivateKey: ", myPrivateKey);
        console.log("auroraAccountId: ", auroraAccountId);

        // Create a transaction to transfer the royalty to the NFT Creator in hbars
        /*const transaction = new TransferTransaction()
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
*/

}

//initial credit token fucnction to immediately credit tokens on Firebase
//Need to update this to mark as "Purchased" tokens, not credited
async function creditTokens(userid, hbaramount, tokenamount) {
    //const transactionResponse = transResponse;


    const batch = firestore.batch();
    //console.log("batch:", batch);
    //const pushMessagesRef = firestore.collection("pushmessages").doc();
    const userId = userid;
    const HBARamount = hbaramount;
    const amount = tokenamount;

     // console.log("passed HBARamount:", HBARamount);
//console.log("passed tokenAmount:", amount);

    if (!userId) {
        console.log("transactionresponse missing userid");
        return null;
    }

    if (isNaN(amount) || amount <= 0) {
        console.log("transactionresponse missing tokenAmount");
        return null;
    }
    const notificationDate = new Date();
    const tag = "Wallet";


  const creationDate = new Date();
   var expirationDate = new Date();

     expirationDate.setFullYear(creationDate.getFullYear() + 1);

     const tokenCreationRef = firestore.collection("token_creation_logs").doc();
     var tokenCreation = {
         user_id: userId,
         source: "credited",
         amount: amount,
         creation_date: creationDate,
         expiration_date: expirationDate,
         price_value: 0,
         price_currency: "USD",
     };
     batch.set(tokenCreationRef, tokenCreation);

     const tokenCreationId = tokenCreationRef.id;
     const currentUserTokenBalance = await getCurrentTokenBalanceForUserId(userId);

     // console.log("current token balance:", currentUserTokenBalance);
      
     var claims = null;
     if (currentUserTokenBalance < 0) {
         const claimsToUpdate = Math.abs(currentUserTokenBalance);
         const claimsSnapshot = await firestore.collection("claims").where("token_id", "==", null)
             .where("user_id", "==", userId).limit(claimsToUpdate).get();
         claims = claimsSnapshot.docs;
     }

     const newTokenBalance = Number(currentUserTokenBalance) + Number(amount);
     //console.log("new token balance 1:", newTokenBalance);
     for (var i = 0; i < amount; i++) {
          console.log("running: ", i);
         const individualTokenRef = firestore.collection("tokens").doc();
         var individualToken = {
             creation_id: tokenCreationId,
             source: tokenCreation.source,
             creation_date: creationDate,
             expiration_date: expirationDate,
             user_id: userId,
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

     //console.log("new token balance 2:", newTokenBalance);
      
     const userRef = firestore.collection("users").doc(userId);
     batch.update(userRef, {token_balance: newTokenBalance});

      console.log("userID:", userId);
        await batch.commit();
}