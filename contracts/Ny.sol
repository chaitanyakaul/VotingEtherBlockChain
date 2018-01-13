pragma solidity ^0.4.4;

// Simple Solidity intro/demo contract for BlockGeeks Article
contract Ny {

  address GeektAdmin;
  mapping(address=>User) balances;
  address[] usersByAddress;


  struct User {
  string name;
  uint balance;
  }
  
  function Ny()
  {
  	balances[msg.sender].balance = 1000;
  	GeektAdmin = msg.sender;

  }

   function registerNewUser(address newAddress, string name) returns (bool success) {
    address thisNewAddress = newAddress;
    balances[thisNewAddress].name = name;
    balances[thisNewAddress].balance = 1000;
    usersByAddress.push(thisNewAddress);
     return true;
  
  }

function sendCoin(address sender,address receiver, uint amount) returns(bool sufficient) {
		if (balances[sender].balance < amount) return false;
		balances[sender].balance -= amount;
		balances[receiver].balance += amount;
		return true;
	}

function getUsers() constant returns (address[]) { return usersByAddress; }

function getUser(address userAddress) constant returns (string, uint) {
    return (balances[userAddress].name, balances[userAddress].balance);
  }
}
