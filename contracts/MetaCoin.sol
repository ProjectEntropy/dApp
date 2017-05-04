pragma solidity ^0.4.2;

import "./ConvertLib.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract MetaCoin {
	mapping (address => uint) balances;

  Action[] public actions;

/*
  struct Proposal {
    string name;
    address destination;
    address proxy;
    uint value;
    bytes32 hash;
    bool executed;
    uint debatePeriod;
    uint created;
    address from;
    mapping(uint => uint) positions;
    mapping(address => Vote) votes;
    address[] voters;
  }

  struct Vote {
    uint position;
    uint weight;
    uint created;
  }

  Proposal[] public proposals;*/

  uint public actions_count;

  struct Action {
    uint amount;
    string description;
    string tags;
    uint votingDeadline;
    bool done;
    bool actionPassed;
    uint numberOfVotes;
    bytes32 actionHash;
    mapping (address => bool) voted;
  }

  struct Vote {
    bool inSupport;
    address citizen;
  }

  function newAction(
    uint _etherAmount,      // Amount of Ether, in wei, to unlock (optional)
    string _description,    // The idea, task or destination
    string _tags            // What does this relate to
  )
  returns (uint actionID)
  {
    actionID = actions.length;
    Action memory a;
    a.amount = _etherAmount;
    a.description = _description;
    a.tags = _tags;
    a.actionHash = sha3(_etherAmount, _description);
    a.votingDeadline = now + 5 days;
    a.done = false;
    a.actionPassed = false;
    a.numberOfVotes = 0;
    actions.push(a);

    ActionAdded(actionID, _etherAmount, _description);
    actions_count = actionID + 1;
    return actionID;
  }

  /**
   * Fetch the live fields of an Action by it's ID
   */
  function getAction(uint index) public constant returns (
    uint,     // amount;
    string,   // description;
    uint,     // votingDeadline;
    bool,     // done;
    bool,     // actionPassed;
    uint,     // numberOfVotes;
    bytes32   // actionHash;
  ){
    return (
      actions[index].amount,
      actions[index].description,
      actions[index].votingDeadline,
      actions[index].done,
      actions[index].actionPassed,
      actions[index].numberOfVotes,
      actions[index].actionHash
    );
  }

	event Transfer(address indexed _from, address indexed _to, uint256 _value);

  event ActionAdded(uint actionID, uint amount, string description);
  // Vote
  event Voted(uint actionId, bool in_favour, address citizen);

  // A new guardian has been elected
  event NewGuardian(address indexed _guardian, address indexed _creator);

  // A new person has been trusted
  event NewTrust(address indexed _citizen, address indexed _guardian);

  // A person is no longer trusted
  event TrustLost(address indexed _citizen, address indexed _guardian);

  // Safety Limit has been increased
  event SafetyLimitChange(address indexed _guardian, uint indexed limit);

	function MetaCoin() {
		balances[tx.origin] = 10000;
	}

	function sendCoin(address receiver, uint amount) returns(bool sufficient) {
		if (balances[msg.sender] < amount) return false;
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		Transfer(msg.sender, receiver, amount);
		return true;
	}

	function getBalanceInEth(address addr) returns(uint){
		return ConvertLib.convert(getBalance(addr),2);
	}

	function getBalance(address addr) returns(uint) {
		return balances[addr];
	}
}
