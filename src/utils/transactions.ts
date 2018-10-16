import { TX_TYPE_MAP, ISignatureGenerator } from '@waves/signature-generator';

import * as txHelpers from '../api/node/transactions.x';
import { IHash } from '../../interfaces';


// TODO : refactor this module and ugly dependency injections through names (like preIssue, postReissue, etc)


const capitalize = (name) => name.slice(0, 1).toUpperCase() + name.slice(1);


export interface ITransactionWrapper {
    addProof(privateKey: string): this;
    getJSON(): Promise<IHash<any>>;
}

class TransactionWrapper {

    private _privateKeys: string[] = [];

    constructor(
        public signatureGenerator: ISignatureGenerator,
        public validatedData: IHash<any>,
        public postRemap: (data: IHash<any>) => IHash<any>,
        public proofs: Array<string>
    ) {}

    public addProof(privateKey: string): this {
        this._privateKeys.push(privateKey);
        return this;
    }

    public getJSON(): Promise<IHash<any>> {
        return Promise.all(this._privateKeys.map((privateKey) => {
            return this.signatureGenerator.getSignature(privateKey);
        })).then((newProofs) => {
            return this.postRemap({
                ...this.validatedData,
                proofs: [].concat(this.proofs, newProofs)
            });
        });
    }

}
export const createSignedTransaction = (type: string, data,privateKey): Promise<ITransactionWrapper> => {
    const name = capitalize(type);
    const preRemap = txHelpers['pre' + name];
    const postRemap = txHelpers['post' + name];

    if (!preRemap || !postRemap || !TX_TYPE_MAP[type]) {
        throw new Error(`Unknown transaction type: ${type}`);
    }

    const proofs = data.proofs || [];
//console.log(data);
    return preRemap(data).then((validatedData) => {
      //console.log('validated:',validatedData);
        const signatureGenerator = new TX_TYPE_MAP[type](validatedData);
      //  console.log(signatureGenerator)
        let tw=new TransactionWrapper(signatureGenerator, validatedData, postRemap, proofs);
    //    console.log(tw)
        tw.addProof(privateKey);
        return tw.getJSON();
    });
};

export const createTransaction = (type: string, data): Promise<ITransactionWrapper> => {
    const name = capitalize(type);
    const preRemap = txHelpers['pre' + name];
    const postRemap = txHelpers['post' + name];

    if (!preRemap || !postRemap || !TX_TYPE_MAP[type]) {
        throw new Error(`Unknown transaction type: ${type}`);
    }

    const proofs = data.proofs || [];

    return preRemap(data).then((validatedData) => {
        const signatureGenerator = new TX_TYPE_MAP[type](validatedData);
        return new TransactionWrapper(signatureGenerator, validatedData, postRemap, proofs);
    });
};
