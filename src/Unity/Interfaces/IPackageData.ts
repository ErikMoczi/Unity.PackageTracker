import {IRepositoryData} from './IRepositoryData';

export interface IPackageData {
    Name(): string

    Directory(): string

    VersionFile(): string

    RepositoryData(): IRepositoryData
}
