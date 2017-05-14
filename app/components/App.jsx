// React junk
import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom'
import axios from 'axios'

import TimeAgo from 'react-timeago'

// Ethereum stuff
import {default as Web3} from 'web3'
import {default as contract} from 'truffle-contract'
import EntropyContract from '../../build/contracts/Entropy.json'

import bigNumberToString from 'bignumber-to-string'

const TESTRPC_HOST = 'localhost'
const TESTRPC_PORT = '8545'

const ActionForm = ({addaction}) => {
  // Input Tracker
  let input;
  let eth;
  let tags;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      addaction(input.value, eth.value, tags.value);
      input.value = '';
      eth.value = '';
      tags.value = '';
    }}>
      <input className="form-control col-md-12" placeholder="description" ref={node => {
        input = node;
      }}/>
      <input className="form-control col-md-12" placeholder="Eth amount" ref={node => {
        eth = node;
      }}/>
      <input className="form-control col-md-12" placeholder="tags" ref={node => {
        tags = node;
      }}/>
      <br/>
      <button type="submit" className="btn btn-default form-control">Create</button>

    </form>
  );
};

const Action = ({action, remove}) => {
  // Each action
  return (
    <tr>
      <td>
        <div className="vote text-center">
          <i className="fa fa-chevron-up"/>
          <div className="score">{action.votingTally}</div>
          <i className="fa fa-chevron-down"/>
        </div>
      </td>
      <td className="vertical-align info-container">
        <h4 className="full-width">
          {action.eth != 0 &&
          <span className="pull-right text-muted font-smaller">
            {action.eth / 100000000} eth
          </span>
          }
          <Link className="thread-title" to={ `/actions/${action.actionID}` }>
            {action.description}
          </Link>
          { action.tags.split(',').map((tag) =>
            <span key={tag} className="badge">{tag}</span>
          )}
        </h4>
        <br/>
        { action.numberOfVotes }
        <TimeAgo date={action.votingDeadline}>
        </TimeAgo>
      </td>
    </tr>
  );
}

const ActionList = ({actions, remove}) => {
  // Map through the actions
  const actionNode = actions.map((action) => {
    return (<Action action={action} key={action.actionID} remove={remove}/>)
  });
  return (
    <table className="full-width table table-striped">
      <tbody>
        {actionNode}
      </tbody>
    </table>

  );
}

const Title = ({count, addr, balance}) => {
  return (
    <div>
      <div>
        <h1>Actions ({count})</h1>
        <h1>Balance: {balance}</h1>
        <p>Connected to: {addr}</p>
      </div>
    </div>
  );
}

window.id = 0;
export default class App extends React.Component {
  constructor(props) {
    // Pass props to parent class
    super(props);

    // Set initial state
    this.state = {
      data: [],
      actions: [],
      contract: null,
      web3: null
    }
    this.ethAddress = ""

    // Load Ethereum jazz;
    let provider = new Web3.providers.HttpProvider(`http://${TESTRPC_HOST}:${TESTRPC_PORT}`)

    this.web3 = new Web3()
    this.web3.setProvider(provider)
    this.meta = contract(EntropyContract)
    this.meta.setProvider(provider)
    this.meta.deployed().then((instance) => {
      this.state.ethAddress = instance.address
      this.state.contract = instance
      this.state.web3 = this.web3
      // this.state.balance = this.web3.eth.getBalance(this.state.contract.address)
    })
  }
  // Lifecycle method
  componentDidMount() {
    // mount to global window so Web3 events can get a hook back into the React App
    window.update_action = (data) => {
      // Clean up data
      var data = bigNumberToString(data)

      this.meta.deployed().then((instance) =>
      {
        var action_id = data.actionID

        // Lookup more details about this Action
        instance.actions(action_id).then( (action_data) => {
          var actions = this.state.actions.slice()
          var action_data = bigNumberToString(action_data)
          console.log(action_data)


          var action = {
            actionID: parseInt(action_id),
            eth: action_data[0],
            description: action_data[1],
            tags: action_data[2],
            votingDeadline: new Date(parseInt(action_data[3]) * 1000),
            done: action_data[4],
            bool: action_data[5],
            numberOfVotes: action_data[6],
            votingTally: action_data[7],
            actionHash: action_data[8]
          }

          // Set React state

          // If we already track this action
          if(actions.length > 0)
          {
            for (var i in actions) {
              if(actions[i].actionID == action_id)
              {
                // Update this action
                console.log("updating action")
                actions[i] = action
              }
              else
              {
                // otherwise create
                console.log("creating action")
                actions.push(action)
              }
            }
          }
          else
          {
            actions.push(action)
          }


          this.setState({ actions: actions })
        })
      })
    };

    // fetch actions from Ethereum
    this.meta.deployed().then((instance) =>
    {
      var new_actions = instance.allEvents({ address: [instance.address], fromBlock: 0, toBlock: "latest" });

      new_actions.watch( function(error, result) {
        // Whenever an action was seen
        // (Window Context)
        if (error == null) {
          if(result.event == "ActionAdded")
            self.update_action(result.args)
          if(result.event == "Voted")
            self.update_action(result.args)
        }
      })
    })
  }

  // Add action handler
  addaction(val, eth, tags) {
    // Assemble data
    const action = {
      description: val,
      eth: eth,
      tags: tags,
      id: window.id++
    }

    this.state.contract.newAction(
      action.eth,
      action.description,
      action.tags,
      {
        from: this.state.web3.eth.accounts[0],
        gas: 200000
      })
  }

  // Handle remove
  handleRemove(id) {
    // Filter all actions except the one to be removed
    const remainder = this.state.data.filter((action) => {
      if (action.id !== id)
        return action;
      }
    );
    // Update state with filter
    axios.delete(this.apiUrl + '/' + id).then((res) => {
      this.setState({data: remainder});
    })
  }

  render() {
    // Render JSX
    return (
      <Router>
      <div>
        <div className="col-sm-4">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">
                Entropy Dashboard
              </h3>
            </div>
            <div className="panel-body">
              <Title
                count={this.state.actions.length}
                ethAddress={this.state.ethAddress}
                balance={this.state.balance}
              />
            </div>
          </div>


          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">
                <span className="fa fa-check-square-o fa-2x text-muted"/>
              </h3>
              <div className="clearfix"/></div>
            <div className="panel-body">

            </div>
          </div>
        </div>

        <div className="col-sm-4">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title pull-left">
                <div className="fa fa-gear fa-2x text-muted"/>
              </h3>
              <div className="clearfix"/></div>
            <div className="panel-body">
              <ActionList actions={this.state.data} />
            </div>
          </div>
        </div>

        <div className="col-sm-4">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h1 className="panel-title pull-left">
                <div className="fa fa-lightbulb-o fa-2x text-muted"/>

              </h1>
              <div className="clearfix"/></div>
            <div className="panel-body">
              <ActionList actions={this.state.actions} />

              <ActionForm addaction={this.addaction.bind(this)}/>
            </div>
          </div>
        </div>
      </div>
      </Router>
    );
  }
}

if (!Array.prototype.indexOf) {

  Array.prototype.indexOf = function(searchElement/*, fromIndex */) {

    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0)
      return -1;

    var n = 0;
    if (arguments.length > 0) {
      n = Number(arguments[1]);
      if (n !== n)
        n = 0;
      else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }

    if (n >= len)
      return -1;

    var k = n >= 0
      ? n
      : Math.max(len - Math.abs(n), 0);

    for (; k < len; k++) {
      if (k in t && t[k] === searchElement)
        return k;
      }
    return -1;
  };

}
