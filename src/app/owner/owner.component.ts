import {Component, HostListener, NgZone} from '@angular/core';
const Web3 = require('web3');
const contract = require('truffle-contract');
const artifacts = require('../../../build/contracts/someSeriousStuff.json');

declare var window: any;
@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.css']
})
export class OwnerComponent{
  Ny = contract(artifacts);
  web3: any;
  account: any;
  accounts: any;
  request: any = '';
  status: string;
  owner: string;
  constructor(private _ngZone: NgZone) {

  }
  @HostListener('window:load')
  windowLoaded() {
    this.checkAndInstantiateWeb3();
    this.onReady();
  }
  checkAndInstantiateWeb3 = () => {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      // noinspection TsLint
      console.warn(
        'Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      // noinspection TsLint
      console.warn(
        'No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:8545')
      );
    }
  }

  onReady = () => {
    // Bootstrap the Ny abstraction for Use.
    this.Ny.setProvider(this.web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length === 0) {
        alert(
          'Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.'
        );
        return;
      }
      this.accounts = accs;
      console.log('The accounts are '+ this.accounts);
      this.account = this.accounts[0];

      // This is run from window:load and ZoneJS is not aware of it we
      // need to use _ngZone.run() so that the UI updates on promise resolution
      this._ngZone.run(() =>
        this.viewAllRequests()
      );

    });
  }

  viewAllRequests = () => {
    this.request = []
    const currentAccount = this.account;
    let currentInstance;
    const self = this;
    this.Ny
      .deployed()
      .then(instance => {
        currentInstance = instance;
        let account = this.account
        currentInstance.owner.call({from: this.account}).then(function (result)
        {
          self.owner = result;
          console.log("The owner of the contract is"+ result);
        })
        return currentInstance.viewRequest.call({from: this.account});
      })
      .then(result=>
      {
        console.log('hello');
        const userObject = {
          userAddress: result[0],
          userName: result[1],
          amount: result[2],
          fromAccount: result[3],
          toAccount: result[4]
        };
        this.request = userObject;
        console.log('the user object is');
        console.log(userObject);

      })
      .catch(e => {
        console.log(e);
        this.setStatus('Error getting balance; see log.');
      });
  }

  approveTransaction = () => {
    this.request = []
    const currentAccount = this.account;
    let currentInstance;
    const self = this;
    this.Ny
      .deployed()
      .then(instance => {
        currentInstance = instance;
        let account = this.account
        return currentInstance.approveRequest.sendTransaction(true,{from: this.account, gas:450000});
      })
      .then(result=>
      {
        this.setStatus('Transaction Approved');
        console.log('Transaction Approved');
      })
      .catch(e => {
        console.log(e);fail()
        this.setStatus('Error getting balance; see log.');
      });
  }

  setStatus = message => {
    this.status = message;
  }

}
