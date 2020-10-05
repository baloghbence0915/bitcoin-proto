var rp = require('request-promise');

const {
  hash
} = require('./crypto-utils');
const { MerkleTree } = require('./merkle-tree');
const {
  jsonToBlockChain,
  jsonToLedger
} = require('./public/common-utils');


const MAX_VALUE = 10000;
const DIFFICULTY = Buffer.from([0, 0, 7, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]);

exports.DIFFICULTY = DIFFICULTY;

exports.port = () => Number.parseInt(process.argv[2]);
exports.rootPort = () => 3000;
exports.isRoot = () => exports.port() === exports.rootPort();

exports.initializeLedger = function (rootPublicKey) {
  // console.log(rootPublicKey)
  // console.log(Uint8Array.from(Buffer.from(Buffer.from(rootPublicKey).toString('hex'), 'hex')))

  const ledger = new Map();
  const firstTransaction =     {
    target: rootPublicKey,
    input: [{ tx: '01', value: MAX_VALUE }],
    output: [],
    signature: null
  };
  const firstTransactionId = hash(JSON.stringify(firstTransaction)).toString('hex');

  ledger.set(firstTransactionId, firstTransaction);

  return { ledger, firstTransactionId };
}

exports.initializeBlockChain = function (firstTransactionId) {
  const blockChain = [];
  const blockLink = exports.generateBlockLink(null, [firstTransactionId])
  blockChain.push(blockLink);

  return blockChain;
}

exports.generateBlockLink = function generateBlockLink(previousBlock, transactions) {
  const difficultyNumber = Number.parseInt(DIFFICULTY.toString('hex'), 16);

  const magic = exports.port() % 3000;
  const blockLink = {
    previousBlock,
    merkleRoot: new MerkleTree(transactions).getRootHash(),
    transactions: transactions,
    time: new Date().getTime(),
    // nonce: magic * 1000000
    nonce: 0
  }

  while (true) {
    const hashValue = hash(JSON.stringify(blockLink)).toString('hex');
    if (Number.parseInt(hashValue, 16) < difficultyNumber) {
      return { key: hashValue, block: blockLink };
    }

    blockLink.nonce++;
  }
}

exports.loginToRoot = function loginToRoot() {
  return rp({
    method: 'get',
    uri: `http://localhost:3000/api/login?url=${encodeURIComponent(`http://localhost:${exports.port()}`)}`,
    json: true
  }).then(console.log);
}

exports.getLedger = function getLedger() {
  return rp({
    method: 'get',
    uri: 'http://localhost:3000/api/ledger',
    json: true
  }).then(jsonToLedger);
}

exports.getBlockchain = function getBlockchain() {
  return rp({
    method: 'get',
    uri: 'http://localhost:3000/api/blockchain',
    json: true
  }).then(jsonToBlockChain);
}

exports.sendNewTransaction = function sendNewTransaction(url, updateMsg) {
  rp({
    method: 'post',
    uri: `${url}/api/transaction`,
    body: { updateMsg },
    json: true
  });
}

exports.sendNewBlock = function sendNewBlock(url, block, updateMsg) {
  rp({
    method: 'post',
    uri: `${url}/api/block`,
    body: { block, updateMsg },
    json: true
  });
}

exports.sendPeers = function sendPeers(url, peers) {
  rp({
    method: 'post',
    uri: `${url}/api/peers`,
    body: { peers },
    json: true
  });
}
