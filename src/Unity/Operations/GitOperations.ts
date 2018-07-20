import Globby = require('globby');
import * as Path from "path";
import * as Fs from "fs";
import * as Git from "isomorphic-git";
import {Config} from "../Config";
import {IPackageData} from "../Interfaces/IPackageData";
import {OPackageData} from "../Interfaces/Object/OPackageData";
import {PackageData} from "../Data/PackageData";
import * as Fse from "fs-extra";
import {PackageOperations} from "./PackageOperations";
import {IPackageVersion} from "../Interfaces/IPackageVersion";

export class GitOperations {
    private readonly repositoryLocation: string;
    private readonly packageData: IPackageData;

    public constructor(packageData: OPackageData) {
        this.packageData = new PackageData(packageData.name, packageData.directory, packageData.versionFile, packageData.repository);
        this.repositoryLocation = this.createTempDirectory();
    }

    public proceed = async (packageVersions: IPackageVersion[]): Promise<void> => {
        console.log(`<<<--- ${this.packageData.Name()} - total versions #${packageVersions.length}`);
        if (await this.init()) {
            let counter: number = 0;
            let error: boolean = false;
            for (const packageVersion of packageVersions) {
                try {
                    if (this.alreadyExistsVersion(packageVersion.VersionWithSeparator())) {
                        continue;
                    }

                    const packageLocation: string = await PackageOperations.getPackage(packageVersion.Dist().tarball);
                    this.preparePackageForGit(packageVersion, packageLocation);
                    await this.updateGit(this.createMessage(packageVersion));
                    counter++;
                }
                catch (e) {
                    console.log(`Problem with git operations for package ${packageVersion.Name()}/${packageVersion.Version()} - ${e.message}`);
                    error = true;
                    break;
                }
            }

            if (!error) {
                console.log(`(${counter > 0 ? counter + ' updated' : 'up-to-date'})`);
            }
        }
    };

    private init = async (): Promise<boolean> => {
        let gitError: boolean = false;

        try {
            await Git.clone({
                fs: Fs,
                dir: this.repositoryLocation,
                username: this.packageData.RepositoryData().Username(),
                token: this.packageData.RepositoryData().Token(),
                url: this.packageData.RepositoryData().Name(),
                ref: this.packageData.RepositoryData().Branch(),
                singleBranch: true,
                depth: 1
            });
        } catch (e) {
            console.log(`Failed to clone repository: ${this.packageData.RepositoryData().Name()}/${this.packageData.RepositoryData().Branch()} - e.message`);
            gitError = true;
        }

        return !gitError;
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
            Fs.writeFileSync(Path.join(this.repositoryLocation, Config.Git.readmeFile), description + '\n');
        }
    };

    private createMessage = (packageVersion: IPackageVersion): string => {
        const unityVersion: string = packageVersion.UnityVersion() ? '\n@' + packageVersion.UnityVersion() : '';
        return packageVersion.Version() + ' - ' + packageVersion.TimeFormatted() + unityVersion;
    };

    private updateGit = async (message: string): Promise<void> => {
        const filePaths: string[] = await this.getPaths();
        await this.gitAdd(filePaths);
        await this.gitCommit(message);
        await this.gitPush();
    };

    private gitAdd = async (filePaths: string[]): Promise<void> => {
        for (const filePath of filePaths) {
            await Git.add({
                fs: Fs,
                dir: this.repositoryLocation,
                filepath: filePath
            });
        }

        await Git.add({
            fs: Fs,
            dir: this.repositoryLocation,
            filepath: this.packageData.VersionFile()
        });
    };

    private getPaths = async (): Promise<string[]> => {
        const paths: string[] = await Globby([this.repositoryLocation + '/**']);
        paths.forEach((value, index, array) => {
            array[index] = value.replace(this.repositoryLocation + '/', '');
        });
        return paths;
    };

    private gitCommit = async (message: string): Promise<void> => {
        await Git.commit({
            fs: Fs,
            dir: this.repositoryLocation,
            author: {
                name: Config.Git.authorName,
                email: this.packageData.RepositoryData().Username(),
            },
            message: message
        });
    };

    private gitPush = async (): Promise<void> => {
        await Git.push({
            fs: Fs,
            dir: this.repositoryLocation,
            remote: 'origin',
            ref: this.packageData.RepositoryData().Branch(),
            username: this.packageData.RepositoryData().Username(),
            token: this.packageData.RepositoryData().Token(),
        });
    };

    private createTempDirectory = (): string => {
        return Fs.mkdtempSync(Path.join(Config.TempWorkspace.repositoryDirectory(), this.packageData.Name() + '-'));
    };

    private getRepositoryPackageLocation = (): string => {
        return Path.join(this.repositoryLocation, this.packageData.Directory())
    };
}
