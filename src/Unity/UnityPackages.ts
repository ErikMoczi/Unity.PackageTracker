import * as Fs from 'fs';
import * as Fse from 'fs-extra';
import {Config} from './Config';
import {OPackageData} from "./Interfaces/Object/OPackageData";
import {GitOperations} from "./Operations/GitOperations";
import {PackageHistory} from "./Operations/PackageHistory";
import {IPackageVersion} from "./Interfaces/IPackageVersion";

export class UnityPackages {
    private readonly packageHistory: PackageHistory;

    public constructor(repositoryUrls: string[] = Config.UnityRepository.repositoryUrls()) {
        this.packageHistory = new PackageHistory(repositoryUrls);
    }

    public run = async (packageData: OPackageData[], afterDoneCleanUp: boolean = false): Promise<void> => {
        this.initWorkspace();
        await this.processing(packageData);
        if (afterDoneCleanUp) {
            this.cleanUp();
        }
    };

    private processing = async (packageData: OPackageData[]): Promise<void> => {
        for (const item of packageData) {
            const packageVersions: IPackageVersion[] = await this.packageHistory.getPackageVersions(item.name);
            const gitOperations: GitOperations = new GitOperations(item);
            await gitOperations.proceed(packageVersions);
        }
    };

    private initWorkspace = (): void => {
        this.cleanUp();
        this.init();
    };

    private cleanUp = (): void => {
        if (Fs.existsSync(Config.TempWorkspace.baseWorkDirectory())) {
            Fse.removeSync(Config.TempWorkspace.baseWorkDirectory());
        }
    };

    private init = (): void => {
        Fse.mkdirsSync(Config.TempWorkspace.downloadDirectory());
        Fse.mkdirsSync(Config.TempWorkspace.repositoryDirectory());
    };
}
