const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        // First, we generate the proof and the public signals from an input.
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        // Outputs the correct statement of the proof.
        console.log('1x2 =',publicSignals[0]);

        // Converts the proof and public signals to BigInt.
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        // Generates call parameters to be called
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        
        // Splits the calldata into an array
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        // Assigns the content of the calldata array to the corresponding input
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // Verifies the proof from the inputs. Returns true if the true is valid.
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        // We assign incorrect values to determine if the verifyProof() function will correctly validate the proof
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]

        // Verifies the proof. It should return false because of the invalid parameters 
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    // This performs the same steps as the previous code block
    
    let verifier;
    let Verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();

    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a": 2, "b": 5, "c": 3}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/Multiplier3/circuit_final.zkey");

        console.log("2x5x3 =", publicSignals[0]);

        const editedProof = unstringifyBigInts(proof);
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, input)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0];

        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {
    
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here

        // Generates the Contract Factory for the smart contract
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        // Deploys the smart contract
        verifier = await Verifier.deploy();
        // Verifies the deployment of the smart contract
        await verifier.deployed();

    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a": 4, "b": 3, "c": 8}, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/Multiplier3_plonk/circuit_final.zkey");

        console.log("4x3x8 =", publicSignals[0]);

        const editedProof = unstringifyBigInts(proof);
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);

        const argv = calldata.replace(/["[\]\s]/g, "").split(",");

        // Converts argv[1] to BigInt
        const argv2 = [BigInt(argv[1])];
        
        // Verifies the proof.
        expect( await verifier.verifyProof(argv[0], argv2)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = 0x7980;
        let b = [4];

        expect( await verifier.verifyProof(a, b)).to.be.false;
    });
});