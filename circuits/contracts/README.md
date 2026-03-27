# SP1 Project Template Contracts

This is a template for writing a contract that uses verification of [SP1](https://github.com/succinctlabs/sp1) PlonK proofs onchain using the [SP1VerifierGateway](https://github.com/succinctlabs/sp1-contracts/blob/main/contracts/src/SP1VerifierGateway.sol).

## Requirements

- [Foundry](https://book.getfoundry.sh/getting-started/installation)

## Test

```sh
forge test -v
```

## Deployment

#### Step 1: Set the `VERIFIER` environment variable

Find the address of the `verifier` to use from the [deployments](https://github.com/succinctlabs/sp1-contracts/tree/main/contracts/deployments) list for the chain you are deploying to. Set it to the `VERIFIER` environment variable, for example:

```sh
VERIFIER=0x3B6041173B80E77f038f3F2C0f9744f04837185e
```

Note: you can use either the [SP1VerifierGateway](https://github.com/succinctlabs/sp1-contracts/blob/main/contracts/src/SP1VerifierGateway.sol) or a specific version, but it is highly recommended to use the gateway as this will allow you to use different versions of SP1.

#### Step 2: Set the `PROGRAM_VKEY` environment variable

Find your program verification key by going into the `../script` directory and running `RUST_LOG=info cargo run --package zkpdf-script --bin vkey --release`, which will print an output like:

> Program Verification Key: 0x00620892344c310c32a74bf0807a5c043964264e4f37c96a10ad12b5c9214e0e

Then set the `PROGRAM_VKEY` environment variable to the output of that command, for example:

```sh
PROGRAM_VKEY=0x00620892344c310c32a74bf0807a5c043964264e4f37c96a10ad12b5c9214e0e
```

#### Step 3: Deploy the contract

Fill out the rest of the details needed for deployment:

```sh
RPC_URL=...
```

```sh
PRIVATE_KEY=...
```

Then deploy the contract to the chain:

```sh
forge create src/PdfVerifier.sol:PdfVerifier \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args $VERIFIER $PROGRAM_VKEY
```

## Etherscan Verification

Verifying the deployed contract on Etherscan allows anyone to inspect the
source code and ABI directly from the block explorer.

#### Option A: Verify at deploy time (recommended)

Pass `--verify` together with your Etherscan API key when deploying:

```sh
forge create src/PdfVerifier.sol:PdfVerifier \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args $VERIFIER $PROGRAM_VKEY \
  --verify \
  --verifier etherscan \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

#### Option B: Verify an already-deployed contract

If the contract is already deployed, provide its address and the constructor
arguments used at deployment:

```sh
forge verify-contract \
  --chain-id 1 \
  --constructor-args $(cast abi-encode "constructor(address,bytes32)" $VERIFIER $PROGRAM_VKEY) \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  <DEPLOYED_CONTRACT_ADDRESS> \
  src/PdfVerifier.sol:PdfVerifier
```

Replace `--chain-id 1` with `11155111` for Sepolia.

> **Tip:** `ETHERSCAN_API_KEY` can also be set permanently in `foundry.toml`
> under `[etherscan]` (already configured for `mainnet` and `sepolia`).

