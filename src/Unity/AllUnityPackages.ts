import {Config} from './Config';
import {OPackageData} from './Interfaces/Object/OPackageData';
import Axios from 'axios';

export class AllUnityPackages {
    private readonly repositoryUrl: string;

    public constructor() {
        this.repositoryUrl = Config.UnityRepository.currentPackageInfo();
    }

    public GetData = async (exceptPackages: string[] = []): Promise<OPackageData[]> => {
        let packageData: OPackageData[] = [];
        try {
            let response = await Axios.get(this.repositoryUrl);
            for (const item of Object.keys(response.data).filter(value => !value.startsWith('_') && exceptPackages.indexOf(value) === -1)) {
                packageData.push({name: item});
            }
        }
        catch (e) {
            throw new Error(`Problem with getting package json from url ${this.repositoryUrl} - ${e.message}`);
        }

        return packageData;
    };
}