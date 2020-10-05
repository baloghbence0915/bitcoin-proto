const fs = require('fs');

const {
    port,
    isRoot
} = require('./init-utils');

exports.initializeClient = function (publicKey, privateKey) {
    fs.writeFile(`./miner${port()}.js`, 
    `const port = ${port()};
    const isRoot = ${isRoot()};
    const publicKey = '${Buffer.from(publicKey).toString('hex')}';
    const privateKey = '${privateKey.toString('hex')}';`,
    function (err) {
        if (err) return console.log(err);
    });
}