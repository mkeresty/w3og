const derpContract = artifacts.require("MYERC721");

module.exports = async function(deployer){
    await deployer.deploy(derpContract);
    console.log("MYERC721 Address: " + derpContract.address);
};
