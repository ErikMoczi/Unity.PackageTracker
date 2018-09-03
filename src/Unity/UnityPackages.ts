import * as Fs from 'fs';
import * as Fse from 'fs-extra';
import {Config} from './Config';
import {OPackageData} from './Interfaces/Object/OPackageData';
import {PackageHistory} from './Operations/PackageHistory';
import {IPackageVersion} from './Interfaces/IPackageVersion';
import {RepositoryOperations} from './Operations/RepositoryOperations';

export class UnityPackages {
    private readonly packageHistory: PackageHistory;

    public constructor(repositoryUrls: string[] = Config.UnityRepository.repositoryUrls()) {
        this.packageHistory = new PackageHistory(repositoryUrls);
    }

    public run = async (packageData: OPackageData[], afterDoneCleanUp: boolean = true): Promise<void> => {
        this.initWorkspace();
        await this.processing(packageData);
        if (afterDoneCleanUp) {
            this.cleanUp();
        }
    };

    private processing = async (packageData: OPackageData[]): Promise<void> => {
        for (const item of packageData) {
            const packageVersions: IPackageVersion[] = await this.packageHistory.getPackageVersions(item.name);
            const repositoryOperations: RepositoryOperations = new RepositoryOperations(item);
            await repositoryOperations.proceed(packageVersions);
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
