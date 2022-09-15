const { expect } = require("chai");
const { ethers } = require("hardhat");

// fixturesを使うための関数import
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("BluechipEspecialのテスト", function () {

  // セットアップ処理の内容を記載。デプロイやウォレット取得を行う
  async function deployNftFixture() {
    const nft = await ethers.getContractFactory("BluechipEspecial");

    const [owner, admin, externalUser] = await ethers.getSigners();

    const contract = await nft.deploy();
    await contract.deployed();

    // itから呼ばれた際に、返却する変数たちを定義
    return { nft, contract, owner, admin, externalUser };
  }

  it("ownerとadminはmintできるが、他のウォレットはできない", async function () {
    const { contract, owner, admin, externalUser } = await loadFixture(deployNftFixture);

    await contract.connect(owner).mint(1);
    expect(await contract.balanceOf(owner.address)).to.equal(1);

    await contract.setAdmin(admin.address);
    await contract.connect(admin).mint(1);
    expect(await contract.balanceOf(admin.address)).to.equal(1);

    await expect(contract.connect(externalUser).mint(1)).to.be.revertedWith('caller is not owner or admin');
  });

  it("ownerは1未満やMAX_SUPPLYを超えたミントをできない", async function () {
    const { contract, owner } = await loadFixture(deployNftFixture);

    await expect(contract.connect(owner).mint(0)).to.be.revertedWith('need to mint at least 1 NFT');

    const MAX_SUPPLY = await contract.MAX_SUPPLY();
    await contract.connect(owner).mint(MAX_SUPPLY - 1);
    await contract.connect(owner).mint(1);
    await expect(contract.connect(owner).mint(1)).to.be.revertedWith('max NFT limit exceeded');

    expect(await contract.balanceOf(owner.address)).to.equal(MAX_SUPPLY);
  });

  it("adminは1未満やMAX_SUPPLYを超えたミントをできない", async function () {
    const { contract, admin } = await loadFixture(deployNftFixture);

    await contract.setAdmin(admin.address);

    await expect(contract.connect(admin).mint(0)).to.be.revertedWith('need to mint at least 1 NFT');

    const MAX_SUPPLY = await contract.MAX_SUPPLY();
    await contract.connect(admin).mint(MAX_SUPPLY - 1);
    await contract.connect(admin).mint(1);
    await expect(contract.connect(admin).mint(1)).to.be.revertedWith('max NFT limit exceeded');

    expect(await contract.balanceOf(admin.address)).to.equal(MAX_SUPPLY);
  });

/*
  it("pausedではミントできない", async function () {
    const { contract, owner, admin } = await loadFixture(deployNftFixture);

    await contract.pause(true);
    await contract.setAdmin(admin.address);

    await expect(contract.connect(owner).mint(1)).to.be.revertedWith('the contract is paused');
    await expect(contract.connect(admin).mint(1)).to.be.revertedWith('the contract is paused');
  });
*/

  it("onlyOwner関数の動作チェック", async function () {
    const { contract, externalUser } = await loadFixture(deployNftFixture);

    await expect(contract.connect(externalUser).setAdmin(externalUser.address)).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setBaseURI("")).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setBaseExtension("")).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setRoyaltyInfo(externalUser.address, 1000)).to.be.revertedWith('Ownable: caller is not the owner');
    //    await expect(contract.connect(externalUser).pause(false)).to.be.revertedWith('Ownable: caller is not the owner');
    //    await expect(contract.connect(externalUser).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('tokenIdが1から始まっていることの確認', async function () {
    const { contract, owner } = await loadFixture(deployNftFixture);

    await contract.connect(owner).mint(1);
    // ERC721A uses token IDs starting from 0 internally...
    expect(contract.ownerOf(0)).to.be.reverted;
    expect(await contract.ownerOf(1)).to.equal(owner.address);
  });

  it("transferOwnershipの動作確認", async function () {
    const { contract, owner, admin, externalUser } = await loadFixture(deployNftFixture);

    await contract.connect(owner).transferOwnership(externalUser.address);

    //新しいownerがミントできることの確認
    expect(await contract.balanceOf(externalUser.address)).to.equal(0);
    await contract.connect(externalUser).mint(1);
    expect(await contract.balanceOf(externalUser.address)).to.equal(1);

    //古いオーナーがミントできないことの確認
    await expect(contract.connect(owner).mint(1)).to.be.revertedWith('caller is not owner or admin');
    expect(await contract.balanceOf(owner.address)).to.equal(0);

    //新しいownerがonlyOwner関数を叩ける＆adminがミントできることの確認
    await contract.connect(externalUser).setAdmin(admin.address);
    await contract.connect(admin).mint(1);
    expect(await contract.balanceOf(admin.address)).to.equal(1);
  });

});