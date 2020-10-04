const {
    hash
} = require('./crypto-utils');

class MerkleTree {
    constructor(list) {
        // Buffer[]
        this.list = list;
    }

    getRootHash() {
        const levels = [this.list];

        while (levels[levels.length - 1].length > 1) {
            const highestLevel = levels[levels.length - 1];
            const newHighestLevel = [];
            for (let i = 0; i < highestLevel.length; i += 2) {
                if (highestLevel[i + 1]) {
                    newHighestLevel.push(hash(highestLevel[i].toString('hex') + highestLevel[i + 1].toString('hex')));
                } else {
                    // Fallback for odd leaves
                    newHighestLevel.push(highestLevel[i]);
                }
            }
            levels.push(newHighestLevel);
        }

        return levels[levels.length - 1][0];
    }
}

function testMerkleTree() {
    const arr = [Buffer.from([1, 255]), Buffer.from([255, 1]), Buffer.from([255, 255]), Buffer.from([1, 1]), Buffer.from([127, 127]), Buffer.from([0, 127]), Buffer.from([127, 0]), Buffer.from([127, 255])];

    console.log('First:');
    console.log(arr[0].toString("hex"), '\n',
        'Manually created root hash:\t\t',
        arr[0].toString('hex')
    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0]]).getRootHash().toString('hex'));

    console.log('Second:');
    console.log(arr[0].toString("hex"), arr[1].toString("hex"), '\n',
        'Manually created root hash:\t\t',
        hash(
            arr[0].toString('hex')
            +
            arr[1].toString('hex')
        ).toString('hex')
    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1]]).getRootHash().toString('hex'));

    console.log('Third:');
    console.log(arr[0].toString("hex"), arr[1].toString("hex"), arr[2].toString("hex"), '\n',
        'Manually created root hash:\t\t',
        hash(
            hash(
                arr[0].toString('hex')
                +
                arr[1].toString('hex')
            ).toString('hex')
            +
            arr[2].toString('hex')
        ).toString('hex')

    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1], arr[2]]).getRootHash().toString('hex'));

    console.log('Fourth:');
    console.log(arr[0].toString("hex"), arr[1].toString("hex"), arr[2].toString("hex"), arr[3].toString("hex"), '\n',
        'Manually created root hash:\t\t',
        hash(
            hash(
                arr[0].toString('hex')
                +
                arr[1].toString('hex')
            ).toString('hex')
            +
            hash(
                arr[2].toString('hex')
                +
                arr[3].toString('hex')
            ).toString('hex')
        ).toString('hex')

    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1], arr[2], arr[3]]).getRootHash().toString('hex'));

    console.log('Fifth:');
    console.log(arr[0].toString("hex"), arr[1].toString("hex"), arr[2].toString("hex"), arr[3].toString("hex"), arr[4].toString("hex"), '\n',
        'Manually created root hash:\t\t',
        hash(
            hash(
                hash(
                    arr[0].toString('hex')
                    +
                    arr[1].toString('hex')
                ).toString('hex')
                +
                hash(
                    arr[2].toString('hex')
                    +
                    arr[3].toString('hex')
                ).toString('hex')
            ).toString('hex')
            +
            arr[4].toString('hex')
        ).toString('hex')
    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1], arr[2], arr[3], arr[4]]).getRootHash().toString('hex'));

    console.log('Sixth:');
    console.log(arr[0].toString("hex"), arr[1].toString("hex"), arr[2].toString("hex"), arr[3].toString("hex"), arr[4].toString("hex"), arr[5].toString("hex"), '\n',
        'Manually created root hash:\t\t',
        hash(
            hash(
                hash(
                    arr[0].toString('hex')
                    +
                    arr[1].toString('hex')
                ).toString('hex')
                +
                hash(
                    arr[2].toString('hex')
                    +
                    arr[3].toString('hex')
                ).toString('hex')
            ).toString('hex')
            +
            hash(
                arr[4].toString('hex')
                +
                arr[5].toString('hex')
            ).toString('hex')
        ).toString('hex')
    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]]).getRootHash().toString('hex'));

    console.log('Seventh:');
    console.log(arr[0].toString("hex"), arr[1].toString("hex"), arr[2].toString("hex"), arr[3].toString("hex"), arr[4].toString("hex"), arr[5].toString("hex"), arr[6].toString("hex"), '\n',
        'Manually created root hash:\t\t',
        hash(
            hash(
                hash(
                    arr[0].toString('hex')
                    +
                    arr[1].toString('hex')
                ).toString('hex')
                +
                hash(
                    arr[2].toString('hex')
                    +
                    arr[3].toString('hex')
                ).toString('hex')
            ).toString('hex')
            +
            hash(
                hash(
                    arr[4].toString('hex')
                    +
                    arr[5].toString('hex')    
                ).toString('hex')
                +
                arr[6].toString('hex')
            ).toString('hex')
        ).toString('hex')
    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6]]).getRootHash().toString('hex'));

    console.log('Eighth:');
    console.log(arr[0].toString("hex"), arr[1].toString("hex"), arr[2].toString("hex"), arr[3].toString("hex"), arr[4].toString("hex"), arr[5].toString("hex"), arr[6].toString("hex"), arr[7].toString("hex"), '\n',
        'Manually created root hash:\t\t',
        hash(
            hash(
                hash(
                    arr[0].toString('hex')
                    +
                    arr[1].toString('hex')
                ).toString('hex')
                +
                hash(
                    arr[2].toString('hex')
                    +
                    arr[3].toString('hex')
                ).toString('hex')
            ).toString('hex')
            +
            hash(
                hash(
                    arr[4].toString('hex')
                    +
                    arr[5].toString('hex')
                ).toString('hex')
                +
                hash(
                    arr[6].toString('hex')
                    +
                    arr[7].toString('hex')
                ).toString('hex')
            ).toString('hex')
        ).toString('hex')
    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7]]).getRootHash().toString('hex'));
}

// testMerkleTree();

exports.MerkleTree = MerkleTree;
