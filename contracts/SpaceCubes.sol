//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract SpaceCubes is ERC721Enumerable, Ownable {
  using SafeMath for uint256;
  using Counters for Counters.Counter;
  mapping(address => bool) whitelistedAddresses;
  
  Counters.Counter private _tokenIds;
  
  uint public constant MAX_SUPPLY = 999;
  uint public constant PRICE = 20 ether;
  uint public constant MAX_PER_MINT = 5;
  
  string public baseTokenURI;
  
  constructor(string memory baseURI) ERC721("SpaceCubes", "CUBE") {
    setBaseURI(baseURI);
  }
  
  function _baseURI() internal view virtual override returns (string memory) {
    return baseTokenURI;
  }
  
  function setBaseURI(string memory _baseTokenURI) public onlyOwner {
    baseTokenURI = _baseTokenURI;
  }
  
  function mintNFTs(uint _count) public payable {
    uint totalMinted = _tokenIds.current();

    require(totalMinted.add(_count) <= MAX_SUPPLY, "Not enough NFTs left!");
    require(_count >0 && _count <= MAX_PER_MINT, "Cannot mint specified number of NFTs.");

    if (!isWhitelisted(msg.sender)) {
      require(msg.value >= PRICE.mul(_count), "Not enough ether to purchase NFTs.");
    }

    for (uint i = 0; i < _count; i++) {
      _mintSingleNFT();
    }
  }
  
  function _mintSingleNFT() private {
    uint newTokenID = _tokenIds.current();
    _safeMint(msg.sender, newTokenID);
    _tokenIds.increment();
  }

  function isWhitelisted(address _user) public view returns (bool) {
    return whitelistedAddresses[_user];
  }

  function whitelistUsers(address[] memory addresses) public onlyOwner {
    for (uint256 i = 0; i < addresses.length; i++) {
      whitelistedAddresses[addresses[i]] = true;
    }
  }

  function giftNFTs(uint256 _mintAmount, address destination) public onlyOwner {
    uint totalMinted = _tokenIds.current();

    require(_mintAmount > 0, "need to mint at least 1 NFT");
    require(totalMinted.add(_mintAmount) <= MAX_SUPPLY, "Not enough NFTs left!");

    for (uint i = 0; i < _mintAmount; i++) {
      uint newTokenID = _tokenIds.current();
      _safeMint(destination, newTokenID);
      _tokenIds.increment();
    }
  }
  
  function tokensOfOwner(address _owner) external view returns (uint[] memory) {
    uint tokenCount = balanceOf(_owner);
    uint[] memory tokensId = new uint256[](tokenCount);

    for (uint i = 0; i < tokenCount; i++) {
      tokensId[i] = tokenOfOwnerByIndex(_owner, i);
    }
    return tokensId;
  }
  
  function withdraw() public payable onlyOwner {
    uint balance = address(this).balance;
    require(balance > 0, "No ether left to withdraw");

    (bool success, ) = (msg.sender).call{value: balance}("");
    require(success, "Transfer failed.");
  }
}