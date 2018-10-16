import { IHash } from '../../interfaces';
export interface ITransactionWrapper {
    addProof(privateKey: string): this;
    getJSON(): Promise<IHash<any>>;
}
export declare const createSignedTransaction: (type: string, data: any, privateKey: any) => Promise<ITransactionWrapper>;
export declare const createTransaction: (type: string, data: any) => Promise<ITransactionWrapper>;
