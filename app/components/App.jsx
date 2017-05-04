// React junk
import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom'
import axios from 'axios'

// Ethereum stuff
import {default as Web3} from 'web3'
import {default as contract} from 'truffle-contract'
import MetaCoinContract from '../../build/contracts/MetaCoin.json'

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
      <td className>
        <div className="vote text-center">
          <i className="fa fa-chevron-up"/>
          <div className="score">{action.numberOfVotes}</div>
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
    this.meta = contract(MetaCoinContract)
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
    window.new_action = (data) => {
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
            votingDeadline: action_data[3],
            done: action_data[4],
            bool: action_data[5],
            numberOfVotes: action_data[6],
            actionHash: action_data[7]
          }

          // Set React state
          actions.push(action)
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
            self.new_action(result.args)
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
