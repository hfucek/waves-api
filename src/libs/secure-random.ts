declare const process: any;
declare const require: any;
declare const Buffer: any;

declare global {
    interface Window {
        msCrypto?: any;
    }
}


function nodeRandom(count, options) {
    const crypto = require('crypto');
    const buf = crypto.randomBytes(count);

    switch (options.type) {
        case 'Array':
            return [].slice.call(buf);
        case 'Buffer':
            return buf;
        case 'Uint8Array':
            const arr = new Uint8Array(count);
            for (let i = 0; i < count; ++i) {
                arr[i] = buf.readUInt8(i);
            }
            return arr;
        default:
            throw new Error(options.type + ' is unsupported.');
    }
}

function browserRandom(count, options) {
    const nativeArr = new Uint8Array(count);
    const crypto = window.crypto || window.msCrypto;
    crypto.getRandomValues(nativeArr);

    switch (options.type) {
        case 'Array':
            return [].slice.call(nativeArr);
        case 'Buffer':
            try {
                const b = new Buffer(1);
            } catch (e) {
                throw new Error('Buffer not supported in this environment. Use Node.js or Browserify for browser support.');
            }
            return new Buffer(nativeArr);
        case 'Uint8Array':
            return nativeArr;
        default:
            throw new Error(options.type + ' is unsupported.');
    }
}


export function secureRandom(count, options) {
    options = options || { type: 'Array' };
    //we check for process.pid to prevent Browserify from tricking us
    if (typeof process !== 'undefined' && typeof process.pid === 'number') {
        return nodeRandom(count, options);
    } else {
        const crypto = window.crypto || window.msCrypto;
        if (!crypto) throw new Error('Your browser does not support window.crypto.');
        return browserRandom(count, options);
    }
}

export function randomArray(byteCount) {
    return secureRandom(byteCount, { type: 'Array' });
}

export function randomUint8Array(byteCount) {
    return secureRandom(byteCount, { type: 'Uint8Array' });
}

export function randomBuffer(byteCount) {
    return secureRandom(byteCount, { type: 'Buffer' });
}
