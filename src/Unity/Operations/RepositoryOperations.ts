import {IPackageData} from '../Interfaces/IPackageData';
import {OPackageData} from '../Interfaces/Object/OPackageData';
import {PackageData} from '../Data/PackageData';
import {IPackageVersion} from '../Interfaces/IPackageVersion';
import * as Fs from 'fs';
import * as Path from 'path';
import {Config} from '../Config';
import {GitOperations} from './GitOperations';
import * as Git from 'isomorphic-git';
import {PackageOperations} from './PackageOperations';
import * as Fse from 'fs-extra';
import Globby = require('globby');
import {Utils} from '../Utils';

export class RepositoryOperations {
    private readonly repositoryLocation: string;
    private readonly packageData: IPackageData;
    private readonly gitOperations: GitOperations;

    public constructor(packageData: OPackageData) {
        this.packageData = new PackageData(packageData.name, packageData.directory, packageData.versionFile, packageData.readmeFile, packageData.repository);
        this.repositoryLocation = this.createTempDirectory();
        this.gitOperations = new GitOperations(this.packageData, this.repositoryLocation);
    }

    public proceed = async (packageVersions: IPackageVersion[]): Promise<void> => {
        console.log(`<<<--- ${this.packageData.Name()} - total versions #${packageVersions.length}`);
        if (await this.init()) {
            let counter: number = 0;
            let shaCommit: string;
            let lastCreatedPackageVersion: IPackageVersion;
            try {
                for (const packageVersion of packageVersions) {
                    try {
                        if (this.alreadyExistsVersion(packageVersion.VersionWithSeparator())) {
                            continue;
                        }

                        const packageLocation: string = await PackageOperations.getPackage(packageVersion.Dist().tarball);
                        this.preparePackageForGit(packageVersion, packageLocation);
                        shaCommit = await this.addNewVersionToGit(this.createMessage(packageVersion));
                        counter++;
                    } catch (e) {
                        throw new Error(`Error ${packageVersion.Name()}/${packageVersion.Version()} - ${e.message}`);
                    }

                    lastCreatedPackageVersion = packageVersion;
                }

                if (counter > 0) {
                    await this.gitOperations.gitPush(this.packageData.RepositoryData().Branch());
                    if (lastCreatedPackageVersion! === packageVersions[packageVersions.length - 1]) {
                        await this.createStatistics(packageVersions[packageVersions.length - 1], shaCommit!, packageVersions.length);
                    }
                }

                console.log(`(${counter > 0 ? counter + ' updated' : 'up-to-date'})`);
            }
            catch (e) {
                console.log(`Problem with git operations for package ${this.packageData.Name()} - ${e.message}`);
            }
        }
    };

    private init = async (): Promise<boolean> => {
        let gitError: boolean = false;
        try {
            if (await this.branchExists()) {
                await this.gitOperations.gitClone(this.packageData.RepositoryData().Branch());
            }
            else {
                await this.createBranch();
            }
        } catch (e) {
            console.log(`Failed to clone repository: ${this.packageData.RepositoryData().GitName()}/${this.packageData.RepositoryData().Branch()} - ${e.message}`);
            gitError = true;
        }

        return !gitError;
    };

    private branchExists = async (): Promise<boolean> => {
        let exists: boolean = false;
        try {
            let remoteDescription: Git.RemoteDescription = await this.gitOperations.gitRemoteInfo();
            if (Object.keys(remoteDescription.refs!.heads!).indexOf(this.packageData.RepositoryData().Branch()) !== -1) {
                exists = true;
            }
        } catch (e) {
            throw new Error(`Problem to get repository info: ${this.packageData.RepositoryData().GitName()} - ${e.message}`);
        }

        return exists;
    };

    private createBranch = async (): Promise<void> => {
        await this.gitOperations.gitClone(this.packageData.RepositoryData().TemplateBranch());
        await this.gitOperations.gitGetBranch(this.packageData.RepositoryData().Branch());
        await this.gitOperations.gitCheckout(this.packageData.RepositoryData().Branch());
        await this.gitOperations.gitPush(this.packageData.RepositoryData().Branch());
    };

    private alreadyExistsVersion = (version: string): boolean => {
        let state: boolean = false;
        const versionFile: string = Path.join(this.repositoryLocation, this.packageData.VersionFile());
        if (!Fs.existsSync(versionFile)) {
            Fse.createFileSync(versionFile);
            return false;
        }

        const versions: Buffer = Fs.readFileSync(versionFile);
        if (versions.indexOf(version) !== -1) {
            state = true;
        }

        return state;
    };

