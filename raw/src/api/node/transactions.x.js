"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ts_api_validator_1 = require("ts-api-validator");
var signature_generator_1 = require("@waves/signature-generator");
var schemaFields_1 = require("../schemaFields");
var remap_1 = require("../../utils/remap");
var request_1 = require("../../utils/request");
var constants = require("../../constants");
var config_1 = require("../../config");
var fetch = request_1.createFetchWrapper(0 /* NODE */, 0 /* V1 */, request_1.processJSON);
var AnyPart = /** @class */ (function (_super) {
    __extends(AnyPart, _super);
    function AnyPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnyPart.prototype.getValue = function (data) {
        return data;
    };
    return AnyPart;
}(ts_api_validator_1.BasePart));
/* ISSUE */
exports.issueSchema = new ts_api_validator_1.Schema({
    type: ts_api_validator_1.ObjectPart,
    required: true,
    content: {
        senderPublicKey: schemaFields_1.default.publicKey,
        name: {
            type: ts_api_validator_1.StringPart,
            required: true
        },
        description: {
            type: ts_api_validator_1.StringPart,
            required: false,
            defaultValue: ''
        },
        quantity: {
            type: ts_api_validator_1.NumberPart,
            required: true
        },
        precision: {
            type: ts_api_validator_1.NumberPart,
            required: true,
            isValid: remap_1.precisionCheck
        },
        reissuable: schemaFields_1.default.reissuable,
        fee: schemaFields_1.default.issueFee,
        timestamp: schemaFields_1.default.timestamp
    }
});
exports.preIssue = function (data) { return exports.issueSchema.parse(data); };
exports.postIssue = remap_1.createRemapper({
    transactionType: null,
    precision: 'decimals'
    // ,
    // type: constants.ISSUE_TX,
    // version: constants.ISSUE_TX_VERSION
});
exports.sendIssueTx = request_1.wrapTxRequest(signature_generator_1.TX_TYPE_MAP.issue, exports.preIssue, exports.postIssue, function (postParams) {
    return fetch('/assets/broadcast/issue', postParams);
} /*, true*/);
/* TRANSFER */
exports.transferSchema = new ts_api_validator_1.Schema({
    type: ts_api_validator_1.ObjectPart,
    required: true,
    content: {
        senderPublicKey: schemaFields_1.default.publicKey,
        recipient: schemaFields_1.default.recipient,
        assetId: schemaFields_1.default.assetId,
        amount: {
            type: ts_api_validator_1.NumberPart,
            required: true
        },
        feeAssetId: {
            type: ts_api_validator_1.StringPart,
            required: false,
            defaultValue: constants.WAVES
        },
        fee: schemaFields_1.default.fee,
        attachment: {
            // TODO : make it possible to pass a byte array
            type: ts_api_validator_1.StringPart,
            required: false,
            defaultValue: ''
        },
        timestamp: schemaFields_1.default.timestamp
    }
});
exports.preTransfer = function (data) { return exports.transferSchema.parse(data); };
exports.postTransfer = remap_1.createRemapper({
    transactionType: null,
    assetId: remap_1.normalizeAssetId,
    feeAssetId: remap_1.normalizeAssetId,
    attachment: {
        from: 'bytes',
        to: 'base58'
    },
    recipient: {
        from: 'raw',
        to: 'prefixed'
    }
    // ,
    // type: constants.TRANSFER_TX,
    // version: constants.TRANSFER_TX_VERSION
});
exports.sendTransferTx = request_1.wrapTxRequest(signature_generator_1.TX_TYPE_MAP.transfer, exports.preTransfer, exports.postTransfer, function (postParams) {
    return fetch('/assets/broadcast/transfer', postParams);
} /*, true*/);
/* REISSUE */
exports.reissueSchema = new ts_api_validator_1.Schema({
    type: ts_api_validator_1.ObjectPart,
    required: true,
    content: {
        senderPublicKey: schemaFields_1.default.publicKey,
        assetId: schemaFields_1.default.assetId,
        quantity: {
            type: ts_api_validator_1.NumberPart,
            required: true
        },
        reissuable: schemaFields_1.default.reissuable,
        fee: schemaFields_1.default.issueFee,
        timestamp: schemaFields_1.default.timestamp
    }
});
exports.preReissue = function (data) { return exports.reissueSchema.parse(data); };
exports.postReissue = remap_1.createRemapper({
    transactionType: null
    // ,
    // type: constants.REISSUE_TX,
    // version: constants.REISSUE_TX_VERSION
});
exports.sendReissueTx = request_1.wrapTxRequest(signature_generator_1.TX_TYPE_MAP.reissue, exports.preReissue, exports.postReissue, function (postParams) {
    return fetch('/assets/broadcast/reissue', postParams);
} /*, true*/);
/* BURN */
exports.burnSchema = new ts_api_validator_1.Schema({
    type: ts_api_validator_1.ObjectPart,
    required: true,
    content: {
        senderPublicKey: schemaFields_1.default.publicKey,
        assetId: schemaFields_1.default.assetId,
        quantity: {
            type: ts_api_validator_1.NumberPart,
            required: true
        },
        fee: schemaFields_1.default.fee,
        timestamp: schemaFields_1.default.timestamp
    }
});
exports.preBurn = function (data) { return exports.burnSchema.parse(data); };
exports.postBurn = remap_1.createRemapper(({
    transactionType: null
    // ,
    // type: constants.BURN_TX,
    // version: constants.BURN_TX_VERSION
}));
exports.sendBurnTx = request_1.wrapTxRequest(signature_generator_1.TX_TYPE_MAP.burn, exports.preBurn, exports.postBurn, function (postParams) {
    return fetch('/assets/broadcast/burn', postParams);
} /*, true*/);
/* LEASE */
exports.leaseSchema = new ts_api_validator_1.Schema({
    type: ts_api_validator_1.ObjectPart,
    required: true,
    content: {
        senderPublicKey: schemaFields_1.default.publicKey,
        recipient: schemaFields_1.default.recipient,
        amount: {
            type: ts_api_validator_1.NumberPart,
            required: true
        },
        fee: schemaFields_1.default.fee,
        timestamp: schemaFields_1.default.timestamp
    }
});
exports.preLease = function (data) { return exports.leaseSchema.parse(data); };
exports.postLease = remap_1.createRemapper({
    transactionType: null,
    recipient: {
        from: 'raw',
        to: 'prefixed'
    }
    // ,
    // type: constants.LEASE_TX,
    // version: constants.LEASE_TX_VERSION
});
exports.sendLeaseTx = request_1.wrapTxRequest(signature_generator_1.TX_TYPE_MAP.lease, exports.preLease, exports.postLease, function (postParams) {
    return fetch('/leasing/broadcast/lease', postParams);
} /*, true*/);
/* CANCEL LEASING */
exports.cancelLeasingSchema = new ts_api_validator_1.Schema({
    type: ts_api_validator_1.ObjectPart,
    required: true,
    content: {
        senderPublicKey: schemaFields_1.default.publicKey,
        transactionId: {
            type: ts_api_validator_1.StringPart,
            required: true
        },
        fee: schemaFields_1.default.fee,
        timestamp: schemaFields_1.default.timestamp
    }
});
exports.preCancelLeasing = function (data) { return exports.cancelLeasingSchema.parse(data); };
exports.postCancelLeasing = remap_1.createRemapper({
    transactionType: null,
    transactionId: 'txId'
    // ,
    // type: constants.CANCEL_LEASING_TX,
    // version: constants.CANCEL_LEASING_TX_VERSION
});
exports.sendCancelLeasingTx = request_1.wrapTxRequest(signature_generator_1.TX_TYPE_MAP.cancelLeasing, exports.preCancelLeasing, exports.postCancelLeasing, function (postParams) {
    return fetch('/leasing/broadcast/cancel', postParams);
} /*, true*/);
/* CREATE ALIAS */
exports.createAliasSchema = new ts_api_validator_1.Schema({
    type: ts_api_validator_1.ObjectPart,
    required: true,
    content: {
        senderPublicKey: schemaFields_1.default.publicKey,
        alias: {
            type: ts_api_validator_1.StringPart,
            required: true,
            parseValue: remap_1.removeAliasPrefix
        },
        fee: schemaFields_1.default.fee,
        timestamp: schemaFields_1.default.timestamp
    }
});
exports.preCreateAlias = function (data) { return exports.createAliasSchema.parse(data); };
exports.postCreateAlias = remap_1.createRemapper({
    transactionType: null
    // ,
    // type: constants.CREATE_ALIAS_TX,
    // version: constants.CREATE_ALIAS_TX_VERSION
});
exports.sendCreateAliasTx = request_1.wrapTxRequest(signature_generator_1.TX_TYPE_MAP.createAlias, exports.preCreateAlias, exports.postCreateAlias, function (postParams) {
    return fetch('/alias/broadcast/create', postParams);
} /*, true*/);
/* MASS TRANSFER */
exports.massTransferSchema = new ts_api_validator_1.Schema({
    type: ts_api_validator_1.ObjectPart,
    required: true,
    content: {
        senderPublicKey: schemaFields_1.default.publicKey,
        assetId: schemaFields_1.default.assetId,
        transfers: {
            type: ts_api_validator_1.ArrayPart,
            content: {
                type: ts_api_validator_1.ObjectPart,
                required: true,
                content: {
                    recipient: schemaFields_1.default.recipient,
                    amount: {
                        type: ts_api_validator_1.NumberPart,
                        required: true
                    }
                }
            },
            defaultValue: []
        },
        timestamp: schemaFields_1.default.timestamp,
        fee: schemaFields_1.default.fee,
        attachment: {
            // TODO : make it possible to pass a byte array
            type: ts_api_validator_1.StringPart,
            required: false,
            defaultValue: ''
        }
    }
});
exports.preMassTransfer = function (data) { return exports.massTransferSchema.parse(data); };
exports.postMassTransfer = remap_1.createRemapper({
    transactionType: null,
    assetId: remap_1.normalizeAssetId,
    attachment: {
        from: 'bytes',
        to: 'base58'
    },
    transfers: {
        from: 'raw',
        to: 'prefixed',
        path: 'recipient'
    },
    type: constants.MASS_TRANSFER_TX,
    version: constants.MASS_TRANSFER_TX_VERSION
});
exports.sendMassTransferTx = request_1.wrapTxRequest(signature_generator_1.TX_TYPE_MAP.massTransfer, exports.preMassTransfer, exports.postMassTransfer, function (postParams) {
    return fetch(constants.BROADCAST_PATH, postParams);
}, true);
/* DATA */
exports.dataSchema = new ts_api_validator_1.Schema({
    type: ts_api_validator_1.ObjectPart,
    required: true,
    content: {
        senderPublicKey: schemaFields_1.default.publicKey,
        data: {
            type: ts_api_validator_1.ArrayPart,
            content: {
                type: ts_api_validator_1.ObjectPart,
                required: true,
                content: {
                    type: {
                        type: ts_api_validator_1.StringPart,
                        required: true
                    },
                    key: {
                        type: ts_api_validator_1.StringPart,
                        required: true
                    },
                    value: {
                        type: AnyPart,
                        required: true
                    }
                }
            },
            defaultValue: []
        },
        timestamp: schemaFields_1.default.timestamp,
        fee: schemaFields_1.default.fee // TODO : validate against the transaction size in bytes
    }
});
exports.preData = function (data) { return exports.dataSchema.parse(data); };
exports.postData = remap_1.createRemapper({
    transactionType: null,
    type: constants.DATA_TX,
    version: constants.DATA_TX_VERSION
});
exports.sendDataTx = request_1.wrapTxRequest(signature_generator_1.TX_TYPE_MAP.data, exports.preData, exports.postData, function (postParams) {
    return fetch(constants.BROADCAST_PATH, postParams);
}, true);
/* SET SCRIPT */
exports.setScriptSchema = new ts_api_validator_1.Schema({
    type: ts_api_validator_1.ObjectPart,
    required: true,
    content: {
        senderPublicKey: schemaFields_1.default.publicKey,
        script: {
            type: ts_api_validator_1.StringPart,
            required: true
        },
        chainId: {
            type: ts_api_validator_1.NumberPart,
            required: true,
            parseValue: function () { return config_1.default.getNetworkByte(); }
        },
        timestamp: schemaFields_1.default.timestamp,
        fee: schemaFields_1.default.fee // TODO : validate against the transaction size in bytes
    }
});
exports.preSetScript = function (data) { return exports.setScriptSchema.parse(data); };
exports.postSetScript = remap_1.createRemapper({
    transactionType: null,
    type: constants.SET_SCRIPT_TX,
    version: constants.SET_SCRIPT_TX_VERSION
});
exports.sendSetScriptTx = request_1.wrapTxRequest(signature_generator_1.TX_TYPE_MAP.setScript, exports.preSetScript, exports.postSetScript, function (postParams) {
    return fetch(constants.BROADCAST_PATH, postParams);
}, true);
/* SPONSORSHIP */
exports.sponsorshipSchema = new ts_api_validator_1.Schema({
    type: ts_api_validator_1.ObjectPart,
    required: true,
    content: {
        senderPublicKey: schemaFields_1.default.publicKey,
        assetId: schemaFields_1.default.assetId,
        minSponsoredAssetFee: {
            type: ts_api_validator_1.NumberPart,
            required: true
        },
        timestamp: schemaFields_1.default.timestamp,
        fee: schemaFields_1.default.fee
    }
});
exports.preSponsorship = function (data) { return exports.sponsorshipSchema.parse(data); };
exports.postSponsorship = remap_1.createRemapper({
    transactionType: null,
    type: constants.SPONSORSHIP_TX,
    version: constants.SPONSORSHIP_TX_VERSION
});
exports.sendSponsorshipTx = request_1.wrapTxRequest(signature_generator_1.TX_TYPE_MAP.sponsorship, exports.preSponsorship, exports.postSponsorship, function (postParams) {
    return fetch(constants.BROADCAST_PATH, postParams);
}, true);
//# sourceMappingURL=transactions.x.js.map