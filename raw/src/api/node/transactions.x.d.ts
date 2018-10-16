import { TTransactionRequest } from '../../utils/request';
import { IHash } from '../../../interfaces';
import { Schema } from 'ts-api-validator';
export declare const issueSchema: Schema;
export declare const preIssue: (data: any) => Promise<any>;
export declare const postIssue: (data: IHash<any>) => IHash<any>;
export declare const sendIssueTx: TTransactionRequest;
export declare const transferSchema: Schema;
export declare const preTransfer: (data: any) => Promise<any>;
export declare const postTransfer: (data: IHash<any>) => IHash<any>;
export declare const sendTransferTx: TTransactionRequest;
export declare const reissueSchema: Schema;
export declare const preReissue: (data: any) => Promise<any>;
export declare const postReissue: (data: IHash<any>) => IHash<any>;
export declare const sendReissueTx: TTransactionRequest;
export declare const burnSchema: Schema;
export declare const preBurn: (data: any) => Promise<any>;
export declare const postBurn: (data: IHash<any>) => IHash<any>;
export declare const sendBurnTx: TTransactionRequest;
export declare const leaseSchema: Schema;
export declare const preLease: (data: any) => Promise<any>;
export declare const postLease: (data: IHash<any>) => IHash<any>;
export declare const sendLeaseTx: TTransactionRequest;
export declare const cancelLeasingSchema: Schema;
export declare const preCancelLeasing: (data: any) => Promise<any>;
export declare const postCancelLeasing: (data: IHash<any>) => IHash<any>;
export declare const sendCancelLeasingTx: TTransactionRequest;
export declare const createAliasSchema: Schema;
export declare const preCreateAlias: (data: any) => Promise<any>;
export declare const postCreateAlias: (data: IHash<any>) => IHash<any>;
export declare const sendCreateAliasTx: TTransactionRequest;
export declare const massTransferSchema: Schema;
export declare const preMassTransfer: (data: any) => Promise<any>;
export declare const postMassTransfer: (data: IHash<any>) => IHash<any>;
export declare const sendMassTransferTx: TTransactionRequest;
export declare const dataSchema: Schema;
export declare const preData: (data: any) => Promise<any>;
export declare const postData: (data: IHash<any>) => IHash<any>;
export declare const sendDataTx: TTransactionRequest;
export declare const setScriptSchema: Schema;
export declare const preSetScript: (data: any) => Promise<any>;
export declare const postSetScript: (data: IHash<any>) => IHash<any>;
export declare const sendSetScriptTx: TTransactionRequest;
export declare const sponsorshipSchema: Schema;
export declare const preSponsorship: (data: any) => Promise<any>;
export declare const postSponsorship: (data: IHash<any>) => IHash<any>;
export declare const sendSponsorshipTx: TTransactionRequest;
