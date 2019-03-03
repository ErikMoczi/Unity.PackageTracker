import {Config} from './Config';
import {OPackageData} from './Interfaces/Object/OPackageData';
import Axios from 'axios';
import Cheerio from 'cheerio';

export class AllUnityPackages {
    private readonly repositoryUrl: string = Config.UnityRepository.currentPackageInfo();

    public GetData = async (exceptPackages: string[] = []): Promise<OPackageData[]> => {
        const packageData: OPackageData[] = [];
        const packageNames: string[] = await this.GetPackageNames();
        for (const item of packageNames.filter(value => exceptPackages.indexOf(value) === -1)) {
            packageData.push({name: item});
        }

        return packageData;
    };

    private GetPackageNames = async (): Promise<string[]> => {
        const packageNames: string[] = [];
        try {
            const response = await Axios.get(Config.UnityRepository.currentPackageInfo());
            Cheerio.load(response.data)('a[onclick="navi(event)"]').each(({}, element) => {
                const href: string = element.attribs.href;
                const packageName: string = href.substring(1, href.length - 1);
                if (!packageName.startsWith('.')) {
                    packageNames.push(packageName);
                }
            });
        }
        catch (e) {
            throw new Error(`Problem with getting package names from url ${this.repositoryUrl} - ${e.message}`);
        }

        return packageNames;
    }
}