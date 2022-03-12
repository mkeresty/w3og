// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MYERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public _maxSupply = 100;

    constructor() ERC721("My ERC721", "MY721") {}

    function mint(uint256 count) public {
        uint i = 0;
        for(i=0; i< count; i++){
          require(_tokenIds.current() < _maxSupply, "Cannot mint above max supply");
          _tokenIds.increment();
          _mint(msg.sender, _tokenIds.current());
        }
    }
    
    function totalSupply() public view returns (uint256){
      return _tokenIds.current();
    }
}
