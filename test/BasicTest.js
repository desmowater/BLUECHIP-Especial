/*
ERC721基本機能のテスト
*/

const { expect } = require("chai");
const { ethers } = require("hardhat");
// fixturesを使うための関数import
const { loadFixture, time, mine } = require("@nomicfoundation/hardhat-network-helpers");

describe("デプロイ時設定の確認", function () {
    this.timeout(120000) // all tests in this suite get 120 seconds before timeout
    // セットアップ処理の内容を記載。デプロイやウォレット取得を行う
    async function deployNftFixture() {
        // デプロイ
        const bce = await ethers.getContractFactory("BlueChipEspecial");
        const bceToken = await bce.deploy();
        await bceToken.deployed();
        // ウォレット取得
        const [owner, admin, addr1] = await ethers.getSigners();
        // itから呼ばれた際に、返却する変数たちを定義
        return { bceToken, owner, admin, addr1 };
    }

    it("owner にDEFAULT_ADMIN_ROLEが付与されていること", async function () {
        // loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
        const { bceToken, owner, admin, addr1 } = await loadFixture(deployNftFixture);

        expect(await bceToken.connect(addr1)
            .hasRole("0x0000000000000000000000000000000000000000000000000000000000000000", owner.address))
            .to.be.true;
    });

    it("ADMIN が正しく付与されていること（一人だけ確認）", async function () {
        // loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
        const { bceToken, owner, admin, addr1 } = await loadFixture(deployNftFixture);

        expect(await bceToken.connect(addr1)
            .hasRole("0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42", "0x407211BeF7cbca2C8897C580EC16c80F2ad5c966"))
            .to.be.true;
    });

    it("一般ピーポーには ADMIN が付与されていないこと", async function () {
        // loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
        const { bceToken, owner, admin, addr1 } = await loadFixture(deployNftFixture);

        expect(await bceToken.connect(addr1)
            .hasRole("0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42", addr1.address))
            .to.be.false;
    });

    it("supportsInterfaceの確認-ERC721:0x80ac58cd", async function () {
        // loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
        const { bceToken, owner, admin, aladdr1, aladdr2, addr1 } = await loadFixture(deployNftFixture);

        // 確認
        expect(await bceToken.supportsInterface(0x80ac58cd)).to.be.true
    });

    it("supportsInterfaceの確認-ERC721Metadata:0x5b5e139f", async function () {
        // loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
        const { bceToken, owner, admin, aladdr1, aladdr2, addr1 } = await loadFixture(deployNftFixture);

        // 確認
        expect(await bceToken.supportsInterface(0x5b5e139f)).to.be.true
    });

    it("supportsInterfaceの確認-ERC165:0x01ffc9a7", async function () {
        // loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
        const { bceToken, owner, admin, aladdr1, aladdr2, addr1 } = await loadFixture(deployNftFixture);

        // 確認
        expect(await bceToken.supportsInterface(0x01ffc9a7)).to.be.true
    });


});

describe("ミント関数のテスト", function () {
    this.timeout(120000) // all tests in this suite get 120 seconds before timeout
    // セットアップ処理の内容を記載。デプロイやウォレット取得を行う
    async function deployNftFixture() {
        // デプロイ
        const bce = await ethers.getContractFactory("BlueChipEspecial");
        const bceToken = await bce.deploy();
        await bceToken.deployed();
        // ウォレット取得
        const [owner, admin, addr1] = await ethers.getSigners();
        // itから呼ばれた際に、返却する変数たちを定義
        return { bceToken, owner, admin, addr1 };
    }

    it("ADMIN が正しくミントできること", async function () {
        // loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
        const { bceToken, owner, admin, addr1 } = await loadFixture(deployNftFixture);

        // ADMINの設定
        await bceToken.connect(owner).grantRole(
            "0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42",
            admin.address
        );

        // ミント前に所持数がゼロであることを確認
        expect(await bceToken.connect(addr1).balanceOf(addr1.address)).to.equal(0);

        // ミント
        await bceToken.connect(admin).safeMint(addr1.address);

        // ミント後に所持数が1であることを確認
        expect(await bceToken.connect(addr1).balanceOf(addr1.address)).to.equal(1);

        // 渡ったtokenIdが0であることを確認
        expect(await bceToken.connect(addr1).ownerOf(0)).to.equal(addr1.address);

        // もう1枚ミント
        await bceToken.connect(admin).safeMint(addr1.address);

        // ミント後に所持数が2であることを確認
        expect(await bceToken.connect(addr1).balanceOf(addr1.address)).to.equal(2);

        // 渡ったtokenIdが1であることを確認
        expect(await bceToken.connect(addr1).ownerOf(1)).to.equal(addr1.address);

    });

    it("一般ピーポーはミントできないこと", async function () {
        // loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
        const { bceToken, owner, admin, addr1 } = await loadFixture(deployNftFixture);

        // ミント
        expect(bceToken.connect(addr1).safeMint(addr1.address))
            .to.be.revertedWith(`AccessControl: account ${addr1.address} is missing role 0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42`);

    });

    it("owner=DEFAULT_ADMIN_ROLEと言えども、ADMINでなければミントできないこと", async function () {
        // loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
        const { bceToken, owner, admin, addr1 } = await loadFixture(deployNftFixture);

        // ミント
        expect(bceToken.connect(owner).safeMint(owner.address))
            .to.be.revertedWith(`AccessControl: account ${owner.address} is missing role 0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42`);

    });

});

