(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.WavesAPI = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var signature_generator_1 = require("@waves/signature-generator");
var request = require("./utils/request");
var NodeAPI = require("./api/node/index");
var MatcherAPI = require("./api/matcher/index");
var transaction = require("./utils/transactions");
var constants = require("./constants");
var config_1 = require("./config");
var tools_1 = require("./tools");
var WavesAPI = /** @class */ (function () {
    function WavesAPI(initialConfiguration) {
        this.Seed = signature_generator_1.Seed;
        this.byteProcessors = signature_generator_1.ByteProcessor;
        this.config = config_1.default;
        this.constants = constants;
        this.crypto = signature_generator_1.utils.crypto;
        this.request = request;
        this.tools = tools_1.default;
        this.transactions = transaction;
        this.API = {
            Node: NodeAPI,
            Matcher: MatcherAPI
        };
        if (this instanceof WavesAPI) {
            this.config.clear();
            this.config.set(initialConfiguration);
            if (WavesAPI._instance === null) {
                WavesAPI._instance = this;
            }
            else {
                return WavesAPI._instance;
            }
        }
        else {
            return new WavesAPI(initialConfiguration);
        }
    }
    return WavesAPI;
}());
function create(config) {
    return new WavesAPI(config);
}
exports.create = create;
exports.MAINNET_CONFIG = constants.DEFAULT_MAINNET_CONFIG;
exports.TESTNET_CONFIG = constants.DEFAULT_TESTNET_CONFIG;

},{"./api/matcher/index":2,"./api/node/index":10,"./config":16,"./constants":17,"./tools":21,"./utils/request":23,"./utils/transactions":24,"@waves/signature-generator":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var info_1 = require("./info");
var orderbooks_1 = require("./orderbooks");
exports.getMatcherKey = info_1.default.getMatcherKey;
exports.getOrderbooks = orderbooks_1.default.getOrderbooks;
exports.getOrderbook = orderbooks_1.default.getOrderbook;
exports.getOrders = orderbooks_1.default.getOrders;
exports.getAllOrders = orderbooks_1.default.getAllOrders;
exports.createOrder = orderbooks_1.default.createOrder;
exports.cancelOrder = orderbooks_1.default.cancelOrder;
exports.deleteOrder = orderbooks_1.default.deleteOrder;

},{"./info":3,"./orderbooks":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../../utils/request");
var fetch = request_1.createFetchWrapper(1 /* MATCHER */, 0 /* V1 */, request_1.processJSON);
exports.default = {
    getMatcherKey: function () {
        return fetch('/');
    }
};

},{"../../utils/request":23}],4:[function(require,module,exports){
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
var request_1 = require("../../utils/request");
var remap_1 = require("../../utils/remap");
var request_2 = require("../../utils/request");
var orderbooks_x_1 = require("./orderbooks.x");
var fetch = request_1.createFetchWrapper(1 /* MATCHER */, 0 /* V1 */, request_1.processJSON);
var preCreateOrderAsync = function (data) { return orderbooks_x_1.createOrderSchema.parse(data); };
var postCreateOrder = function (data) {
    data.assetPair = {
        amountAsset: remap_1.normalizeAssetId(data.amountAsset),
        priceAsset: remap_1.normalizeAssetId(data.priceAsset)
    };
    delete data.amountAsset;
    delete data.priceAsset;
    return data;
};
var postCancelOrder = remap_1.createRemapper({
    senderPublicKey: 'sender'
});
var generateCancelLikeRequest = function (type) {
    return function (amountAssetId, priceAssetId, orderId, keyPair) {
        var data = {
            senderPublicKey: keyPair.publicKey,
            orderId: orderId
        };
        var authData = new signature_generator_1.CANCEL_ORDER_SIGNATURE(data);
        return authData.getSignature(keyPair.privateKey)
            .then(function (signature) { return postCancelOrder(__assign({}, data, { signature: signature })); })
            .then(function (tx) {
            return fetch("/orderbook/" + amountAssetId + "/" + priceAssetId + "/" + type, __assign({}, request_2.POST_TEMPLATE, { body: JSON.stringify(tx) }));
        });
    };
};
exports.default = {
    getOrderbooks: function () {
        return fetch('/orderbook');
    },
    getOrderbook: function (assetOne, assetTwo) {
        return fetch("/orderbook/" + assetOne + "/" + assetTwo);
    },
    getOrders: function (assetOne, assetTwo, keyPair) {
        var data = {
            senderPublicKey: keyPair.publicKey,
            timestamp: remap_1.getTimestamp()
        };
        var authData = new signature_generator_1.AUTH_ORDER_SIGNATURE(data);
        return authData.getSignature(keyPair.privateKey).then(function (signature) {
            var preparedData = __assign({}, data, { signature: signature });
            return fetch("/orderbook/" + assetOne + "/" + assetTwo + "/publicKey/" + keyPair.publicKey, {
                headers: {
                    Timestamp: preparedData.timestamp,
                    Signature: preparedData.signature
                }
            });
        });
    },
    getAllOrders: function (keyPair) {
        var data = {
            senderPublicKey: keyPair.publicKey,
            timestamp: remap_1.getTimestamp()
        };
        var authData = new signature_generator_1.AUTH_ORDER_SIGNATURE(data);
        return authData.getSignature(keyPair.privateKey).then(function (signature) {
            var preparedData = __assign({}, data, { signature: signature });
            return fetch("/orderbook/" + keyPair.publicKey, {
                headers: {
                    Timestamp: preparedData.timestamp,
                    Signature: preparedData.signature
                }
            });
        });
    },
    createOrder: request_1.wrapTxRequest(signature_generator_1.CREATE_ORDER_SIGNATURE, preCreateOrderAsync, postCreateOrder, function (postParams) {
        return fetch('/orderbook', postParams);
    }),
    cancelOrder: generateCancelLikeRequest('cancel'),
    deleteOrder: generateCancelLikeRequest('delete')
};

},{"../../utils/remap":22,"../../utils/request":23,"./orderbooks.x":5,"@waves/signature-generator":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_api_validator_1 = require("ts-api-validator");
var remap_1 = require("../../utils/remap");
var constants_1 = require("../../constants");
var schemaFields_1 = require("../schemaFields");
exports.createOrderSchema = new ts_api_validator_1.Schema({
    type: ts_api_validator_1.ObjectPart,
    required: true,
    content: {
        senderPublicKey: schemaFields_1.default.publicKey,
        matcherPublicKey: schemaFields_1.default.publicKey,
        amountAsset: schemaFields_1.default.assetId,
        priceAsset: schemaFields_1.default.assetId,
        orderType: {
            type: ts_api_validator_1.StringPart,
            required: true,
            isValid: function (orderType) {
                return orderType === 'buy' || orderType === 'sell';
            }
        },
        amount: {
            type: ts_api_validator_1.NumberPart,
            required: true
        },
        price: {
            type: ts_api_validator_1.NumberPart,
            required: true
        },
        timestamp: schemaFields_1.default.timestamp,
        expiration: {
            type: ts_api_validator_1.NumberPart,
            required: true,
            parseValue: function (expiration) {
                if (expiration) {
                    return remap_1.getTimestamp(expiration);
                }
                else {
                    var date = new Date(remap_1.getTimestamp());
                    return date.setDate(date.getDate() + constants_1.DEFAULT_ORDER_EXPIRATION_DAYS);
                }
            }
        },
        matcherFee: schemaFields_1.default.matcherFee
    }
});

},{"../../constants":17,"../../utils/remap":22,"../schemaFields":15,"ts-api-validator":undefined}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../../utils/request");
var fetch = request_1.createFetchWrapper(0 /* NODE */, 0 /* V1 */, request_1.processJSON);
exports.default = {
    balance: function (address, confirmations) {
        if (!confirmations) {
            return fetch("/addresses/balance/" + address);
        }
        else {
            return fetch("/addresses/balance/" + address + "/" + confirmations);
        }
    },
    balanceDetails: function (address) {
        return fetch("/addresses/balance/details/" + address);
    }
};

},{"../../utils/request":23}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../../utils/request");
var fetch = request_1.createFetchWrapper(0 /* NODE */, 0 /* V1 */, request_1.processJSON);
exports.default = {
    byAlias: function (alias) {
        return fetch("/alias/by-alias/" + alias);
    },
    byAddress: function (address) {
        return fetch("/alias/by-address/" + address);
    }
};

},{"../../utils/request":23}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../../utils/request");
var addresses_1 = require("./addresses");
var constants = require("../../constants");
var fetch = request_1.createFetchWrapper(0 /* NODE */, 0 /* V1 */, request_1.processJSON);
exports.default = {
    balances: function (address) {
        return fetch("/assets/balance/" + address);
    },
    balance: function (address, assetId) {
        if (assetId === constants.WAVES) {
            return addresses_1.default.balance(address);
        }
        else {
            return fetch("/assets/balance/" + address + "/" + assetId);
        }
    },
    distribution: function (assetId) {
        return fetch("/assets/" + assetId + "/distribution");
    }
};

},{"../../constants":17,"../../utils/request":23,"./addresses":6}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../../utils/request");
var fetch = request_1.createFetchWrapper(0 /* NODE */, 0 /* V1 */, request_1.processJSON);
exports.default = {
    get: function (signature) {
        return fetch("/blocks/signature/" + signature);
    },
    at: function (height) {
        return fetch("/blocks/at/" + height);
    },
    first: function () {
        return fetch('/blocks/first');
    },
    last: function () {
        return fetch('/blocks/last');
    },
    height: function () {
        return fetch('/blocks/height');
    }
};

},{"../../utils/request":23}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var addresses_1 = require("./addresses");
var aliases_1 = require("./aliases");
var assets_1 = require("./assets");
var blocks_1 = require("./blocks");
var leasing_1 = require("./leasing");
var transactions_1 = require("./transactions");
var utils_1 = require("./utils");
exports.addresses = addresses_1.default;
exports.aliases = aliases_1.default;
exports.assets = assets_1.default;
exports.blocks = blocks_1.default;
exports.leasing = leasing_1.default;
exports.transactions = transactions_1.default;
exports.utils = utils_1.default;

},{"./addresses":6,"./aliases":7,"./assets":8,"./blocks":9,"./leasing":11,"./transactions":12,"./utils":14}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../../utils/request");
var fetch = request_1.createFetchWrapper(0 /* NODE */, 0 /* V1 */, request_1.processJSON);
exports.default = {
    getAllActiveLeases: function (address) {
        return fetch("/leasing/active/" + address).then(function (list) {
            return list.map(function (tx) {
                tx.status = 'active';
                return tx;
            });
        });
    }
};

},{"../../utils/request":23}],12:[function(require,module,exports){
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
var request_1 = require("../../utils/request");
var WavesError_1 = require("../../errors/WavesError");
var constants = require("../../constants");
var config_1 = require("../../config");
var requests = require("./transactions.x");
var fetch = request_1.createFetchWrapper(0 /* NODE */, 0 /* V1 */, request_1.processJSON);
exports.default = {
    get: function (id) {
        if (id === constants.WAVES) {
            return Promise.resolve(constants.WAVES_V1_ISSUE_TX);
        }
        else {
            return fetch("/transactions/info/" + id);
        }
    },
    getList: function (address, limit) {
        if (limit === void 0) { limit = config_1.default.getRequestParams().limit; }
        // In the end of the line a strange response artifact is handled
        return fetch("/transactions/address/" + address + "/limit/" + limit).then(function (array) { return array[0]; });
    },
    utxSize: function () {
        return fetch('/transactions/unconfirmed/size');
    },
    utxGet: function (id) {
        return fetch("/transactions/unconfirmed/info/" + id);
    },
    utxGetList: function () {
        return fetch('/transactions/unconfirmed');
    },
    broadcast: function (type, data, keys) {
        switch (type) {
            case constants.ISSUE_TX_NAME:
                return requests.sendIssueTx(data, keys);
            case constants.TRANSFER_TX_NAME:
                return requests.sendTransferTx(data, keys);
            case constants.REISSUE_TX_NAME:
                return requests.sendReissueTx(data, keys);
            case constants.BURN_TX_NAME:
                return requests.sendBurnTx(data, keys);
            case constants.LEASE_TX_NAME:
                return requests.sendLeaseTx(data, keys);
            case constants.CANCEL_LEASING_TX_NAME:
                return requests.sendCancelLeasingTx(data, keys);
            case constants.CREATE_ALIAS_TX_NAME:
                return requests.sendCreateAliasTx(data, keys);
            case constants.MASS_TRANSFER_TX_NAME:
                return requests.sendMassTransferTx(data, keys);
            case constants.DATA_TX_NAME:
                return requests.sendDataTx(data, keys);
            case constants.SET_SCRIPT_TX_NAME:
                return requests.sendSetScriptTx(data, keys);
            case constants.SPONSORSHIP_TX_NAME:
                return requests.sendSponsorshipTx(data, keys);
            default:
                throw new WavesError_1.default("Wrong transaction type: " + type, data);
        }
    },
    rawBroadcast: function (data) {
        return fetch(constants.BROADCAST_PATH, __assign({}, request_1.POST_TEMPLATE, { body: JSON.stringify(data) }));
    }
};

},{"../../config":16,"../../constants":17,"../../errors/WavesError":18,"../../utils/request":23,"./transactions.x":13}],13:[function(require,module,exports){
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

},{"../../config":16,"../../constants":17,"../../utils/remap":22,"../../utils/request":23,"../schemaFields":15,"@waves/signature-generator":undefined,"ts-api-validator":undefined}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../../utils/request");
var fetch = request_1.createFetchWrapper(0 /* NODE */, 0 /* V1 */, request_1.processJSON);
exports.default = {
    time: function () {
        return fetch('/utils/time').then(function (t) { return t.system; });
    },
    script: {
        compile: function (code) {
            return fetch('/utils/script/compile', {
                method: 'POST',
                body: code
            }).then(function (response) {
                return response.script;
            });
        }
    }
};

},{"../../utils/request":23}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_api_validator_1 = require("ts-api-validator");
var remap_1 = require("../utils/remap");
var constants = require("../constants");
exports.default = {
    publicKey: {
        type: ts_api_validator_1.StringPart,
        required: true
    },
    assetId: {
        type: ts_api_validator_1.StringPart,
        required: true
    },
    fee: {
        type: ts_api_validator_1.NumberPart,
        required: false,
        defaultValue: constants.MINIMUM_FEE
    },
    issueFee: {
        type: ts_api_validator_1.NumberPart,
        required: false,
        defaultValue: constants.MINIMUM_ISSUE_FEE
    },
    matcherFee: {
        type: ts_api_validator_1.NumberPart,
        required: false,
        defaultValue: constants.MINIMUM_MATCHER_FEE
    },
    recipient: {
        type: ts_api_validator_1.StringPart,
        required: true,
        parseValue: remap_1.removeRecipientPrefix
    },
    reissuable: {
        type: ts_api_validator_1.BooleanPart,
        required: false,
        defaultValue: false
    },
    timestamp: {
        type: ts_api_validator_1.NumberPart,
        required: true,
        parseValue: remap_1.getTimestamp
    }
};

},{"../constants":17,"../utils/remap":22,"ts-api-validator":undefined}],16:[function(require,module,exports){
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
var constants_1 = require("./constants");
var request_1 = require("./utils/request");
var config = Object.create(null);
function checkRequiredFields(conf) {
    if (!conf.networkByte)
        throw new Error('Missing network byte');
    if (!conf.nodeAddress)
        throw new Error('Missing node address');
    if (!conf.matcherAddress)
        throw new Error('Missing matcher address');
}
exports.default = {
    getNetworkByte: function () {
        return config.networkByte;
    },
    getNodeAddress: function () {
        return config.nodeAddress;
    },
    getMatcherAddress: function () {
        return config.matcherAddress;
    },
    getMinimumSeedLength: function () {
        return config.minimumSeedLength;
    },
    getRequestParams: function () {
        return {
            offset: config.requestOffset,
            limit: config.requestLimit
        };
    },
    getAssetFactory: function () {
        return config.assetFactory;
    },
    getLogLevel: function () {
        return config.logLevel;
    },
    getTimeDiff: function () {
        return config.timeDiff;
    },
    get: function () {
        return __assign({}, config);
    },
    set: function (newConfig) {
        signature_generator_1.config.set(newConfig);
        // Extend incoming objects only when `config` is empty
        if (Object.keys(config).length === 0) {
            newConfig = __assign({}, constants_1.DEFAULT_BASIC_CONFIG, newConfig);
        }
        Object.keys(newConfig).forEach(function (key) {
            switch (key) {
                case 'nodeAddress':
                case 'matcherAddress':
                    config[key] = request_1.normalizeHost(newConfig[key]);
                    break;
                default:
                    config[key] = newConfig[key];
                    break;
            }
        });
        checkRequiredFields(config);
    },
    clear: function () {
        Object.keys(config).forEach(function (key) {
            delete config[key];
        });
    }
};

},{"./constants":17,"./utils/request":23,"@waves/signature-generator":undefined}],17:[function(require,module,exports){
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
exports.WAVES = 'WAVES';
exports.MAINNET_BYTE = 'W'.charCodeAt(0);
exports.TESTNET_BYTE = 'T'.charCodeAt(0);
exports.INITIAL_NONCE = 0;
exports.ADDRESS_BYTE = 1;
exports.ALIAS_BYTE = 2;
exports.ISSUE_TX = 3 /* ISSUE */;
exports.TRANSFER_TX = 4 /* TRANSFER */;
exports.REISSUE_TX = 5 /* REISSUE */;
exports.BURN_TX = 6 /* BURN */;
exports.EXCHANGE_TX = 7 /* EXCHANGE */;
exports.LEASE_TX = 8 /* LEASE */;
exports.CANCEL_LEASING_TX = 9 /* CANCEL_LEASING */;
exports.CREATE_ALIAS_TX = 10 /* CREATE_ALIAS */;
exports.MASS_TRANSFER_TX = 11 /* MASS_TRANSFER */;
exports.DATA_TX = 12 /* DATA */;
exports.SET_SCRIPT_TX = 13 /* SET_SCRIPT */;
exports.SPONSORSHIP_TX = 14 /* SPONSORSHIP */;
exports.ISSUE_TX_VERSION = 2 /* ISSUE */;
exports.TRANSFER_TX_VERSION = 2 /* TRANSFER */;
exports.REISSUE_TX_VERSION = 2 /* REISSUE */;
exports.BURN_TX_VERSION = 2 /* BURN */;
exports.EXCHANGE_TX_VERSION = 2 /* EXCHANGE */;
exports.LEASE_TX_VERSION = 2 /* LEASE */;
exports.CANCEL_LEASING_TX_VERSION = 2 /* CANCEL_LEASING */;
exports.CREATE_ALIAS_TX_VERSION = 2 /* CREATE_ALIAS */;
exports.MASS_TRANSFER_TX_VERSION = 1 /* MASS_TRANSFER */;
exports.DATA_TX_VERSION = 1 /* DATA */;
exports.SET_SCRIPT_TX_VERSION = 1 /* SET_SCRIPT */;
exports.SPONSORSHIP_TX_VERSION = 1 /* SPONSORSHIP */;
exports.ISSUE_TX_NAME = "issue" /* ISSUE */;
exports.TRANSFER_TX_NAME = "transfer" /* TRANSFER */;
exports.REISSUE_TX_NAME = "reissue" /* REISSUE */;
exports.BURN_TX_NAME = "burn" /* BURN */;
exports.EXCHANGE_TX_NAME = "exchange" /* EXCHANGE */;
exports.LEASE_TX_NAME = "lease" /* LEASE */;
exports.CANCEL_LEASING_TX_NAME = "cancelLeasing" /* CANCEL_LEASING */;
exports.CREATE_ALIAS_TX_NAME = "createAlias" /* CREATE_ALIAS */;
exports.MASS_TRANSFER_TX_NAME = "massTransfer" /* MASS_TRANSFER */;
exports.DATA_TX_NAME = "data" /* DATA */;
exports.SET_SCRIPT_TX_NAME = "setScript" /* SET_SCRIPT */;
exports.SPONSORSHIP_TX_NAME = "sponsorship" /* SPONSORSHIP */;
exports.PRIVATE_KEY_LENGTH = 32;
exports.PUBLIC_KEY_LENGTH = 32;
exports.MINIMUM_FEE = 100000;
exports.MINIMUM_ISSUE_FEE = 100000000;
exports.MINIMUM_MATCHER_FEE = 300000;
exports.MINIMUM_DATA_FEE_PER_KB = 100000;
exports.TRANSFER_ATTACHMENT_BYTE_LIMIT = 140;
exports.DEFAULT_MIN_SEED_LENGTH = 25;
exports.DEFAULT_ORDER_EXPIRATION_DAYS = 20;
exports.DEFAULT_BASIC_CONFIG = {
    minimumSeedLength: exports.DEFAULT_MIN_SEED_LENGTH,
    requestOffset: 0,
    requestLimit: 100,
    logLevel: 'warning',
    timeDiff: 0
};
exports.DEFAULT_MAINNET_CONFIG = __assign({}, exports.DEFAULT_BASIC_CONFIG, { networkByte: exports.MAINNET_BYTE, nodeAddress: 'https://nodes.wavesplatform.com', matcherAddress: 'https://matcher.wavesplatform.com/matcher' });
exports.DEFAULT_TESTNET_CONFIG = __assign({}, exports.DEFAULT_BASIC_CONFIG, { networkByte: exports.TESTNET_BYTE, nodeAddress: 'https://testnet1.wavesnodes.com', matcherAddress: 'https://testnet1.wavesnodes.com/matcher' });
exports.WAVES_V1_ISSUE_TX = {
    assetId: exports.WAVES,
    decimals: 8,
    description: '',
    fee: 0,
    height: 0,
    id: exports.WAVES,
    name: 'Waves',
    quantity: 100000000 * Math.pow(10, 8),
    reissuable: false,
    sender: exports.WAVES,
    senderPublicKey: '',
    signature: '',
    timestamp: 1460419200000,
    type: exports.ISSUE_TX
};
exports.BROADCAST_PATH = '/transactions/broadcast';

},{}],18:[function(require,module,exports){
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
function paddedMessage(message) {
    return "\n" + message + "\n";
}
function resolveData(data) {
    if (data instanceof Error) {
        return paddedMessage(data.toString());
    }
    else if (data) {
        try {
            return paddedMessage(JSON.stringify(data, null, 2));
        }
        catch (e) {
            return paddedMessage('Not possible to retrieve error data');
        }
    }
    else {
        return paddedMessage('No additional data provided');
    }
}
var WavesError = /** @class */ (function (_super) {
    __extends(WavesError, _super);
    function WavesError(message, data) {
        var _this = _super.call(this, message + ":\n" + resolveData(data)) || this;
        _this.name = 'WavesError';
        _this.data = data;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, WavesError);
        }
        return _this;
    }
    return WavesError;
}(Error));
exports.default = WavesError;

},{}],19:[function(require,module,exports){
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
var WavesError_1 = require("./WavesError");
var FAILED_TO_FETCH = 'Failed to fetch';
function normalizeErrorData(data) {
    if (!data.error && data.message && data.message.indexOf(FAILED_TO_FETCH) !== -1) {
        return {
            error: -1,
            message: 'failed to fetch'
        };
    }
    else {
        return data;
    }
}
var WavesRequestError = /** @class */ (function (_super) {
    __extends(WavesRequestError, _super);
    function WavesRequestError(url, data) {
        var _this = _super.call(this, "Server request to '" + url + "' has failed", normalizeErrorData(data)) || this;
        _this.name = 'WavesRequestError';
        return _this;
    }
    return WavesRequestError;
}(WavesError_1.default));
exports.default = WavesRequestError;

},{"./WavesError":18}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fetchSubstitute = (function () {
    if (typeof window !== 'undefined') {
        return window.fetch.bind(window);
    }
    else if (typeof exports === 'object' && typeof module !== 'undefined') {
        return require('node-fetch');
    }
    else if (typeof self !== 'undefined') {
        return self.fetch.bind(self);
    }
    else {
        throw new Error('Your environment is not defined');
    }
})();
exports.default = fetchSubstitute;

},{"node-fetch":undefined}],21:[function(require,module,exports){
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

},{"./constants":17,"./utils/transactions":24,"@waves/signature-generator":undefined}],22:[function(require,module,exports){
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
var constants_1 = require("../constants");
var config_1 = require("../config");
function normalizeAssetId(original) {
    if (!original || original === constants_1.WAVES) {
        return '';
    }
    else {
        return original;
    }
}
exports.normalizeAssetId = normalizeAssetId;
function removeRecipientPrefix(original) {
    if (original.slice(0, 8) === 'address:') {
        return original.slice(8);
    }
    else {
        return original;
    }
}
exports.removeRecipientPrefix = removeRecipientPrefix;
function removeAliasPrefix(original) {
    if (original.slice(0, 6) === 'alias:') {
        return original.slice(8); // Mind the network byte characters
    }
    else {
        return original;
    }
}
exports.removeAliasPrefix = removeAliasPrefix;
// Adjusts user time to UTC
// Should be used for creating transactions and requests only
function getTimestamp(timestamp) {
    return (timestamp || Date.now()) + config_1.default.getTimeDiff();
}
exports.getTimestamp = getTimestamp;
function precisionCheck(precision) {
    return (precision >= 0 && precision <= 8);
}
exports.precisionCheck = precisionCheck;
function castFromBytesToBase58(bytes, sliceIndex) {
    bytes = Uint8Array.from(Array.prototype.slice.call(bytes, sliceIndex));
    return signature_generator_1.libs.base58.encode(bytes);
}
function castFromRawToPrefixed(raw) {
    if (raw.length > 30) {
        return "address:" + raw;
    }
    else {
        var networkCharacter = String.fromCharCode(config_1.default.getNetworkByte());
        return "alias:" + networkCharacter + ":" + raw;
    }
}
function createRemapper(rules) {
    return function (data) {
        return Object.keys(__assign({}, data, rules)).reduce(function (result, key) {
            var rule = rules[key];
            if (typeof rule === 'function') {
                // Process with a function
                result[key] = rule(data[key]);
            }
            else if (typeof rule === 'string') {
                // Rename a field with the rule name
                result[rule] = data[key];
            }
            else if (rule && typeof rule === 'object') {
                // Transform according to the rule
                if (rule.from === 'bytes' && rule.to === 'base58') {
                    result[key] = castFromBytesToBase58(data[key], rule.slice || 0);
                }
                else if (rule.from === 'raw' && rule.to === 'prefixed') {
                    result[rule.path || key] = castFromRawToPrefixed(data[key]);
                }
            }
            else if (rule !== null) {
                // Leave the data as is (or add some default value from the rule)
                result[key] = data[key] || rule;
            }
            return result;
        }, Object.create(null));
    };
}
exports.createRemapper = createRemapper;

},{"../config":16,"../constants":17,"@waves/signature-generator":undefined}],23:[function(require,module,exports){
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
var create = require("parse-json-bignumber");
var WavesRequestError_1 = require("../errors/WavesRequestError");
var fetch_1 = require("../libs/fetch");
var config_1 = require("../config");
var SAFE_JSON_PARSE = create().parse;
exports.POST_TEMPLATE = {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
    }
};
var key = function (product, version) {
    return product + "/" + version;
};
var hostResolvers = (_a = {},
    _a[key(0 /* NODE */, 0 /* V1 */)] = function () { return config_1.default.getNodeAddress(); },
    _a[key(1 /* MATCHER */, 0 /* V1 */)] = function () { return config_1.default.getMatcherAddress(); },
    _a);
function normalizeHost(host) {
    return host.replace(/\/+$/, '');
}
exports.normalizeHost = normalizeHost;
function normalizePath(path) {
    return ("/" + path).replace(/\/+/g, '/').replace(/\/$/, '');
}
exports.normalizePath = normalizePath;
function processJSON(res) {
    if (res.ok) {
        return res.text().then(SAFE_JSON_PARSE);
    }
    else {
        return res.json().then(Promise.reject.bind(Promise));
    }
}
exports.processJSON = processJSON;
function handleError(url, data) {
    throw new WavesRequestError_1.default(url, data);
}
function createFetchWrapper(product, version, pipe) {
    var resolveHost = hostResolvers[key(product, version)];
    return function (path, options) {
        var url = resolveHost() + normalizePath(path);
        var request = fetch_1.default(url, options);
        if (pipe) {
            return request.then(pipe).catch(function (data) { return handleError(url, data); });
        }
        else {
            return request.catch(function (data) { return handleError(url, data); });
        }
    };
}
exports.createFetchWrapper = createFetchWrapper;
function wrapTxRequest(SignatureGenerator, preRemapAsync, postRemap, callback, withProofs) {
    if (withProofs === void 0) { withProofs = false; }
    return function (data, keyPair) {
        return preRemapAsync(__assign({}, data, { senderPublicKey: keyPair.publicKey })).then(function (validatedData) {
            var transaction = new SignatureGenerator(validatedData);
            return transaction.getSignature(keyPair.privateKey)
                .then(function (signature) { return postRemap(__assign({}, validatedData, (withProofs ? { proofs: [signature] } : { signature: signature }))); })
                .then(function (tx) {
                return callback(__assign({}, exports.POST_TEMPLATE, { body: JSON.stringify(tx) }));
            });
        });
    };
}
exports.wrapTxRequest = wrapTxRequest;
var _a;

},{"../config":16,"../errors/WavesRequestError":19,"../libs/fetch":20,"parse-json-bignumber":undefined}],24:[function(require,module,exports){
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

},{"../api/node/transactions.x":13,"@waves/signature-generator":undefined}]},{},[1])(1)
});