const multihash = require('../src/multihash.js');
const expect = require('chai').expect;
const Pinner = artifacts.require('./Pinner.sol');

contract('Pinner', (accounts) => {
  let pinner;
  let owner = accounts[0];
  let account = accounts[1];

  beforeEach(async () => {
    pinner = await Pinner.new();
  });

  const ipfsHashes = [
    'QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLnWdKG7U8',
    'Qmb4atcgbbN5v4CDJ8nz5QG5L2pgwSTLd3raDrnyhLjnUH',
  ];

  describe('contract owner', async () => {
    it('is initially populated as contract creator', async () => {
      let owner = await pinner.owner();
      expect(owner).to.equal(accounts[0]);
    });
  });

  describe('getting price (getPinPricePerMinute)', async () => {
    it('starts with a default value', async () => {
      let returnValue = await pinner.getPinPricePerMinute();
      assert.isAbove(returnValue.toNumber(), 0)
    });
  });

  describe('setting price (setPinPricePerMinute)', async () => {
    it('can not be set by non owner account', async () => {
      let newValue = 10;
      pinner.setPinPricePerMinute(newValue, { from: account });
      let returnValue = await pinner.getPinPricePerMinute();
      assert.notEqual(returnValue.toNumber(), newValue);
    });

    it('can be set by owner account', async () => {
      let newValue = 10;
      pinner.setPinPricePerMinute(newValue, { from: owner });
      let returnValue = await pinner.getPinPricePerMinute();
      assert.equal(returnValue.toNumber(), newValue);
    });
  });

  describe('getting remaining pin time for hash (getRemainingPinTime)', async () => {
    it('returns 0 for new hashes', async () => {
      let identifier = multihash.getBytes32FromMultihash(ipfsHashes[0]).digest;
      let returnValue = await pinner.getRemainingPinTime(identifier);
      assert.equal(returnValue.toNumber(), 0);
    });
  });

  describe('adding pin time for new hash (addPinTime)', async () => {
    it('does not add time if no value sent', async () => {
      let identifier = multihash.getBytes32FromMultihash(ipfsHashes[0]).digest;
      let preUpdateRemainingTime = (await pinner.getRemainingPinTime(identifier)).toNumber();
      await pinner.addPinTime(identifier, { from: account, value: 0 });
      let remainingTime = (await pinner.getRemainingPinTime(identifier)).toNumber();
      assert.equal(preUpdateRemainingTime, remainingTime);
    });

    it('adds time based on value sent', async () => {
      let identifier = multihash.getBytes32FromMultihash(ipfsHashes[0]).digest;
      let pinPricePerMinute = (await pinner.getPinPricePerMinute()).toNumber();
      let timeToAdd = Math.ceil(Math.random() * 100);;
      let valueToSend = pinPricePerMinute * timeToAdd;
      await pinner.addPinTime(identifier, { from: account, value: valueToSend });
      let remainingTime = (await pinner.getRemainingPinTime(identifier)).toNumber();
      assert.equal(timeToAdd, remainingTime);
    });
  });

});
