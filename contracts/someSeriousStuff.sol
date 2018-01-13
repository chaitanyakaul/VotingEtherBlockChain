pragma solidity ^0.4.4;

contract someSeriousStuff {

  address public owner;
  //address[] public clients;
  mapping(address=>User) clients;
  mapping(string=>address) someTest;

  struct Account{
    string name;
    uint amount;
  }

  struct User{
    string name;
    //can include multiple properties like policy_holder_number and other user detail
    Account[2] accounts;
  }

  struct RequestTransfer{
    address userAddress;
    uint amount;
    uint from;
    uint to;
  }

  RequestTransfer request;

  function someSeriousStuff(){
    owner = msg.sender;
    //clients.push(_client);
  }

  function registerNewUser(string _name) returns (bool success) {
    address thisNewAddress = msg.sender;
    clients[thisNewAddress].name = _name;
    clients[thisNewAddress].accounts[0] = Account({name:'annuity', amount:100000});
    clients[thisNewAddress].accounts[1] = Account({name:'long term', amount:5000});
    someTest[_name] = thisNewAddress;
    return true;
  }

  function getUserDetail() returns (string,string,uint,string, uint)
  {

    address currAddress = msg.sender;
    return (clients[currAddress].name,clients[currAddress].accounts[0].name,clients[currAddress].accounts[0].amount,clients[currAddress].accounts[1].name,clients[currAddress].accounts[1].amount);
  }

  enum Stages{
    WaitingApproval,
    RequestAccepted
  }
  uint public currentStageTime = now;

  Stages public currentStage = Stages.WaitingApproval;

  modifier onlyBy(address _account) {
    require(msg.sender == _account);
    _;
  }

  modifier atStage(Stages _stage) {
    require(currentStage == _stage);
    _;
  }

  function nextStage() internal {
    uint next = uint(currentStage) + 1;
    if (next > 1) next = 0;
    currentStage = Stages(next);
    currentStageTime = now;
  }

  function makeRequest(address _user, uint _amount, uint _from, uint _to)
  public
  atStage(Stages.WaitingApproval)
  {
    address userAddress = _user;
    require(clients[userAddress].accounts[_from].amount- _amount>=0);
    request = RequestTransfer({userAddress:_user,amount:_amount,from:_from,to:_to});
    //wait for approval
    nextStage();
  }

  function viewRequest() public onlyBy(owner) returns (address,string,uint, uint, uint)
  {
    return (request.userAddress, clients[request.userAddress].name,request.amount, request.from, request.to);
  }


  function approveRequest(bool approved)
  public
  onlyBy(owner)
  atStage(Stages.RequestAccepted)
  {
    if(approved)
    {
      clients[request.userAddress].accounts[request.from].amount -= request.amount;
      clients[request.userAddress].accounts[request.to].amount += request.amount;
    }
    delete request;
    nextStage();
  }

}
