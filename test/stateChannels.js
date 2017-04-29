/*global StateChannels*/
import secp256k1 from 'secp256k1'
import crypto from 'crypto'
import sha3 from 'js-sha3'
import leftPad from 'left-pad'
import BigNumber from 'bignumber.js' 

const keccak = sha3.keccak_256

var StateChannels = artifacts.require("StateChannels");

contract('StateChannels', function (accounts) {

    it('adds channel and checks state', function(){
        var meta;
        const channelId = '1000000000000000000000000000000000000000000000000000000000000000'
        const state = '1111'
        const fingerprint = keccak(hexStringToByte(
            web3.toHex('newChannel').slice(2) +
            channelId +
            web3.eth.accounts[0].slice(2) +
            web3.eth.accounts[1].slice(2) +
            state
        ))

        const sig0 = web3.eth.sign(web3.eth.accounts[0], '0x' + fingerprint)
        const sig1 = web3.eth.sign(web3.eth.accounts[1], '0x' + fingerprint)

        return StateChannels.deployed().then(function(instance){
            meta = instance;
            meta.newChannel(
                '0x' + channelId,
                web3.eth.accounts[0],
                web3.eth.accounts[1],
                '0x' + state,
                1,
                sig0,
                sig1
            );
        }).then(function() {
            return meta.getChannel.call(
                '0x' + channelId
            )
        }).then(function(savedChannel){
            assert.equal(savedChannel[0], web3.eth.accounts[0], 'addr0')
            assert.equal(savedChannel[1], web3.eth.accounts[1], 'addr1')
            assert.equal(savedChannel[2].toString(10), '0', 'phase')
            assert.equal(savedChannel[3].toString(10), '1', 'challengePeriod')
            assert.equal(savedChannel[4].toString(10), '0', 'closingBlock')
            assert.equal(savedChannel[5], '0x' + state, 'state')
            assert.equal(savedChannel[6].toString(10), '0', 'sequenceNumber')
        });

    });

    it('rejects channel with existant channelId', function(){
        var meta;
        const channelId = '1000000000000000000000000000000000000000000000000000000000000000'
        const state = '1111'
        const fingerprint = keccak(hexStringToByte(
            web3.toHex('newChannel').slice(2) +
            channelId +
            web3.eth.accounts[0].slice(2) +
            web3.eth.accounts[1].slice(2) +
            state
        ))

        const sig0 = web3.eth.sign(web3.eth.accounts[0], '0x' + fingerprint)
        const sig1 = web3.eth.sign(web3.eth.accounts[1], '0x' + fingerprint)

        return StateChannels.deployed().then(function(instance){
            meta = instance;
            return meta.newChannel(
                '0x' + channelId,
                web3.eth.accounts[0],
                web3.eth.accounts[1],
                '0x' + state,
                1,
                sig0,
                sig1
            );
        }).catch(function(err) {
            assert.equal('channel with that channelId already exists', err, 'did not return error');
        });
            
    });

    it('rejects channel with non-valid signature0', function() {
        var meta;
        const channelId = '2000000000000000000000000000000000000000000000000000000000000000'
        const state = '1111'
        const fingerprint = keccak(hexStringToByte(
            web3.toHex('newChannel').slice(2) +
            channelId +
            web3.eth.accounts[0].slice(2) +
            web3.eth.accounts[1].slice(2) +
            state
        ))

        const sig0 = web3.eth.sign(web3.eth.accounts[2], '0x' + fingerprint) // Wrong account
        const sig1 = web3.eth.sign(web3.eth.accounts[1], '0x' + fingerprint)

        return StateChannels.deployed().then(function(instance){
            meta = instance;
            meta.newChannel(
                '0x' + channelId,
                web3.eth.accounts[0],
                web3.eth.accounts[1],
                '0x' + state,
                1,
                sig0,
                sig1
            );
        }).catch(function(err) {
            assert.equal(logs[0].args.message, 'signature0 invalid', 'did not return error');
        });
    });

    it('rejects channel with non-valid signature1', function(){
        var meta;
        const channelId = '3000000000000000000000000000000000000000000000000000000000000000'
        const state = '1111'
        const fingerprint = keccak(hexStringToByte(
            web3.toHex('newChannel').slice(2) +
            channelId +
            web3.eth.accounts[0].slice(2) +
            web3.eth.accounts[1].slice(2) +
            state
        ))

        const sig0 = web3.eth.sign(web3.eth.accounts[0], '0x' + fingerprint)
        const sig1 = web3.eth.sign(web3.eth.accounts[2], '0x' + fingerprint) // Wrong account

        return StateChannels.deployed().then(function(instance){
            meta = instance;
            meta.newChannel(
                '0x' + channelId,
                web3.eth.accounts[0],
                web3.eth.accounts[1],
                '0x' + state,
                1,
                sig0,
                sig1
            );
        }).catch(function(err) {
            assert.equal(logs[0].args.message, 'signature1 invalid', 'did not return error');
        });

    });

    it('update state', function(){
        var meta;
        const channelId = '1000000000000000000000000000000000000000000000000000000000000000'
        const state = '2222'
        const sequenceNumber = 1
        const fingerprint = keccak(hexStringToByte(
            web3.toHex('updateState').slice(2) +
            channelId +
            leftPad((sequenceNumber).toString(16), 64, 0) +  
            state
        ))
        
        const sig0 = web3.eth.sign(web3.eth.accounts[0], '0x' + fingerprint)
        const sig1 = web3.eth.sign(web3.eth.accounts[1], '0x' + fingerprint)
        
        return StateChannels.deployed().then(function(instance){
            meta = instance;
            meta.updateState(
                '0x' + channelId,
                web3.toHex(sequenceNumber),
                '0x' + state,
                sig0,
                sig1
            );
        }).then(function(){
            return meta.getChannel.call(
                '0x' + channelId
            );
        }).then(function(savedChannel){
            assert.equal(savedChannel[5], '0x' + state, 'state')
            assert.equal(savedChannel[6].toString(10), '1', 'sequenceNumber')
        });
        
    });
    
    it('start challenge period', function(){
        var meta;
        const channelId = '1000000000000000000000000000000000000000000000000000000000000000'
        const fingerprint = keccak(hexStringToByte(
            web3.toHex('startChallengePeriod').slice(2) +
            channelId
        ))
        
        const sig = web3.eth.sign(web3.eth.accounts[0], '0x' + fingerprint)

        return StateChannels.deployed().then(function(instance){
            meta = instance;
            meta.startChallengePeriod(
                '0x' + channelId,
                sig,
                0
            );
        }).then(function(){
            return meta.getChannel.call(
                '0x' + channelId
            );
        }).then(function(savedChannel){
            assert.equal(savedChannel[0], web3.eth.accounts[0], 'addr0')
            assert.equal(savedChannel[1], web3.eth.accounts[1], 'addr1')
            assert.equal(savedChannel[2].toString(10), '1', 'phase')
            assert.equal(savedChannel[3].toString(10), '1', 'challengePeriod')
            assert.isAbove(savedChannel[4].toString(10), '1', 'closingBlock')
            // assert.equal(savedChannel[5], '0x' + state, 'state')
            assert.equal(savedChannel[6].toString(10), '1', 'sequenceNumber')
        });
        
        
    });
});

function byteToHexString(uint8arr) {
    if (!uint8arr) {
        return '';
    }

    var hexStr = '';
    for (var i = 0; i < uint8arr.length; i++) {
        var hex = (uint8arr[i] & 0xff).toString(16);
        hex = (hex.length === 1) ? '0' + hex : hex;
        hexStr += hex;
    }

    return hexStr.toUpperCase();
}

function hexStringToByte(str) {
    if (!str) {
        return new Uint8Array();
    }

    var a = [];
    for (var i = 0, len = str.length; i < len; i += 2) {
        a.push(parseInt(str.substr(i, 2), 16));
    }

    return new Uint8Array(a);
}

function concatenate(resultConstructor, ...arrays) {
    let totalLength = 0;
    for (let arr of arrays) {
        totalLength += arr.length;
    }
    let result = new resultConstructor(totalLength);
    let offset = 0;
    for (let arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}
