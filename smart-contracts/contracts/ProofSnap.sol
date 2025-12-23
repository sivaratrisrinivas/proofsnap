// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProofSnap {
    struct Proof {
        bytes32 contentHash;    // SHA-256 hash of the pixel data
        uint256 timestamp;      // Unix timestamp of capture
        address creator;        // Wallet address of the photographer
        string locationData;    // Encrypted lat/long (optional)
        string deviceId;        // Hashed device identifier
    }

    // contentHash => Proof
    mapping(bytes32 => Proof) private proofs;

    event MediaRegistered(
        bytes32 indexed contentHash,
        address indexed creator,
        uint256 timestamp,
        string locationData,
        string deviceId
    );

    function registerMedia(
        bytes32 _contentHash,
        string calldata _locationData,
        string calldata _deviceId
    ) external {
        // Prevent overwriting an existing proof
        require(proofs[_contentHash].timestamp == 0, "Proof already exists");

        Proof memory proof = Proof({
            contentHash: _contentHash,
            timestamp: block.timestamp,
            creator: msg.sender,
            locationData: _locationData,
            deviceId: _deviceId
        });

        proofs[_contentHash] = proof;

        emit MediaRegistered(
            _contentHash,
            msg.sender,
            block.timestamp,
            _locationData,
            _deviceId
        );
    }

    function getProof(bytes32 _contentHash)
        external
        view
        returns (Proof memory)
    {
        return proofs[_contentHash];
    }

    function proofExists(bytes32 _contentHash) external view returns (bool) {
        return proofs[_contentHash].timestamp != 0;
    }
}
