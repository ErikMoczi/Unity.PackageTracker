import * as Git from 'isomorphic-git';
import * as Fs from 'fs';
import {Config} from '../Config';
import {IPackageData} from '../Interfaces/IPackageData';

export class GitOperations {
    private readonly repositoryLocation: string;
    private readonly packageData: IPackageData;

    public constructor(packageData: IPackageData, repositoryLocation: string) {
        this.packageData = packageData;
        this.repositoryLocation = repositoryLocation;
    }

    public gitRemoteInfo = async (): Promise<Git.RemoteDescription> => {
        return await Git.getRemoteInfo({
            url: this.packageData.RepositoryData().GitName(),
            username: this.packageData.RepositoryData().Username(),
            token: this.packageData.RepositoryData().Token(),
        });
    };

    public gitGetBranch = async (branchName: string): Promise<void> => {
        await Git.branch({
            fs: Fs,
            dir: this.repositoryLocation,
            ref: branchName,
        });
    };

    public gitCheckout = async (branchName: string): Promise<void> => {
        await Git.checkout({
            fs: Fs,
            dir: this.repositoryLocation,
            ref: branchName,
        });
    };


    public gitClone = async (branchName: string): Promise<void> => {
        await Git.clone({
            fs: Fs,
            dir: this.repositoryLocation,
            username: this.packageData.RepositoryData().Username(),
            token: this.packageData.RepositoryData().Token(),
            url: this.packageData.RepositoryData().GitName(),
            ref: branchName,
            singleBranch: true,
            depth: 1
        });
    };

    public gitCommit = async (message: string): Promise<string> => {
        return await Git.commit({
            fs: Fs,
            dir: this.repositoryLocation,
            author: {
                name: Config.Git.authorName,
                email: this.packageData.RepositoryData().Username(),
            },
            message: message
        });
    };

    public gitAdd = async (filePaths: string[]): Promise<void> => {
        for (const filePath of filePaths) {
            await Git.add({
                fs: Fs,
                dir: this.repositoryLocation,
                filepath: filePath
            });
        }
    };

    public gitPush = async (branchName: string): Promise<void> => {
        await Git.push({
            fs: Fs,
            dir: this.repositoryLocation,
            remote: 'origin',
            ref: branchName,
            username: this.packageData.RepositoryData().Username(),
            token: this.packageData.RepositoryData().Token(),
        });
    };
}