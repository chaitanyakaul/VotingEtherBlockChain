var Ny = artifacts.require("./Ny.sol");
var someSeriousStuff = artifacts.require("./someSeriousStuff.sol");
module.exports = function(deployer) {
  deployer.deploy(someSeriousStuff);
};