    private preparePackageForGit = (packageVersion: IPackageVersion, packageLocation: string): void => {
        this.removeGitPackage();
        this.copyGitPackage(packageLocation);
        this.writeNewVersion(packageVersion.VersionWithSeparator());
        this.updateReadme(packageVersion.Description());
    };

    private removeGitPackage = (): void => {
        if (Fs.existsSync(this.getRepositoryPackageLocation())) {
            Fse.removeSync(this.getRepositoryPackageLocation());
        }

        Fs.mkdirSync(this.getRepositoryPackageLocation());
    };

    private copyGitPackage = (packageLocation: string): void => {
        Fse.copySync(packageLocation, this.getRepositoryPackageLocation());
    };

    private writeNewVersion = (version: string): void => {
        Fs.appendFileSync(Path.join(this.repositoryLocation, this.packageData.VersionFile()), version);
    };

    private updateReadme = (description?: string): void => {
        if (description) {
            const readmeFile: string = Path.join(this.repositoryLocation, this.packageData.ReadmeFile());
            if (!Fs.existsSync(readmeFile)) {
                Fse.createFileSync(readmeFile);
            }

            Fs.writeFileSync(readmeFile, description + '\n');
        }
    };

    private createMessage = (packageVersion: IPackageVersion): string => {
        const unityVersion: string = packageVersion.UnityVersion() ? '\n@' + packageVersion.UnityVersion() : '';
        return packageVersion.Version() + ' - ' + packageVersion.TimeFormatted() + unityVersion;
    };

    private addNewVersionToGit = async (message: string): Promise<string> => {
        const packagePaths: string[] = await this.getPackageFiles();
        await this.gitOperations.gitAdd(packagePaths);
        return await this.gitOperations.gitCommit(message);
    };

    private getPackageFiles = async (): Promise<string[]> => {
        const paths: string[] = await Globby([this.repositoryLocation + '/**']);
        paths.forEach((value, index, array) => {
            array[index] = value.replace(this.repositoryLocation + '/', '');
        });
        return paths;
    };

    private createStatistics = async (packageVersion: IPackageVersion, shaCommit: string, totalVersions: number): Promise<void> => {
        const repositoryLocationStatistics: string = this.createTempDirectory();
        const gitOperationsStatistics: GitOperations = new GitOperations(this.packageData, repositoryLocationStatistics);
        await gitOperationsStatistics.gitClone(this.packageData.RepositoryData().StatisticsBranch());

        const readmeFile: string = Path.join(repositoryLocationStatistics, this.packageData.ReadmeFile());
        const fileData: string = Fs.readFileSync(readmeFile, 'utf8');
        const starting: number = fileData.indexOf(Utils.Statistics.baseBeginTag()) + Utils.Statistics.baseBeginTag().length;
        const ending: number = fileData.indexOf(Utils.Statistics.baseEndTag());
        const statisticsData: string = fileData.substring(starting, ending).trim();
        let newStatisticsData: string = '';

        const newElement: string = Utils.Statistics.buildStatisticData(packageVersion, this.packageData.RepositoryData(), shaCommit, totalVersions);
        if (Utils.Statistics.containsTag(statisticsData)) {
            const lines: string[] = statisticsData.split(/\s*[\r\n]+\s*/g);
            let elements: string[] = lines.filter(value => Utils.Statistics.containsTag(value));
            const header: string[] = lines.filter(value => elements.indexOf(value) < 0);
            let exists: boolean = false;
            for (let i: number = 0; i < elements.length; i++) {
                if (packageVersion.Name() === Utils.Statistics.getValueFromTag(elements[i])) {
                    elements[i] = newElement;
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                elements.push(newElement);
            }

            elements = elements.sort((a, b) => a.localeCompare(b));

            newStatisticsData = fileData.substring(0, starting + 1) + header.join('\n') + '\n' + elements.join('\n') + '\n' + fileData.substring(ending);
        }
        else {
            newStatisticsData = fileData.substring(0, starting + 1) + statisticsData + '\n' + newElement + fileData.substring(ending);
        }

        Fs.writeFileSync(readmeFile, newStatisticsData);
        await gitOperationsStatistics.gitAdd([this.packageData.ReadmeFile()]);
        await gitOperationsStatistics.gitCommit(`Update ${packageVersion.Name()} ${packageVersion.Version()}`);
        await gitOperationsStatistics.gitPush(this.packageData.RepositoryData().StatisticsBranch());
    };

    private createTempDirectory = (): string => {
        return Fs.mkdtempSync(Path.join(Config.TempWorkspace.repositoryDirectory(), this.packageData.Name() + '-'));
    };

    private getRepositoryPackageLocation = (): string => {
        return Path.join(this.repositoryLocation, this.packageData.Directory())
    };
}