import {Config} from '../Config';
import {IRepositoryData} from '../Interfaces/IRepositoryData';

export class RepositoryData implements IRepositoryData {
    private readonly url: string;
    private readonly gitName: string;
    private readonly branch: string;
    private readonly templateBranch: string;
    private readonly statisticsBranch: string;
    private readonly username: string;
    private readonly token: string;

    public constructor(branch: string, templateBranch?: string, statisticsBranch?: string, url?: string, gitName?: string, username?: string, token?: string) {
        this.branch = branch;
        this.templateBranch = templateBranch ? templateBranch : Config.Git.templateBranch;
        this.statisticsBranch = statisticsBranch ? statisticsBranch : Config.Git.statisticsBranch;
        this.url = url ? url : Config.Git.repositoryUrl;
        this.gitName = gitName ? gitName : Config.Git.repositoryGitName;
        this.username = username ? username : Config.Git.username;
        this.token = token ? token : Config.Git.token;
    }

    public Branch(): string {
        return this.branch;
    }

    public TemplateBranch(): string {
        return this.templateBranch;
    }

    public StatisticsBranch(): string {
        return this.statisticsBranch;
    }

    public Url(): string {
        return this.url;
    }

    public GitName(): string {
        return this.gitName;
    }

    public Token(): string {
        return this.token;
    }

    public Username(): string {
        return this.username;
    }
}
