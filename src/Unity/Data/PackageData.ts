import {Config} from '../Config';
import {IRepositoryData} from '../Interfaces/IRepositoryData';
import {RepositoryData} from './RepositoryData';
import {IPackageData} from '../Interfaces/IPackageData';
import {ORepositoryData} from '../Interfaces/Object/ORepositoryData';

export class PackageData implements IPackageData {
    private readonly name: string;
    private readonly directory: string;
    private readonly versionFile: string;
    private readonly repositoryData: IRepositoryData;

    public constructor(name: string, directory?: string, historyFile?: string, repositoryData?: ORepositoryData) {
        this.name = name;
        this.directory = directory ? directory : Config.Git.packageDirectory;
        this.versionFile = historyFile ? historyFile : Config.Git.versionFile;
        this.repositoryData = repositoryData ?
            new RepositoryData(repositoryData.branch ? repositoryData.branch : name, repositoryData.name, repositoryData.username, repositoryData.token) :
            new RepositoryData(name)
        ;
    }

    public Directory(): string {
        return this.directory;
    }

    public VersionFile(): string {
        return this.versionFile;
    }

    public Name(): string {
        return this.name;
    }

    public RepositoryData(): IRepositoryData {
        return this.repositoryData;
    }
}
