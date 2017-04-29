var ECVerify = artifacts.require("./ECVerify.sol");
var StateChannels = artifacts.require("./StateChannels.sol");
var ConvertLib = artifacts.require("./ConvertLib.sol");
var MetaCoin = artifacts.require("./MetaCoin.sol");

module.exports = function(deployer) {
      deployer.deploy(ECVerify);
      deployer.link(ECVerify, StateChannels);
      deployer.deploy(StateChannels);

      deployer.deploy(ConvertLib);
      deployer.link(ConvertLib, MetaCoin);
      deployer.deploy(MetaCoin);
};
