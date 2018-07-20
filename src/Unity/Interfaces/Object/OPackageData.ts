import {ORepositoryData} from './ORepositoryData';

export interface OPackageData {
    name: string
    repository?: ORepositoryData
    directory?: string
    versionFile?: string
}
