// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISP1Verifier} from "@sp1-contracts/ISP1Verifier.sol";

/// @notice Public values committed by the zkPDF SP1 program.
/// @dev    ABI-encoded by the circuit and decoded here for on-chain consumption.
///         Layout must exactly match the `PublicValuesStruct` defined in the
///         Rust circuit library (`circuits/lib/src/types.rs`).
/// @param substringMatches  True when the queried substring was found at the
///                          specified page and offset inside the PDF.
/// @param messageDigestHash keccak256 of the PDF's PKCS#7 message digest field.
/// @param signerKeyHash     keccak256 of the signer's RSA public-key bytes.
/// @param substringHash     keccak256 of the queried substring bytes.
/// @param nullifier         Domain-separated nullifier that uniquely identifies
///                          this (document, substring, page, offset) tuple,
///                          preventing proof replay.
struct PublicValuesStruct {
    bool    substringMatches;
    bytes32 messageDigestHash;
    bytes32 signerKeyHash;
    bytes32 substringHash;
    bytes32 nullifier;
}

/// @title  PdfVerifier
/// @author zkPDF Contributors
/// @notice On-chain verifier for zkPDF SP1 proofs.  Given a valid proof, it
///         attests that a substring appears at a given page/offset inside a
///         PDF that carries a valid PKCS#7 digital signature.
/// @dev    Wraps the SP1VerifierGateway and ABI-decodes the five public values
///         committed by the zkPDF program.  Both `verifier` and `programVKey`
///         are immutable after construction to prevent privilege-escalation
///         attacks that could swap the verifier for a malicious contract.
/// @custom:security-contact security@example.com
contract PdfVerifier {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice Address of the on-chain SP1 verifier contract (gateway or a
    ///         specific version).  Immutable after deployment.
    address public immutable verifier;

    /// @notice Verification key that uniquely identifies the zkPDF program
    ///         binary.  Immutable after deployment.
    bytes32 public immutable programVKey;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted each time a PDF proof is successfully verified.
    /// @param nullifier         Unique nullifier committed in the proof.
    ///                          Indexed so callers can efficiently filter for
    ///                          a specific document/substring combination.
    /// @param signerKeyHash     Hash of the signer's public key.
    /// @param substringHash     Hash of the proven substring.
    /// @param substringMatches  True when the substring was found.
    event PdfProofVerified(
        bytes32 indexed nullifier,
        bytes32 indexed signerKeyHash,
        bytes32         substringHash,
        bool            substringMatches
    );

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /// @notice Deploy the PdfVerifier contract.
    /// @dev    Reverts if `_verifier` is the zero address to prevent a
    ///         misconfiguration where proof calls silently succeed without
    ///         real verification.
    /// @param _verifier    Address of the SP1VerifierGateway (non-zero).
    /// @param _programVKey Verification key for the zkPDF SP1 program.
    constructor(address _verifier, bytes32 _programVKey) {
        require(_verifier != address(0), "PdfVerifier: zero verifier address");
        verifier    = _verifier;
        programVKey = _programVKey;
    }

    // -------------------------------------------------------------------------
    // Core logic
    // -------------------------------------------------------------------------

    /// @notice Verify a zkPDF SP1 proof and return the attested public values.
    /// @dev    Delegates proof verification to the SP1 verifier gateway, then
    ///         ABI-decodes and emits the public values.  Reverts if the proof
    ///         is invalid (the gateway will revert internally).
    /// @param _publicValues ABI-encoded {PublicValuesStruct} committed by the
    ///                      zkPDF SP1 program.
    /// @param _proofBytes   Encoded SP1 proof bytes (Groth16 or PLONK).
    /// @return publicValues The decoded public values attested by the proof.
    function verifyPdfProof(
        bytes calldata _publicValues,
        bytes calldata _proofBytes
    ) external returns (PublicValuesStruct memory publicValues) {
        ISP1Verifier(verifier).verifyProof(
            programVKey,
            _publicValues,
            _proofBytes
        );

        publicValues = abi.decode(_publicValues, (PublicValuesStruct));

        emit PdfProofVerified(
            publicValues.nullifier,
            publicValues.signerKeyHash,
            publicValues.substringHash,
            publicValues.substringMatches
        );
    }
}
