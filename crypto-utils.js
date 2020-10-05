const crypto = require('crypto')
const secp256k1 = require('secp256k1')

exports.generateKeyPair = function () {
    let privateKey;

    while (true) {
        privateKey = crypto.randomBytes(32)
        if (secp256k1.privateKeyVerify(privateKey)) break;
    }

    const publicKey = secp256k1.publicKeyCreate(privateKey, true);

    return {
        privateKey,
        publicKey
    };
}

exports.sign = function (privateKey, msg) {
    return secp256k1.ecdsaSign(Uint8Array.from(exports.hash(msg)), privateKey).signature;
};

exports.verify = function (publicKey, signature, msg) {
    return secp256k1.ecdsaVerify(signature, Uint8Array.from(exports.hash(msg)),publicKey);
}

exports.hash = function (obj) {
    return crypto.createHash('sha256').update(obj).digest();
}
