pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Entropy.sol";

contract TestEntropy {

  function testInitialBalanceUsingDeployedContract() {
    Entropy entropy = Entropy(DeployedAddresses.Entropy());

    uint expected = 10000;

    Assert.equal(entropy.getBalance(tx.origin), expected, "Owner should have 10000 Entropy initially");
  }

  function testInitialBalanceWithNewEntropy() {
    Entropy entropy = new Entropy();

    uint expected = 10000;

    Assert.equal(entropy.getBalance(tx.origin), expected, "Owner should have 10000 Entropy initially");
  }

}
