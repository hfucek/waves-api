"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var signature_generator_1 = require("@waves/signature-generator");
var txHelpers = require("../api/node/transactions.x");
// TODO : refactor this module and ugly dependency injections through names (like preIssue, postReissue, etc)
var capitalize = function (name) { return name.slice(0, 1).toUpperCase() + name.slice(1); };
var TransactionWrapper = /** @class */ (function () {
    function TransactionWrapper(signatureGenerator, validatedData, postRemap, proofs) {
        this.signatureGenerator = signatureGenerator;
        this.validatedData = validatedData;
        this.postRemap = postRemap;
        this.proofs = proofs;
        this._privateKeys = [];
    }
    TransactionWrapper.prototype.addProof = function (privateKey) {
        this._privateKeys.push(privateKey);
        return this;
    };
    TransactionWrapper.prototype.getJSON = function () {
        var _this = this;
        return Promise.all(this._privateKeys.map(function (privateKey) {
            return _this.signatureGenerator.getSignature(privateKey);
        })).then(function (newProofs) {
            return _this.postRemap(__assign({}, _this.validatedData, { proofs: [].concat(_this.proofs, newProofs) }));
        });
    };
    return TransactionWrapper;
}());
exports.createSignedTransaction = function (type, data, privateKey) {
    var name = capitalize(type);
    var preRemap = txHelpers['pre' + name];
    var postRemap = txHelpers['post' + name];
    if (!preRemap || !postRemap || !signature_generator_1.TX_TYPE_MAP[type]) {
        throw new Error("Unknown transaction type: " + type);
    }
    var proofs = data.proofs || [];
    //console.log(data);
    return preRemap(data).then(function (validatedData) {
        //console.log('validated:',validatedData);
        var signatureGenerator = new signature_generator_1.TX_TYPE_MAP[type](validatedData);
        //  console.log(signatureGenerator)
        var tw = new TransactionWrapper(signatureGenerator, validatedData, postRemap, proofs);
        //    console.log(tw)
        tw.addProof(privateKey);
        return tw.getJSON();
    });
};
exports.createTransaction = function (type, data) {
    var name = capitalize(type);
    var preRemap = txHelpers['pre' + name];
    var postRemap = txHelpers['post' + name];
    if (!preRemap || !postRemap || !signature_generator_1.TX_TYPE_MAP[type]) {
        throw new Error("Unknown transaction type: " + type);
    }
    var proofs = data.proofs || [];
    return preRemap(data).then(function (validatedData) {
        var signatureGenerator = new signature_generator_1.TX_TYPE_MAP[type](validatedData);
        return new TransactionWrapper(signatureGenerator, validatedData, postRemap, proofs);
    });
};
//# sourceMappingURL=transactions.js.map