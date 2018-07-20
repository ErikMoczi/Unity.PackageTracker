import {OUnityPackageVersion} from './OUnityPackageVersion';

export interface OUnityPackageInfo {
    _id: string
    _rev: string
    name: string
    description?: string
    'dist-tags': {
        latest: string
    }
    versions: {
        [name: string]: OUnityPackageVersion
    }
    time: {
        [name: string]: string
    }
}
