import Axios, {AxiosResponse} from 'axios';
import {OUnityPackageVersion} from '../Interfaces/Object/OUnityPackageVersion';
import {OUnityPackageInfo} from '../Interfaces/Object/OUnityPackageInfo';
import {PackageVersion} from '../Data/PackageVersion';
import {IPackageVersion} from '../Interfaces/IPackageVersion';
import Semver = require('semver');

export class PackageHistory {
    private readonly repositoryUrls: Array<string>;

    public constructor(repositoryUrls: Array<string>) {
        this.repositoryUrls = repositoryUrls;
    }

    public getPackageVersions = async (packageName: string): Promise<IPackageVersion[]> => {
        let packageVersions: IPackageVersion[] = [];

        try {
            const packageResponses: AxiosResponse<OUnityPackageInfo>[] = await this.getRepositoryResponses(packageName);
            packageVersions = this.getUniquePackageVersion(packageName, packageResponses);
        }
        catch (e) {
            throw new Error(`Problem with getting ${packageName} package versions - ${e.message}`);
        }

        this.orderVersions(packageVersions);

        return packageVersions;
    };

    private getRepositoryResponses = (packageName: string): Promise<AxiosResponse<OUnityPackageInfo>[]> => {
        return Axios.all(
            this.repositoryUrls.map(
                value => Axios.get<OUnityPackageInfo>(value + '/' + packageName)
            )
        );
    };

    private getUniquePackageVersion = (packageName: string, packageResponses: AxiosResponse<OUnityPackageInfo>[]): IPackageVersion[] => {
        const packageVersions: IPackageVersion[] = [];
        for (const packageResponse of packageResponses) {
            if (packageResponse.data.toString().indexOf('error') !== -1) {
                console.info(`Missing response data from package ${packageName} - ${packageResponse.data}`);
                continue;
            }

            const unityPackageInfo: OUnityPackageInfo = packageResponse.data;
            for (const version of Object.keys(unityPackageInfo.versions)) {
                const unityPackageVersion: OUnityPackageVersion = unityPackageInfo.versions[version];
                if (packageVersions.every(value => value.Version() !== version)) {
                    packageVersions.push(new PackageVersion(
                        unityPackageVersion._id,
                        unityPackageVersion.name,
                        unityPackageVersion.version,
                        unityPackageVersion.dist,
                        unityPackageVersion.keywords,
                        unityPackageInfo.time[unityPackageVersion.version],
                        unityPackageVersion.unity,
                        unityPackageVersion.category,
                        unityPackageVersion.description
                    ));
                }
            }
        }

        return packageVersions;
    };

    private orderVersions = (data: IPackageVersion[]): void => {
        data.sort((x, y) => {
            return Semver.compare(x.Version(), y.Version());
        });
    };
}
