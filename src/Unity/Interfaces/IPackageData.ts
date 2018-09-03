import {IRepositoryData} from './IRepositoryData';

export interface IPackageData {
    Name(): string

    Directory(): string

    VersionFile(): string

    ReadmeFile(): string

    RepositoryData(): IRepositoryData
}
