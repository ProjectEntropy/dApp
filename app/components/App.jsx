// React junk
import React from 'react';
import axios from 'axios'

// Ethereum stuff
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import MetaCoinContract from '../../build/contracts/MetaCoin.json'

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
      }} />
      <br />
    </form>
  );
};


const Action = ({action, remove}) => {
  // Each action
   return (<p href="#" className="list-group-item" >
     {action.description}

     <span className="pull-right">
          <span className="btn btn-xs btn-default" onClick={() => {remove(action.id)}} >
              <span className="glyphicon glyphicon-play" aria-hidden="true"></span>
          </span>
      </span>
   </p>);
}

const ActionList = ({actions, remove}) => {
  // Map through the actions
  const actionNode = actions.map((action) => {
    return (<Action action={action} key={action.id} remove={remove}/>)
  });
  return (<div className="list-group" style={{marginTop:'30px'}}>{actionNode}</div>);
}

const Title = ({count, ethAddress}) => {
  return (
    <div>
       <div>
          <h1>Actions ({count})</h1>
          <h3>Connected to: {ethAddress}</h3>
       </div>
    </div>
  );
}

window.id = 0;
export default class App extends React.Component {
  constructor(props){
     // Pass props to parent class
     super(props);
     // Set initial state
     this.state = {
       data: []
     }
     this.apiUrl = 'http://58f1797bf736cd1200044f62.mockapi.io/Action'
     this.ethAddress = ""

     // Load Ethereum jazz
     let provider = new Web3.providers.HttpProvider(`http://${TESTRPC_HOST}:${TESTRPC_PORT}`)
     let meta = contract(MetaCoinContract)
     meta.setProvider(provider)
     meta.deployed()
       .then((instance) => { this.state.ethAddress = instance.address })

   }
   // Lifecycle method
  componentDidMount(){
    // Make HTTP reques with Axios
    axios.get(this.apiUrl)
      .then((res) => {
        // Set state with result
        this.setState({data:res.data});
      });
  }
  // Add action handler
  addaction(val){
    // Assemble data
    const action = {description: val, id: window.id++}
    // Update data
    axios.post(this.apiUrl, action)
       .then((res) => {
          this.state.data.push(res.data);
          this.setState({data: this.state.data});
       });
  }
  // Handle remove
  handleRemove(id){
      // Filter all actions except the one to be removed
      const remainder = this.state.data.filter((action) => {
        if(action.id !== id) return action;
      });
      // Update state with filter
      axios.delete(this.apiUrl+'/'+id)
        .then((res) => {
          this.setState({data: remainder});
        })
    }

  render(){
    // Render JSX
    return (
      <div>
        <Title count={this.state.data.length} ethAddress={this.state.ethAddress}/>
        <ActionForm addaction={this.addaction.bind(this)}/>
        <ActionList
          actions={this.state.data}
          remove={this.handleRemove.bind(this)}
        />
      </div>
    );
  }
}
