var rp = require('request-promise');
const {
    hash
} = require('./crypto-utils');
const { MerkleTree } = require('./merkle-tree');

const MAX_VALUE = 10000;
const FIRST_TRANSACTION_ID = Buffer.from([1]);
const DIFFICULTY = Buffer.from([0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]);

exports.port = () => Number.parseInt(process.argv[2]);
exports.rootPort = () => 3000;
exports.isRoot = () => exports.port() === exports.rootPort();

exports.initializeLedger = function (rootPublicKey) {
    const ledger = new Map();
    ledger.set(FIRST_TRANSACTION_ID, { input: [], target: rootPublicKey, value: MAX_VALUE });

    return ledger;
}

exports.initializeBlockChain = function () {
    const blockChain = new Map();

    const difficultyNumber = Number.parseInt(DIFFICULTY.toString('hex'), 16);

    const blockLink = {
        previousBlock: null,
        merkleRoot: new MerkleTree([FIRST_TRANSACTION_ID]).getRootHash(),
        transactions: [FIRST_TRANSACTION_ID],
        time: new Date().getTime(),
        nonce: 0
    }

    while (true) {
        const hashValue = hash(JSON.stringify(blockLink));
        if (Number.parseInt(hashValue.toString('hex'), 16) < difficultyNumber) {
            blockChain.set(hashValue, blockLink);
            break;
        }

        blockLink.nonce++;
    }

    return blockChain;
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
    }).then(function (response) {
        const l = new Map();
        response.forEach(item => {
            l.set(Buffer.from(item[0].data), {
                input: item[1].input,
                target: Buffer.from(item[1].target.data),
                value: item[1].value
            })
        });
        return l;
    });
}

exports.getBlockchain = function getBlockchain() {
    return rp({
        method: 'get',
        uri: 'http://localhost:3000/api/blockchain',
        json: true
    }).then(function (response) {
        const b = new Map();
        response.forEach(item => {
            b.set(Buffer.from(item[0].data), {
                previousBlock: item[1].previousBlock,
                merkleRoot: Buffer.from(item[1].merkleRoot.data),
                transactions: item[1].transactions.map(t => Buffer.from(t.data)),
                time: item[1].time,
                nonce: item[1].nonce,
            })
        });
        return b;
    });
}
