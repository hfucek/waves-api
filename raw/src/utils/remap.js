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
//# sourceMappingURL=remap.js.map