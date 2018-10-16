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
//# sourceMappingURL=WavesAPI.js.map