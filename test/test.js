const truffleAssert = require('truffle-assertions');
const erc721Instance = artifacts.require("MYERC721");

// note: change this to your metamask address so that you can test in a browser
let metamaskAddress = "0x000000000000000000000000000000000000dEaD";

contract("MYERC721 CHECK MINTS", async accounts =>{

  it("Mint 100 tokens and ensure account[0] has 100 tokens", async () => {
    // checks that the transaction returned successfully
    let erc721Contract = await erc721Instance.deployed();
    let mint = await erc721Contract.mint(100, {from:accounts[0]} );
    expect(JSON.stringify(mint.receipt.status)).to.eql('true');

    // ensure that account[0] has 200 nfts
    let erc721Balance = await erc721Contract.balanceOf(accounts[0]);
    expect(erc721Balance.toString()).to.eql('100');
  });

  it("Mint 1 token and ensure it fails (max supply is 100)", async () => {
    // ensures that minting reverts with the error "Cannot mint above max supply"
    let erc721Contract = await erc721Instance.deployed();
    await truffleAssert.reverts(erc721Contract.mint(1, {from:accounts[0]}),"Cannot mint above max supply");
  });

});

contract("MYERC721 SETUP FOR MANUAL TEST", async accounts =>{
  it("Sent 1 eth to my metamask address", async () => {
    // sends 1 eth to metamask wallet, ensures the end result is more than 1eth
    let erc721Contract = await erc721Instance.deployed();
    let send = await web3.eth.sendTransaction({to:metamaskAddress, from:accounts[0], value: web3.utils.toWei('1')})
    let balance = new web3.utils.BN(await web3.eth.getBalance(metamaskAddress));
    expect(parseFloat(web3.utils.fromWei(balance))).to.be.above(0.99);
  });

  it("Mint 99 tokens and ensure account[0] has 99 tokens", async () => {
    // mints 99 tokens so that 1 last token can be minted from the browser
    let erc721Contract = await erc721Instance.deployed();
    let mint = await erc721Contract.mint(99, {from:accounts[0]} );
    expect(JSON.stringify(mint.receipt.status)).to.eql('true');
    let erc721Balance = await erc721Contract.balanceOf(accounts[0]);
    expect(erc721Balance.toString()).to.eql('99');
  });
});
