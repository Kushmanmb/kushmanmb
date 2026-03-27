![Kushmanmb's GitHub Banner](https://raw.githubusercontent.com/Kushmanmb/Kushmanmb/main/banner.png)

# Proving PDFs in ZKP

This repository contains tools for verifying PDF documents within zero-knowledge proof systems.
Learn more in this blog post: https://pse.dev/blog/zkpdf-unlocking-verifiable-data

## Why?

Sometimes you need to prove that:

- A PDF is **signed by a trusted authority**
- A specific **text appears on a given page** without revealing the entire document.

This repo enables such proving capability using SP1-based circuits.

## Structure

- **[pdf-utils/](pdf-utils/)** – Rust crates for:
  - Validating PKCS#7 signatures (RSA-SHA256)
  - Extracting Unicode text from PDF streams
  - WebAssembly bindings for browser integration
- **[circuits/](circuits/)** – SP1-compatible zero-knowledge circuits for signature and text proofs
- **[app/](app/)** – Minimal React frontend to demo proof generation and verification

## Documentation

- **[PDF Utils](pdf-utils/README.md)** - Core PDF processing libraries
- **[Circuits](circuits/README.md)** - Zero-knowledge proof circuits
- **[Circuit Library](circuits/lib/README.md)** -  Complete PDF verification library API
- **[Extractor](pdf-utils/extractor/README.md)** - PDF text extraction
- **[Signature Validator](pdf-utils/signature-validator/README.md)** - Digital signature verification
- **[Core Library](pdf-utils/core/README.md)** - Combined PDF verification
- **[WASM Bindings](pdf-utils/wasm/README.md)** - Browser-compatible API

## Installation

Add the PDF verification library to your Rust project:

```toml
[dependencies]
zkpdf-lib = { git = "https://github.com/Kushmanmb/kushmanmb", branch = "main", subdir = "circuits/lib" }
```

## Quick Start

```rust
use zkpdf_lib::{verify_pdf_claim, PDFCircuitInput};

// Create input for PDF verification
let input = PDFCircuitInput {
    pdf_bytes: pdf_data,
    page_number: 0,
    offset: 100,
    substring: "Important Document".to_string(),
};

// Verify PDF
let result = verify_pdf_claim(input)?;
```

## How it Works

1. **Parse the PDF** using pure Rust (no OpenSSL or C deps)
2. **Generate a zk proof** using SP1 circuits
3. **Verify** the proof on-chain or off-chain

## Setup

Follow these steps to run the prover API and the demo frontend.

### Requirements

- [Rust](https://rustup.rs/)
- [Node.js 18+](https://nodejs.org/)
- [SP1](https://docs.succinct.xyz/docs/sp1/getting-started/install)

### 1. Clone the Repository

```bash
git clone git@github.com:Kushmanmb/kushmanmb
cd kushmanmb
```

### 2. Run the Prover API

Start the prover service from the `circuits/script` directory. If you have access to the Succinct Prover Network, export your API key and run:

```bash
cd circuits/script
SP1_PROVER=network \
NETWORK_PRIVATE_KEY=<PROVER_NETWORK_KEY> \
RUST_LOG=info \
cargo run --release --bin prover
```

This will start the prover API on port **3001**.

> **Note:** If you don’t have access to the Succinct Prover Network, you can omit the environment variables to run the prover locally. (This will take longer.)
>
> For local proof generation, refer to `scripts/evm.rs` or run:

```bash
RUST_LOG=info cargo run --release --bin evm -- --system groth16
```

### 3. Run the Frontend

In a separate terminal, build the WASM module and start the Next.js app:

```bash
# Build WASM module (requires Rust + wasm-pack)
cd pdf-utils/wasm && ./generate_wasm.sh && cd ../../app

# Start the frontend
yarn install
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the interface.

https://github.com/user-attachments/assets/

## Use Cases

- Prove that a document is signed without showing its contents
- Selectively reveal fields from government-issued certificates
- Use verified document facts in smart contracts

## Smart Contract

The on-chain verifier contract is located at
[`circuits/contracts/src/PdfVerifier.sol`](circuits/contracts/src/PdfVerifier.sol).

It exposes a single entry-point:

```solidity
function verifyPdfProof(
    bytes calldata _publicValues,
    bytes calldata _proofBytes
) external returns (PublicValuesStruct memory publicValues);
```

Where `PublicValuesStruct` carries five attested fields:

| Field | Type | Description |
|-------|------|-------------|
| `substringMatches` | `bool` | True when the substring was found at the given page/offset |
| `messageDigestHash` | `bytes32` | keccak256 of the PDF's PKCS#7 message digest |
| `signerKeyHash` | `bytes32` | keccak256 of the signer's RSA public key |
| `substringHash` | `bytes32` | keccak256 of the queried substring |
| `nullifier` | `bytes32` | Domain-separated nullifier preventing proof replay |

### Verifying the Contract on Etherscan

See [`circuits/contracts/README.md`](circuits/contracts/README.md) for full
deployment and Etherscan verification instructions.

## Security

### Audit Summary

A code security audit was performed covering the Solidity contract, Rust
circuit library, and prover/verifier scripts. The following issues were
identified and remediated:

| # | Severity | Location | Issue | Status |
|---|----------|----------|-------|--------|
| 1 | **High** | `PdfVerifier.sol` | `PublicValuesStruct` had only `bool result` — mismatched ABI would cause incorrect decoding of all proof outputs | ✅ Fixed |
| 2 | **High** | `PdfVerifier.sol` | `verifyPdfProof` returned `bool` instead of `PublicValuesStruct` — callers had no access to hashes or nullifier | ✅ Fixed |
| 3 | **Medium** | `PdfVerifier.sol` | No zero-address check on `_verifier` constructor argument — `address(0)` would make all proof calls silently succeed | ✅ Fixed |
| 4 | **Medium** | `PdfVerifier.sol` | `verifier` and `programVKey` were mutable storage variables — a compromised deployer key could swap the verifier for a malicious contract | ✅ Fixed (marked `immutable`) |
| 5 | **Low** | `PdfVerifier.sol` | No events emitted — on-chain verification activity was unmonitorable | ✅ Fixed (`PdfProofVerified` event added) |
| 6 | **Low** | `PdfVerifier.t.sol` | Test file referenced undefined struct fields and mismatched return type causing test suite to not compile | ✅ Fixed |
| 7 | **Info** | `foundry.toml` | No Etherscan API configuration — contract verification required manual CLI flags | ✅ Fixed |

> **Responsible Disclosure:** To report a security vulnerability, please
> e-mail **security@example.com** (also declared via `@custom:security-contact`
> in the contract NatSpec).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
