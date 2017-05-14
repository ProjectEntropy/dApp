pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Entropy.sol";

contract TestEntropy {

  function testInitialBalanceUsingDeployedContract() {
    Entropy meta = Entropy(DeployedAddresses.Entropy());

    uint expected = 10000;

    Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 Entropy initially");
  }

  function testInitialBalanceWithNewEntropy() {
    Entropy meta = new Entropy();

    uint expected = 10000;

    Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 Entropy initially");
  }

}
