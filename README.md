
<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="https://firebasestorage.googleapis.com/v0/b/nft-fan.appspot.com/o/Files%2F1024.png?alt=media&token=2448987d-65bd-4a7e-9bfb-daa87269ab7d" alt="Logo" width="256" height="256">
  </a>

  <h3 align="center">NFT Fan Club for Hedera: Aurora Project</h3>

  <p align="center">
    An Apple App Store app that hosts auctions for subNFTs which are physical items, such as coffee mugs, incorporating NFT artwork. This provides an additional income stream for NFT creators and owners.
    <br /><br />
    This project is the backend server for our Apple App Store app which interacts with the Hedera HashGraph and uses Smart Contracts.
    <br /><br />
    <a href="https://nftfan.host" target="_blank"><strong>Our Website»</strong></a>
    <br />
    <br />
    <a href="https://www.youtube.com/watch?v=dqWqI9C6Yg4" target="_blank">View Project Explanation</a>
    ·
    <a href="https://apps.apple.com/us/app/nft-fan/id1618169867" target="_blank">Download App in App Store</a>
  </p>
  <br />
  <br />

  </div>
  <!-- ABOUT THE PROJECT -->
  ## About The Project



  While NFTs are readily bought and sold, tools and services for producing derivative works of the original NFTs such as physical merchandise for the NFT owners and creators to share with their fans and community are scarce. Automating this could generate more revenue and engagement for NFT owners without having to sell their original NFT and still provide additional royalties to their creators.

  In the past, our team has worked together building fitness-club-management software. When we heard about the Hedera22 Hackathon, we decided to adapt this club-management software for the NFT world to create our contest entry.

  NFTs are often well-designed graphics or digital works of art registered on a decentralized public ledger such as the Hedera hashgraph network. 

  Our project allow creation and authentication of physical limited edition collections of promotional merchandizing items such as coffee mugs and mouse pads. These merchandise items are derivative works of an underlying NFT artwork collection, and are herein defined as subNFTs. 

  A subNFT has two components: 
  1) a physical item with a secret private key embedded in a visibly printed QR code on the item, and 
  2) an NFT minted by the club owner with the symbol “COA” which is transferred to the member’s HashPack wallet with the name “Certificate of Authenticity.” 

  <p align="right">(<a href="#top">back to top</a>)</p>


### Built With

* [Node.js](https://nodejs.org/en/)
* [Hedera SDK JS](https://github.com/hashgraph/hedera-sdk-js)
* [Strato SDK (Smart Contracts)](https://hsj-docs.buidlerlabs.com/)
* [Firebase](https://console.firebase.google.com/)
* [Apple iOS SDK](https://developer.apple.com/)


<p align="right">(<a href="#top">back to top</a>)</p>


<!-- Main Features -->
## Main Features

These are the main functions and endpoints that are possible with this backend working alongside our mobile app in the Apple App Store. 

* Get Pairing Code and Pair with HashPack Wallet
   ```js
   app.get("/getPairKey/:memberID/:hederaNetwork", async (req, res) => {
   ```

  ![](https://firebasestorage.googleapis.com/v0/b/nft-fan.appspot.com/o/Files%2Fpairedwallet_small2.gif?alt=media&token=062f9d7d-180d-436e-b300-558e44d726ca)


This allows you to receive a Pairing Code from the HashConnect SDK and use it in our mobile app to pair your HashPack wallet.

* Send HBAR Transaction from HashPack Wallet 
   ```js
   app.post("/sendTransaction", async (req, res) => {
   ```

  ![](https://firebasestorage.googleapis.com/v0/b/nft-fan.appspot.com/o/Files%2FsendHBAR.gif?alt=media&token=02448766-8a8b-49b1-bf23-294ab8c3ed95)


This allows you to create a Transaction Request in your HashPack wallet for a specific HBAR amount equivalent to exactly 1 Comm Token. This amount is calculated in realtime based on the cost of $4.99 in HBAR because $4.99 is equal to 1 Comm Token in our mobile app.

Notice in the above example from our app how it dynamically calculates the price in that very moment to acquire the Comm Token.

* We handle royalty payments directly to the NFT Creators for each HBAR transaction made through our app when acquiring internal Comm Tokens. 
    ```js
    app.get('/payRoyalty', async (req, res) => {
 

    ```

This endpoint utilizes a Smart Contract to fulfill this transaction.
  ```js
    // Create the CreatableEntities and the UploadableEntities
    const contractID = req.body.contractID;
    const amountHBAR = req.body.amount;
    const contract = await Contract.newFrom({ path: 'PayRoyalty.sol' });
   ```



* This allow us to verify a subNFT if it is authentic and is in the paired HashPack wallet.
   ```js
   app.post("/getMetadata", async (req, res) => {
   ```

  ![](https://firebasestorage.googleapis.com/v0/b/nft-fan.appspot.com/o/Files%2FverifysubNFT.gif?alt=media&token=182b11d3-1ec9-419e-803a-443b6c8bf664)

This allows you to verify a specific subNFT to see if it is authentic. In the example above you can see we scan the QR code on the merchandise, then query a mirrornode on the Hedera Hashgraph to look up the metadata of the minted "Certificate of Authenticity" for the physical merchandise to see if it is authentic and if the currently paired HashPack wallet contains it. 

* Launch our Smart Contract which mints a Certificate of Authenticity token for our subNFTs.
    ```js
    app.post("/launchContract", async (req, res) => {

    ```

We configure and then deploy our Solidity contract onto the network:
  ```js
    // Create the CreatableEntities and the UploadableEntities

    const token = new Token(defaultNonFungibleTokenFeatures);

    const contract = await Contract.newFrom({ path: 'NFTFan.sol' });

    const liveToken = await session.create(token);

    const liveContract = await session.upload(
      contract,
      { _contract: { gas: 200_000 } },
      liveToken,
      session,
      nftPriceInHbar._valueInTinybar

    );
    ```

* Use our previously launched contract to mint our NFT which will contain metadata for the Hedera 
Accounts on our corresponding subNFT merchandise.
    ```js
    app.post("/mintNFT", async (req, res) => {

    ```

We find the contract using our Firebase backend and then mint the NFT:
  ```js
     let contractData;
      const ans = await admin.firestore().collection('livecontracts').where('contractID','==',contractId)
      .get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
            contractData = doc.data();             
          })
      })
      .catch(err => console.log(err.message))
    ```

* This allows us to transfer the "Certificate of Authenticty" token of the subNFT to the winner of a specific subNFT auction.
    ```js
    app.post("/transferNFT", async (req, res) => { 

    ```

These always come from our original treasury and then are passed to the user on their paired HashPack wallet:
  ```js
     let tokenTransferTx = await new TransferTransaction()
      .addNftTransfer(tokenId, serialNo, treasuryId, account)
      .freezeWith(client)
      .sign(treasuryKey);
    let tokenTransferSubmit = await tokenTransferTx.execute(client);
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
    ```

* This function allows us to create unique billing logs when doing HBAR transfers and keep a history of it on our Firebase backend.
    ```js
    async function createBilling(userid, hbarAmount, tokenamount) {

    ```

We use this to credit the correct amount of Comm Tokens after they have been successfully purchased via HBAR.
  ```js
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
    ```

We also create a reference of the Comm Token specifically that was purchased and log it into our Firebase backend:
  ```js
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
    ```
