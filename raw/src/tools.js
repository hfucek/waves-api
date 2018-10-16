"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var signature_generator_1 = require("@waves/signature-generator");
var constants_1 = require("./constants");
var transactions_1 = require("./utils/transactions"); // TODO : fix this issue with interface
exports.default = {
    getAddressFromPublicKey: function (publicKey) {
        var publicKeyBytes = signature_generator_1.libs.base58.decode(publicKey);
        return signature_generator_1.utils.crypto.buildRawAddress(publicKeyBytes);
    },
    calculateTimeDiff: function (nodeTime, userTime) {
        return nodeTime - userTime;
    },
    base58: {
        encode: signature_generator_1.libs.base58.encode,
        decode: signature_generator_1.libs.base58.decode
    },
    getMinimumDataTxFee: function (data) {
        var emptyDataTx = new signature_generator_1.TX_TYPE_MAP.data({
            senderPublicKey: '11111111111111111111111111111111',
            timestamp: 0,
            fee: '',
            data: data
        });
        return emptyDataTx.getBytes().then(function (bytes) { return Math.ceil(bytes.length / 1024) * constants_1.MINIMUM_DATA_FEE_PER_KB; });
    },
    createTransaction: transactions_1.createTransaction
};
//# sourceMappingURL=tools.js.map