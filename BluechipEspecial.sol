// SPDX-License-Identifier: MIT

//////////////////////////////////////////////////////////////////////
//                                                                  //
//   ██████╗░██╗░░░░░██╗░░░██╗███████╗░█████╗░██╗░░██╗██╗██████╗░   //
//   ██╔══██╗██║░░░░░██║░░░██║██╔════╝██╔══██╗██║░░██║██║██╔══██╗   //
//   ██████╦╝██║░░░░░██║░░░██║█████╗░░██║░░╚═╝███████║██║██████╔╝   //
//   ██╔══██╗██║░░░░░██║░░░██║██╔══╝░░██║░░██╗██╔══██║██║██╔═══╝░   //
//   ██████╦╝███████╗╚██████╔╝███████╗╚█████╔╝██║░░██║██║██║░░░░░   //
//   ╚═════╝░╚══════╝░╚═════╝░╚══════╝░╚════╝░╚═╝░░╚═╝╚═╝╚═╝░░░░░   //
//                                                                  //
//             BluechipEspecial contract by desmowater              //
//                                                                  //
//////////////////////////////////////////////////////////////////////

pragma solidity >=0.7.0 <0.9.0;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract BluechipEspecial is ERC721A, Ownable, ERC2981 {

    string public baseURI;
    string public baseExtension = ".json";
    uint256 public constant MAX_SUPPLY = 20;
//    bool internal paused = false;
    address public admin = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    uint96 public feeNumerator = 1000; //10000 = fee1%

    constructor(
    ) ERC721A('BLUECHIP Especial', 'BCE') {
        setBaseURI('https://....');
        _setDefaultRoyalty(admin, feeNumerator);
    }

    // only owner and admin can mint
    function mint(uint256 _mintAmount) public {
//        require(!paused, "the contract is paused");
        require(owner() == _msgSender() || admin == _msgSender(), "caller is not owner or admin");
        require(_mintAmount > 0, "need to mint at least 1 NFT");
        uint256 supply = totalSupply();
        require(supply + _mintAmount <= MAX_SUPPLY, "max NFT limit exceeded");

        _safeMint(msg.sender, _mintAmount);
    }

    // public

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory){
        return string(abi.encodePacked(ERC721A.tokenURI(tokenId), baseExtension));
    }

    // The following function is override required by ERC2981.sol.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721A, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


    //only owner

    function setAdmin(address _newAdmin) public onlyOwner {
        admin = _newAdmin;
    }  

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
        baseExtension = _newBaseExtension;
    }

    function setRoyaltyInfo(address _receiver, uint96 _feeNumerator) public onlyOwner {
        _setDefaultRoyalty(_receiver, _feeNumerator);
    }

/*ownerとadminしかミントできないので、pauseは不要？

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }
*/

/*ミントはpayableにしていないので、withdrawは不要？

    // withdraw is available only to admin wallet

    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(admin).call{value: address(this).balance}('');
        require(os);
    }
*/

    // internal

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;        
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

}