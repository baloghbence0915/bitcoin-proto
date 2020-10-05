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
                    newHighestLevel.push(hash(highestLevel[i] + highestLevel[i + 1]));
                } else {
                    // Fallback for odd leaves
                    newHighestLevel.push(highestLevel[i]);
                }
            }
            levels.push(newHighestLevel);
        }

        return levels[levels.length - 1][0].toString('hex');
    }
}

function testMerkleTree() {
    const arr = [Buffer.from([1, 255]).toString('hex'), Buffer.from([255, 1]).toString('hex'), Buffer.from([255, 255]).toString('hex'), Buffer.from([1, 1]).toString('hex'), Buffer.from([127, 127]).toString('hex'), Buffer.from([0, 127]).toString('hex'), Buffer.from([127, 0]).toString('hex'), Buffer.from([127, 255]).toString('hex')];

    console.log('First:');
    console.log(arr[0], '\n',
        'Manually created root hash:\t\t',
        arr[0]
    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0]]).getRootHash());

    console.log('Second:');
    console.log(arr[0], arr[1], '\n',
        'Manually created root hash:\t\t',
        hash(
            arr[0]
            +
            arr[1]
        ).toString('hex')
    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1]]).getRootHash());

    console.log('Third:');
    console.log(arr[0], arr[1], arr[2], '\n',
        'Manually created root hash:\t\t',
        hash(
            hash(
                arr[0]
                +
                arr[1]
            )
            +
            arr[2]
        ).toString('hex')

    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1], arr[2]]).getRootHash());

    console.log('Fourth:');
    console.log(arr[0], arr[1], arr[2], arr[3], '\n',
        'Manually created root hash:\t\t',
        hash(
            hash(
                arr[0]
                +
                arr[1]
            )
            +
            hash(
                arr[2]
                +
                arr[3]
            )
        ).toString('hex')

    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1], arr[2], arr[3]]).getRootHash());

    console.log('Fifth:');
    console.log(arr[0], arr[1], arr[2], arr[3], arr[4], '\n',
        'Manually created root hash:\t\t',
        hash(
            hash(
                hash(
                    arr[0]
                    +
                    arr[1]
                )
                +
                hash(
                    arr[2]
                    +
                    arr[3]
                )
            )
            +
            arr[4]
        ).toString('hex')
    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1], arr[2], arr[3], arr[4]]).getRootHash());

    console.log('Sixth:');
    console.log(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], '\n',
        'Manually created root hash:\t\t',
        hash(
            hash(
                hash(
                    arr[0]
                    +
                    arr[1]
                )
                +
                hash(
                    arr[2]
                    +
                    arr[3]
                )
            )
            +
            hash(
                arr[4]
                +
                arr[5]
            )
        ).toString('hex')
    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]]).getRootHash());

    console.log('Seventh:');
    console.log(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], '\n',
        'Manually created root hash:\t\t',
        hash(
            hash(
                hash(
                    arr[0]
                    +
                    arr[1]
                )
                +
                hash(
                    arr[2]
                    +
                    arr[3]
                )
            )
            +
            hash(
                hash(
                    arr[4]
                    +
                    arr[5]    
                )
                +
                arr[6]
            )
        ).toString('hex')
    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6]]).getRootHash());

    console.log('Eighth:');
    console.log(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7], '\n',
        'Manually created root hash:\t\t',
        hash(
            hash(
                hash(
                    arr[0]
                    +
                    arr[1]
                )
                +
                hash(
                    arr[2]
                    +
                    arr[3]
                )
            )
            +
            hash(
                hash(
                    arr[4]
                    +
                    arr[5]
                )
                +
                hash(
                    arr[6]
                    +
                    arr[7]
                )
            )
        ).toString('hex')
    );
    console.log('Pragmatically created root hash:\t', new MerkleTree([arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7]]).getRootHash());
}

// testMerkleTree();

exports.MerkleTree = MerkleTree;
