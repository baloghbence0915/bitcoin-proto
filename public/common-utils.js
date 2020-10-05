exports.ledgerToJson = function (ledger) {
    return [...ledger];
}

exports.jsonToLedger = function (response) {
    const l = new Map();
    response.forEach(item => {
        l.set(item[0], {
            target: item[1].target,
            input: item[1].input.map(i => ({ tx: i.tx, value: i.value })),
            output: item[1].output.map(o => ({ tx: o.tx, value: o.value })),
            signature: item[1].signature,
        })
    });
    return l;
}

exports.blockChainToJson = function (blockChain) {
    return [...blockChain];
}

exports.jsonToBlockChain = function (response) {
    return response;
}
