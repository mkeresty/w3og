const path = require('path')
const express = require('express')
const wildcardSubdomains = require('wildcard-subdomains')
const ethers = require('ethers');
const mime = require('mime-types')
const PORT = process.env.PORT || 5000

let provider = ethers.getDefaultProvider();
//let provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");

const ogAddress = "0x6023E55814DC00F094386d4eb7e17Ce49ab1A190";
const ogAbi = [{
  "inputs": [ {"internalType": "bytes32","name": "_name","type": "bytes32"},
              {"internalType": "string","name": "_key","type": "string"}],
  "name": "getTextRecord",
  "outputs": [{"internalType": "string","name": "","type": "string"}],
  "stateMutability": "view",
  "type": "function"
}];

const ogContract = new ethers.Contract(ogAddress, ogAbi, provider);

function stringToBytes32(_string) {
  let result = ethers.hexlify(ethers.toUtf8Bytes(_string));
  while (result.length < 66) {
    result += '0';
  }
  if (result.length !== 66) {
    throw new Error("invalid web3 implicit bytes32");
  }
  return result;
}



express()
  .use(wildcardSubdomains({
    namespace: 's',
    whitelist: ['www'],
  }))
  .use(express.static(path.join(__dirname, 'public')))
  .use((req, res, next) => {
    if(process.env.NODE_ENV === 'production') {
      if (req.header('x-forwarded-proto') !== 'https')
        res.redirect(`https://${req.header('host')}${req.url}`)
      else
        next()
    }
    else
      next()
  })
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  //.use(cors())
  //.options('*', cors())
  .get('/', (req, res) => {
    res.send("TODO: make this work for contracts that return code at base")
  })
  .get('/s/:id/:url', async function(req,res){
    // assume mime is html, then try to get its actual type
    let contractReturnMimeType = 'text/html';
    let fileSuffix = req.params.url.split('.');
    fileSuffix = fileSuffix[fileSuffix.length-1];
    let tmpMimeType = mime.lookup(fileSuffix)
    if(tmpMimeType != false) {
      contractReturnMimeType = tmpMimeType
    }

    // ensure the domain is not longer than 32, max for og
    const domainName = req.params.id;
    if(domainName.length > 32)
      throw new Error("Domain too long (32 bytes max for .og");
    let domainNameString = stringToBytes32(domainName);

    // get the contractcontent text record
    let contentContractTxt  = await ogContract.getTextRecord( domainNameString,"contentcontract");
    if(contentContractTxt){
      try{
        //get the content
        const returnData = await provider.call({
          to: contentContractTxt,
          data: ethers.hexlify(ethers.toUtf8Bytes("/"+req.params.url))
        })

        //decode the content
        let abiCoder = new ethers.AbiCoder();
        console.log(JSON.stringify(abiCoder));
        let finalData = abiCoder.decode(["bytes"], returnData)[0].slice(2);

        res.type(contractReturnMimeType); 
        res.send(Buffer.from(finalData, 'hex'));
        }
      catch(e){
        res.send("Error: " + JSON.stringify(e));
      }
    }
    else{
      res.send("Domain \"" + domainName + ".og\" not set")
    }
  })
  //*/
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
