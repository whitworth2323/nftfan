
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

  ![Alt Text](https://firebasestorage.googleapis.com/v0/b/nft-fan.appspot.com/o/Files%2FPairedWallet.gif?alt=media&token=fe5db942-e298-4d19-956f-09fd4af835d2)



</div>