describe("setTokenURI 関数のテスト", function () {
    this.timeout(120000) // all tests in this suite get 120 seconds before timeout
    // セットアップ処理の内容を記載。デプロイやウォレット取得を行う
    async function deployNftFixture() {
        // デプロイ
        const bce = await ethers.getContractFactory("BlueChipEspecial");
        const bceToken = await bce.deploy();
        await bceToken.deployed();
        // ウォレット取得
        const [owner, admin, addr1] = await ethers.getSigners();
        // itから呼ばれた際に、返却する変数たちを定義
        return { bceToken, owner, admin, addr1 };
    }

    it("ADMIN が tokenURI を正しくセットできること", async function () {
        // loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
        const { bceToken, owner, admin, addr1 } = await loadFixture(deployNftFixture);

        // ADMINの設定
        await bceToken.connect(owner).grantRole(
            "0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42",
            admin.address
        );

        // 2枚ミント(tokenId = 0, 1)
        await bceToken.connect(admin).safeMint(addr1.address);
        await bceToken.connect(admin).safeMint(addr1.address);

        // setTokenURI 前は何も入ってないことの確認
        expect(await bceToken.connect(addr1).tokenURI(0)).to.equal("");
        expect(await bceToken.connect(addr1).tokenURI(1)).to.equal("");

        // setTokenURI をセット
        await bceToken.connect(admin).setTokenURI(0, "ipfs://URIforTokenId0");
        await bceToken.connect(admin).setTokenURI(1, "ipfs://URIforTokenId1");

        // setTokenURI が正しくセットされたことの確認
        expect(await bceToken.connect(addr1).tokenURI(0)).to.equal("ipfs://URIforTokenId0");
        expect(await bceToken.connect(addr1).tokenURI(1)).to.equal("ipfs://URIforTokenId1");

    });

    it("一般ピーポーは tokenURI を変更できないこと", async function () {
        // loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
        const { bceToken, owner, admin, addr1 } = await loadFixture(deployNftFixture);

        // ADMINの設定
        await bceToken.connect(owner).grantRole(
            "0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42",
            admin.address
        );

        // 1枚ミント(tokenId = 0)
        await bceToken.connect(admin).safeMint(addr1.address);

        // setTokenURI をセットしようとする
        expect(bceToken.connect(addr1).setTokenURI(0, "ipfs://URIforTokenId0"))
            .to.be.revertedWith(`AccessControl: account ${owner.address} is missing role 0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42`);

    });
});

describe("safeTransferFrom 関数のテスト", function () {
    this.timeout(120000) // all tests in this suite get 120 seconds before timeout
    // セットアップ処理の内容を記載。デプロイやウォレット取得を行う
    async function deployNftFixture() {
        // デプロイ
        const bce = await ethers.getContractFactory("BlueChipEspecial");
        const bceToken = await bce.deploy();
        await bceToken.deployed();
        // ウォレット取得
        const [owner, admin, addr1] = await ethers.getSigners();
        // itから呼ばれた際に、返却する変数たちを定義
        return { bceToken, owner, admin, addr1 };
    }

    it("safeTransferFrom が 動くこと", async function () {
        // loadFixtureを通して、セットアップ処理をたたき、各種変数を取得
        const { bceToken, owner, admin, addr1 } = await loadFixture(deployNftFixture);

        // ADMINの設定
        await bceToken.connect(owner).grantRole(
            "0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42",
            admin.address
        );

        // 2枚ミント(tokenId = 0, 1)
        await bceToken.connect(admin).safeMint(addr1.address);
        await bceToken.connect(admin).safeMint(addr1.address);

        // safeTransferFrom
        await bceToken.connect(addr1)["safeTransferFrom(address,address,uint256)"](addr1.address, admin.address, 0);
        //        contract["safeTransferFrom(address,address,uint256)"](addr1, addr2, 1);
    });

});
