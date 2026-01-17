// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract JSONMetadataStorage {
    // Mapping from token ID to JSON string
    mapping(uint256 => string) private _metadata;

    // Store raw JSON string
    function storeMetadata(uint256 tokenId, string memory jsonData) public {
        _metadata[tokenId] = jsonData;
    }

    // Retrieve stored JSON
    function getMetadata(uint256 tokenId) public view returns (string memory) {
        return _metadata[tokenId];
    }
}