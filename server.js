const express = require('express');
const app = express();

let ledger;
let blockChain;
let endpoints = [];

exports.startServer = function (ledger, blockChain, port, isRoot) {
    //start server
    app.get('/api', (req, res) => {
        res.send('Hello World!')
    });

    if (isRoot) {
        app.get('/api/login', (req, res) => {
            endpoints.push(req.query.url);
            const msg = `Endpoint added: ${req.query.url}`;
            console.log(msg);
            res.send(msg);
            res.end();
        });

        app.get('/api/ledger', (req, res) => {
            res.json([...ledger]);
            res.end();
        });
    
        app.get('/api/blockchain', (req, res) => {
            res.json([...blockChain]);
            res.end();
        });    
    }

    app.use(express.static('public'));

    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`)
    });
}