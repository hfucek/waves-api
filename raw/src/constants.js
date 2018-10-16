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
//# sourceMappingURL=constants.js.map