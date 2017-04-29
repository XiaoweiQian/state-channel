pragma solidity ^0.4.4;

contract ECVerify {
    event LogNum(uint8 num);
    event LogNum256(uint256 num);
    event LogBool(bool b);
    function ecrecovery(bytes32 hash, bytes sig) returns (address) {
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        // FIXME: Should this throw, or return 0?
        if (sig.length != 65) {
            return 0;
        }

        // The signature format is a compact form of:
        //   {bytes32 r}{bytes32 s}{uint8 v}
        // Compact means, uint8 is not padded to 32 bytes.
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := mload(add(sig, 65))
        }
        
        // old geth sends a `v` value of [0,1], while the new, in line with the YP sends [27,28]
        if (v < 27)
          v += 27;

        return ecrecover(hash, v, r, s);
    }
    
    function ecverify(bytes32 hash, bytes sig, address signer) returns (bool b) {
        b = ecrecovery(hash, sig) == signer;
        LogBool(b);
        return b;
    }
}
