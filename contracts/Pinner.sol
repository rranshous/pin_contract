pragma solidity >=0.4.21 <0.6.0;

contract Pinner {
  address public owner;
  uint private pinPricePerMinute = 5;
  mapping (bytes32 => uint) private pinUntil;

  event L(
    string msg
  );

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function getPinPricePerMinute() public view returns (uint) {
    return pinPricePerMinute;
  }

  function setPinPricePerMinute(uint _newValue) public restricted {
    pinPricePerMinute = _newValue;
  }

  function getRemainingPinTime(bytes32 _identifier) public view returns (uint) {
    uint expiresAt = pinUntil[_identifier];
    if(expiresAt == 0) {
      return 0;
    }
    return (expiresAt - now) / 60 seconds;
  }

  function addPinTime(bytes32 _identifier) public payable {
    uint expiresAt = pinUntil[_identifier];
    if(expiresAt == 0) {
      expiresAt = now;
    }
    uint timeToAdd = (msg.value / getPinPricePerMinute()) * 1 minutes;
    uint newExpiresAt = expiresAt + timeToAdd;
    pinUntil[_identifier] = newExpiresAt;
  }
}
