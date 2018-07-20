import {Config} from '../Config';
import {IRepositoryData} from '../Interfaces/IRepositoryData';

export class RepositoryData implements IRepositoryData {
    private readonly name: string;
    private readonly branch: string;
    private readonly username: string;
    private readonly token: string;

    public constructor(branch: string, name?: string, username?: string, token?: string) {
        this.branch = branch;
        this.name = name ? name : Config.Git.repositoryName;
        this.username = username ? username : Config.Git.username;
        this.token = token ? token : Config.Git.token;
    }

    public Branch(): string {
        return this.branch;
    }

    public Name(): string {
        return this.name;
    }

    public Token(): string {
        return this.token;
    }

    public Username(): string {
        return this.username;
    }
}
