const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const { ledgerToJson, blockChainToJson } = require('./public/common-utils');
const { sign, hash, verify } = require('./crypto-utils');
const { sendNewTransaction, port, generateBlockLink, sendNewBlock, DIFFICULTY, sendPeers, isRoot } = require('./init-utils');

let endpoints = [`http://localhost:${port()}`];
let transactionPool = [];

function isSpentTransaction(ledger, transactionId) {
    let isSpent = false;
    ledger.forEach((transaction) => {
        transaction.input.forEach(i => {
            if (i.tx === transactionId) isSpent = true;
        });
    });

    return isSpent;
}

function getInputs(ledger, publicKey) {
    const inputs = new Map();

    ledger.forEach((transaction, id) => {
        if (transaction.target === publicKey) inputs.set(id, transaction);
    });

    return inputs;
}

function getUnspentInputs(ledger, publicKey) {
    const inputs = getInputs(ledger, publicKey);
    const unspentInputs = new Map();

    inputs.forEach((transaction, id) => {
        if (!isSpentTransaction(ledger, id)) unspentInputs.set(id, transaction)
    });

    return unspentInputs;
}

function getBalance(ledger, publicKey) {
    let balance = 0;
    getUnspentInputs(ledger, publicKey).forEach(transaction => {
        transaction.input.forEach(i => {
            balance += i.value;
        });
    });

    return balance;
}

function getTransactionValue(ledger, transactionId) {
    const transaction = ledger.get(transactionId);
    return transaction.input.reduce((a, b) => a + b.value, 0);
}

function isValidUpdate(ledger, updateMsg) {
    let validSignatures = true;

    updateMsg.signedInputs.forEach(si => {
        const transacitonId = si.id;
        const signature = si.signature;
        const output = si.output;
        const transaction = ledger.get(transacitonId);

        if (!verify(Uint8Array.from(Buffer.from(transaction.target, 'hex')),
            Uint8Array.from(Buffer.from(signature, 'hex')),
            JSON.stringify({ ...transaction, output }))) validSignatures = false;
    });

    return validSignatures;
}

function isValidBlock(blockChain, blocklink) {
    const difficultyNumber = Number.parseInt(DIFFICULTY.toString('hex'), 16);
    const lastBlock = blockChain[blockChain.length - 1];

    if (lastBlock.key === blocklink.block.previousBlock) {
        const hashValue = hash(JSON.stringify(blocklink.block)).toString('hex');
        if (Number.parseInt(hashValue, 16) < difficultyNumber) {
            return true;
        }
    }

    return false;
}

function refreshLedgerAndBlockChain(ledger, blockChain, blockLink, updateMsg) {
    blockLink.block.transactions.forEach(t => {
        const tx = transactionPool.find(trx => trx.key === t);
        ledger.set(tx.key, tx.value);

        transactionPool = transactionPool.filter(trx => trx.key !== t);
    });

    blockChain.push(blockLink);

    updateMsg.signedInputs.forEach(si => {
        const transacitonId = si.id;
        ledger.get(transacitonId).signature = si.signature;
    });

    console.log('*****************************LEDGER********************************');
    ledger.forEach((v, k) => {
        console.log(k,v)
    });

    console.log('*****************************BLOCKCHAIN********************************');
    blockChain.forEach((v, k) => {
        console.log(v)
    });
}

