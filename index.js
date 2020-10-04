const {
  generateKeyPair,
  hash,
  sign,
  verify
} = require('./crypto-utils');

const {
  isRoot,
  initializeBlockChain,
  initializeLedger,
  port,
  loginToRoot,
  getLedger,
  getBlockchain
} = require('./init-utils');

const {
  initializeClient
} = require('./client-utils');

const {
  startServer
} = require('./server');


// const transactionHash = hash({asd:'asd'});
// console.log({ transactionHash });

// // Send signature to nodes
// const signature = sign(privateKey, transactionHash);
// console.log({signature});

// // Nodes verify by public key
// const verification = verify(publicKey, signature, transactionHash);
// console.log({ verification });


const { privateKey, publicKey } = generateKeyPair();

let ledger;
let blockChain;

if (isRoot()) {
  ledger = initializeLedger(publicKey);
  blockChain = initializeBlockChain();
  startServer(ledger, blockChain, port(), true);

  console.log({ ledger, blockChain })
} else {
  Promise.all([
    loginToRoot(),
    getLedger(),
    getBlockchain()
  ]).then(([_, ledger, blockChain]) => {
    startServer(ledger, blockChain, port(), false);

    console.log({ ledger, blockChain })
  });
}

initializeClient(publicKey, privateKey);
