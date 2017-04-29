pragma solidity ^0.4.4;

import "./ConvertLib.sol";

contract MetaCoin {
    mapping (address => uint) balances;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    function MetaCoin() {
        balances[tx.origin] = 10000;
    }

    function sendCoin(address receiver, uint amount) returns(bool sufficient) {
        if (balances[msg.sender] < amount) return false;
        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        Transfer(msg.sender, receiver, amount);
        return true;
    }

    function getBalanceInEth(address addr) returns(uint){
        return ConvertLib.convert(getBalance(addr),2);
    }

    function getBalance(address addr) returns(uint) {
        return balances[addr];
    }
}

/*
Available Accounts
==================
(0) 0xae7e62317fb2da6ef8bf058fe724d7b465998561
(1) 0x4a8cb278c05f44656ca71bd8926932c69f84378e
(2) 0x2494fe5e733e06004bba90de2b49b700addd1700
(3) 0xdde194aa82191167a320fd42cc96e76dfe8ca506
(4) 0x8b67e86db246c493866ed8f7875f282967a67708
(5) 0x211a83a50240b25a065ed830bd0d769ea48aa30c
(6) 0x103e1e4e710545db2c6f0fbc559d25ca140a6f01
(7) 0xabe55d74efab17a39aaa24c25089fdc9d3490151
(8) 0xa7a7b34e38e9812e52898d0d823b8c333ed8599b
(9) 0x1ccbb9e0890dd0386bf38fd213ca997a12dc61c2

Private Keys
==================
(0) e616f7021a1944be403bf6b8eddf390ee386762b98b9f50f9c87938aaa15d9fe
(1) 7868513f000d93dc0cdef57ca7cd366f0679dca01bd6fe0f63c44359d263f5f8
(2) 9c07009de9d20d2e31a7afbe806d34b9478fab5f75ba3bb22942d97b957d5ed0
(3) d8321e3c1d72601d657f69bd74c1cec2443a6359cb4be1fc3ffe75cf0c579750
(4) ec6bc7286b08ed3ddc98be41b6171de37e0c3e35aca19b9b3d9ddaae815c97e6
(5) ef09585119ac42ae4435d3406163f015a8a6c5a7e0949c195903c6ca1a1e21c2
(6) 8f5e0a2dc14c8066907f202a8b4a9200b57ac605e5c50929b05cea32221a410c
(7) d082233739b6177f0ed29cbd7b051358f0d9e501ac1a9db5e56b92b9a8ccc447
(8) 392617e5b64d5e2771263cc6171f5a326e35d128c278a7696b0cd1a4f9fe5b60
(9) 3bc86d88db64e02caf8dca206785af077a83436ec1ba3549fe683a77d971d75f
*/
