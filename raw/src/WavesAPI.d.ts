import { IHash, IWavesConfig } from '../interfaces';
import { Seed, ByteProcessor as byteProcessors } from '@waves/signature-generator';
import { INodeAPI } from './api/node/index';
import { IMatcherAPI } from './api/matcher/index';
export interface IAPIVersions {
    Node: INodeAPI;
    Matcher: IMatcherAPI;
}
export interface IWavesAPI {
    Seed: typeof Seed;
    byteProcessors: typeof byteProcessors;
    constants: IHash<any>;
    crypto: IHash<any>;
    request: IHash<any>;
    tools: IHash<any>;
    API: IAPIVersions;
}
export declare function create(config: IWavesConfig): IWavesAPI;
export declare const MAINNET_CONFIG: IWavesConfig;
export declare const TESTNET_CONFIG: IWavesConfig;
