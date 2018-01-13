import {Component, HostListener, NgZone} from '@angular/core';
const Web3 = require('web3');
const contract = require('truffle-contract');
const artifacts = require('../../../build/contracts/someSeriousStuff.json');

declare var window: any;
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  title = 'app';
  Ny = contract(artifacts);

  // TODO add proper types these variables
  account: any;
  accounts: any;
  web3: any;
  nameOfThePerson: string;
  coins: number;
  balance: number;
  sendingAmount: number;
  senderAddress: string;
  recipientAddress: string;
  key: string;
  status: string;
  finalUsers: any = '';
  fromValue: any;
  toValue: any;

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
      this.account = this.accounts[1];

      // This is run from window:load and ZoneJS is not aware of it we
      // need to use _ngZone.run() so that the UI updates on promise resolution
      this._ngZone.run(() =>
        this.refreshBalance()
      );

    });
  }

  refreshBalance = () => {
    this.finalUsers = []
    const currentAccount = this.account;
    let currentInstance;
    const self = this;
    this.Ny
      .deployed()
      .then(instance => {
        currentInstance = instance;
        let account = this.account
        return currentInstance.getUserDetail.call({from: this.account});
      })
      .then(result=>
      {
        console.log('hello');
        const userObject = {
          name: result[0],
          annuityBalance: result[2],
          longTermBalance: result[4]
        };
        this.finalUsers = userObject;

      })

      .catch(e => {
        console.log(e);
        this.setStatus('Error getting balance; see log.');
      });
  }
  setStatus = message => {
    this.status = message;
  }

  makeRequest = () => {
    console.log("hello world");
    console.log(this.fromValue);
    console.log(this.toValue);
    let fromValue;
    let toValue;
    if(this.fromValue !== this.toValue)
    {
      if(this.fromValue === 'Annuity')
      {
        fromValue = 0;
        toValue = 1;
      }
      else {
        fromValue = 1;
        toValue = 0;
      }
    }
    let meta;

    this.setStatus('Initiating transaction... (please wait)');

    this.Ny
      .deployed()
      .then(instance => {
        meta = instance;
        return meta.makeRequest.sendTransaction(this.account, this.sendingAmount, fromValue, toValue, {from: this.account, gas:4500000});
      })
      .then(() => {
        this.setStatus('Transaction complete!');
        this.refreshBalance();
      })
      .catch(e => {
        console.log(e);
        this.setStatus('Error sending coin; see log.');
      });
  }


  registerNewUser = () => {
    const nameOfThePerson = this.nameOfThePerson;
    let meta;

    this.setStatus('Initiating transaction... (please wait)');

    this.Ny
      .deployed()
      .then(instance => {
        meta = instance;
        return meta.registerNewUser.sendTransaction(nameOfThePerson, {
          from: this.account, gas: 4500000
        });
      })
      .then(() => {
        this.setStatus('Transaction complete!');
        console.log('Transaction Complete.');
        this.refreshBalance();
      })
      .catch(e => {
        console.log(e);
        this.setStatus('Error sending coin; see log.');
      });
  }



}

