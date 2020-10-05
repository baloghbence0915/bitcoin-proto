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

const { privateKey, publicKey } = generateKeyPair();

// const transactionHash = hash(JSON.stringify({asd:'asd'}));
// console.log({ transactionHash });

// // Send signature to nodes
// const signature = sign(privateKey, transactionHash);
// console.log({signature});

// // Nodes verify by public key
// const verification = verify(publicKey, signature, transactionHash);
// console.log({ verification });



if (isRoot()) {
  const { ledger, firstTransactionId } = initializeLedger(Buffer.from(publicKey).toString('hex'));
  const blockChain = initializeBlockChain(firstTransactionId);
  startServer(ledger, blockChain, port(), true, publicKey, privateKey);
} else {
  Promise.all([
    loginToRoot(),
    getLedger(),
    getBlockchain()
  ]).then(([_, ledger, blockChain]) => {
    startServer(ledger, blockChain, port(), false, publicKey, privateKey);
  });
}

initializeClient(publicKey, privateKey);