exports.startServer = function (ledger, blockChain, port, isRoot, publicKey, privateKey) {
    // ledger.forEach((v, k) => {
    //     console.log(v)
    // });
    // blockChain.forEach((v, k) => {
    //     console.log(v)
    // });

    app.get('/api', (req, res) => {
        res.send('Hello World!')
    });

    /** Init methods */
    if (isRoot) {
        app.get('/api/login', (req, res) => {
            const msg = `Endpoint added: ${req.query.url}`;
            if (!endpoints.includes(req.query.url)) {
                endpoints.push(req.query.url);

                endpoints.forEach(e => {
                    sendPeers(e, endpoints);
                });

                // console.log(msg);
            }
            res.send(msg);
            res.end();
        });

        app.get('/api/ledger', (req, res) => {
            res.json(ledgerToJson(ledger));
            res.end();
        });

        app.get('/api/blockchain', (req, res) => {
            res.json(blockChainToJson(blockChain));
            res.end();
        });
    }

    /** Client methods */
    app.get('/api/getBalance', (req, res) => {
        res.send(String(getBalance(ledger, Buffer.from(publicKey).toString('hex'))));
        res.end();
    })

    app.get('/api/sendCoin', (req, res) => {
        const sendValue = Number.parseInt(req.query.value);
        const balance = getBalance(ledger, Buffer.from(publicKey).toString('hex'));
        const targetPublicKey = req.query.target;

        if (sendValue > balance) {
            res.status(500).send('You don\'t have enough coin for this transaction');
        }
        res.end();

        const unspentInputs = [];
        getUnspentInputs(ledger, Buffer.from(publicKey).toString('hex')).forEach((_, transactionId) => {
            unspentInputs.push(transactionId);
        });

        const updateMsg = {
            // signedInputs: unspentInputs.map(ui => ({ id: ui, signature: sign(privateKey, JSON.stringify(ledger.get(ui))) })),
        };

        if (sendValue === balance) {
            const tx = {
                target: targetPublicKey,
                input: unspentInputs.map(ui => ({ tx: ui, value: getTransactionValue(ledger, ui) })),
                signature: null
            };
            const txHashValue = hash(JSON.stringify(tx)).toString('hex');
            updateMsg.transactions = [{
                key: txHashValue,
                value: tx
            }];
            updateMsg.signedInputs = unspentInputs
                .map(ui => ({ id: ui, signature: Buffer.from(sign(privateKey, JSON.stringify({ ...ledger.get(ui), output: [txHashValue] }))).toString('hex'), output: [txHashValue] }));
        } else {
            const batchTx = {
                target: Buffer.from(publicKey).toString('hex'),
                input: unspentInputs.map(ui => ({ tx: ui, value: getTransactionValue(ledger, ui) })),
                signature: null
            };
            const batchHashValue = hash(JSON.stringify(batchTx)).toString('hex');
            updateMsg.signedInputs = unspentInputs
                .map(ui => ({ id: ui, signature: Buffer.from(sign(privateKey, JSON.stringify({ ...ledger.get(ui), output: [batchHashValue] }))).toString('hex'), output: [batchHashValue] }));

            const tx = {
                target: targetPublicKey,
                input: [{ tx: batchHashValue, value: sendValue }],
                signature: null
            };
            const txHashValue = hash(JSON.stringify(tx)).toString('hex');

            const changeTx = {
                target: Buffer.from(publicKey).toString('hex'),
                input: [{ tx: batchHashValue, value: balance - sendValue }],
                signature: null
            };
            const changeTxHashValue = hash(JSON.stringify(changeTx)).toString('hex');


            updateMsg.transactions = [{
                key: txHashValue,
                value: tx
            }, {
                key: changeTxHashValue,
                value: changeTx
            }, {
                key: batchHashValue,
                value: {
                    ...batchTx,
                    signature: Buffer.from(sign(privateKey, JSON.stringify({ ...batchTx, output: [txHashValue, changeTxHashValue] }))).toString('hex'),
                    output: [txHashValue, changeTxHashValue]
                }
            }];
        }

        endpoints.forEach(e => {
            sendNewTransaction(e, updateMsg);
        });
    });

    /** Peer-to-peer methods */
    app.post('/api/transaction', bodyParser.json());
    app.post('/api/transaction', (req, res) => {
        res.end();
        const updateMsg = req.body.updateMsg;

        if (isValidUpdate(ledger, updateMsg)) {
            transactionPool = [...updateMsg.transactions];
            console.log(`New transactions have been arrived!`);
            startPooling(ledger, blockChain, updateMsg)
        }

    })

    app.post('/api/block', bodyParser.json());
    app.post('/api/block', (req, res) => {
        res.end();
        const updateMsg = req.body.updateMsg;
        const block = req.body.block;

        if (isValidBlock(blockChain, block) && isValidUpdate(ledger, updateMsg)) {
            console.log('New block has been arrived');
            refreshLedgerAndBlockChain(ledger, blockChain, block, updateMsg)
        }
    })

    app.post('/api/peers', bodyParser.json());
    app.post('/api/peers', (req, res) => {
        res.end();
        const peers = req.body.peers;

        console.log('New peer has been joined');
        endpoints = peers;
        console.log(peers);
    })

    app.use(express.static('public'));

    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`)
    });

}

let inProgress;

function startPooling(ledger, blockChain, updateMsg) {
    console.log(new Date());
    console.log('Transactions in pool:', transactionPool.length);

    if (!transactionPool.length || inProgress || !isRoot()) return;
    inProgress = true;

    const newBlock = generateBlockLink(blockChain[blockChain.length - 1].key, transactionPool.map(t => t.key));

    endpoints.forEach(e => {
        sendNewBlock(e, newBlock, updateMsg);
    });

    inProgress = false;
}
