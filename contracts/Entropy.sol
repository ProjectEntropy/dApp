pragma solidity ^0.4.2;

import "./ConvertLib.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract Entropy {
	mapping (address => uint) balances;

  Action[] public actions;
  uint public actions_count;

  struct Action {
    uint amount;
    string description;
    string tags;
    uint votingDeadline;
    bool done;
    bool actionPassed;
    uint numberOfVotes;
    int votingTally;
    /*bytes32 actionHash;*/
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
    /*a.actionHash = sha3(_etherAmount, _description);*/
    a.votingDeadline = now + 5 days;
    a.done = false;
    a.actionPassed = false;
    a.numberOfVotes = 0;
    a.votingTally = 0;
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
    int      // votingTally;
  ){
    return (
      actions[index].amount,
      actions[index].description,
      actions[index].votingDeadline,
      actions[index].done,
      actions[index].actionPassed,
      actions[index].numberOfVotes,
      actions[index].votingTally



    );
  }

  /**
   * Voting
   */
  function vote(uint actionId, bool in_favour)
  /*onlyTrusted*/
  returns (uint voteID)
  {
    Action action = actions[actionId];

    // if this is a dangerous action, and the citizen is not yet trusted, then throw
    /*if (action.dangerous? && ! trusted_citizens[msg.sender])
    {
      throw
    }*/


    // Check to make sure this person has not already voted
    if (action.voted[msg.sender] == true) throw;

    /*action.votes[voteID] = Vote({inSupport: in_favour, citizen: msg.sender});*/
    int vote = 0;
    if(in_favour)
    {
      vote = 1;
    }
    else
    {
      vote = -1;
    }
    action.votingTally += vote;
    action.voted[msg.sender] = true;
    action.numberOfVotes = action.numberOfVotes + 1;
    Voted(actionId, in_favour, msg.sender);
  }

  /**
   * Events
   */
	event Transfer(address indexed _from, address indexed _to, uint256 _value);

  event ActionAdded(uint actionID, uint amount, string description);
  // Vote
  event Voted(uint actionID, bool in_favour, address citizen);

  // A new guardian has been elected
  event NewGuardian(address indexed _guardian, address indexed _creator);

  // A new person has been trusted
  event NewTrust(address indexed _citizen, address indexed _guardian);

  // A person is no longer trusted
  event TrustLost(address indexed _citizen, address indexed _guardian);

  // Safety Limit has been increased
  event SafetyLimitChange(address indexed _guardian, uint indexed limit);
}
