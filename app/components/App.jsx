// React junk
import React from 'react';
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

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      addaction(input.value);
      input.value = '';
    }}>
      <input className="form-control col-md-12" ref={node => {
        input = node;
      }}/>
      <br/>
    </form>
  );
};

const Action = ({action, remove}) => {
  // Each action
  return (
    <tr>
      <td>
        <div className="vote"><i className="fa fa-chevron-up"/>
          <div className="score"></div>
          <i className="fa fa-chevron-down"/></div>
      </td>
      <td>
        <div className="info-container"><a className="thread-title"/>
          <h4><a className="thread-title"/>
            <a href="actions//5mq2ZtBBpF4YjeiS9">
              {action.description}
            </a>
            <span className="badge">event</span>
          </h4>
          <h6 className="thread-info"><p/>
            <p/></h6>
        </div>
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
    <table>
      <tbody>
        {actionNode}
      </tbody>
    </table>

  );
}

const Title = ({count, addr}) => {
  return (
    <div>
      <div>
        <h1>Actions ({count})</h1>
        <h3>Connected to: {addr}</h3>
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
    this.apiUrl = 'http://58f1797bf736cd1200044f62.mockapi.io/Action'
    this.ethAddress = ""

    // Load Ethereum jazz
    // var from = Web3.eth.coinbase;
    // Web3.eth.defaultAccount = from;

    let provider = new Web3.providers.HttpProvider(`http://${TESTRPC_HOST}:${TESTRPC_PORT}`)

    this.web3 = new Web3()
    this.web3.setProvider(provider)
    this.meta = contract(MetaCoinContract)
    this.meta.setProvider(provider)
    this.meta.deployed().then((instance) => {
      this.state.ethAddress = instance.address
      this.state.contract = instance
      this.state.web3 = this.web3
    })
  }
  // Lifecycle method
  componentDidMount() {

    // mount to global window so Web3 events can get a hook back into the React App
    window.new_action = (data) => {
      var actions = this.state.actions.slice()

      // Convert bignums to strings
      data = bigNumberToString(data)


      actions.push(data)
      this.setState({ actions: actions })
    };

    // fetch actions from Ethereum
    this.meta.deployed().then((instance) =>
    {
      var new_actions = instance.allEvents({ address: [instance.address], fromBlock: 0, toBlock: "latest" });

      new_actions.watch( function(error, result) {
        // Whenever an action was seen
        // (Window Context)

        if (error == null) {
          console.log("Saw action!")
          console.log(result.event)

          if(result.event == "ActionAdded")
            self.new_action(result.args)
        }
      })

    })

    // state.contract.newAction( 10000, "this is a test", { from: web3.eth.accounts[0] })
  }

  // Add action handler
  addaction(val) {
    // Assemble data
    const action = {
      description: val,
      id: window.id++
    }
    // Update data
    axios.post(this.apiUrl, action).then((res) => {
      this.state.data.push(res.data);
      this.setState({data: this.state.data});
    });
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
      <div>
        <Title count={this.state.actions.length} ethAddress={this.state.ethAddress}/>
        <ActionForm addaction={this.addaction.bind(this)}/>

        <div className="col-sm-4">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title pull-left"><div className="fa fa-gear"/>
                <a href="/actions/Now">Done</a>
              </h3>
              <div className="clearfix"/></div>
            <div className="panel-body">
              <ActionList actions={this.state.actions} />
            </div>
          </div>
        </div>

        <div className="col-sm-4">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title pull-left"><div className="fa fa-gear"/>
                <a href="/actions/Now">Now</a>
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
              <h3 className="panel-title pull-left"><div className="fa fa-gear"/>
                <a href="/actions/Now">Soon</a>
              </h3>
              <div className="clearfix"/></div>
            <div className="panel-body">
              <ActionList actions={this.state.data} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
