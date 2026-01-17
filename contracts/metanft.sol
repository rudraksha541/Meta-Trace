// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MetaTraceNFT {
    string public name = "MetaTraceNFT";
    string public symbol = "MTNFT";
    address public owner;
    uint256 public totalSupply;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => string) private _tokenURIs;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    constructor() {
        owner = msg.sender;
    }

    function mint(address to, string memory uri) external onlyOwner returns (uint256) {
        totalSupply += 1;
        uint256 tokenId = totalSupply;

        ownerOf[tokenId] = to;
        balanceOf[to] += 1;
        _tokenURIs[tokenId] = uri;

        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }
}
