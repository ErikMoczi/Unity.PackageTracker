import {Config} from '../Config';
import {IRepositoryData} from '../Interfaces/IRepositoryData';
import {RepositoryData} from './RepositoryData';
import {IPackageData} from '../Interfaces/IPackageData';
import {ORepositoryData} from '../Interfaces/Object/ORepositoryData';

export class PackageData implements IPackageData {
    private readonly name: string;
    private readonly directory: string;
    private readonly versionFile: string;
    private readonly readmeFile: string;
    private readonly repositoryData: IRepositoryData;

    public constructor(name: string, directory?: string, versionFile?: string, readmeFile?: string, repositoryData?: ORepositoryData) {
        this.name = name;
        this.directory = directory ? directory : Config.Git.packageDirectory;
        this.versionFile = versionFile ? versionFile : Config.Git.versionFile;
        this.readmeFile = readmeFile ? readmeFile : Config.Git.readmeFile;
        this.repositoryData = repositoryData ?
            new RepositoryData(repositoryData.branch ? repositoryData.branch : name, repositoryData.templateBranch, repositoryData.statisticsBranch, repositoryData.url, repositoryData.gitName, repositoryData.username, repositoryData.token) :
            new RepositoryData(name)
        ;
    }

    public Directory(): string {
        return this.directory;
    }

    public VersionFile(): string {
        return this.versionFile;
    }

    public ReadmeFile(): string {
        return this.readmeFile;
    }

    public Name(): string {
        return this.name;
    }

    public RepositoryData(): IRepositoryData {
        return this.repositoryData;
    }
}
