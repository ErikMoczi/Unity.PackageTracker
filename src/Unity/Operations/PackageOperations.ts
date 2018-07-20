import {Config} from '../Config';
import Axios from 'axios';
import * as Path from 'path';
import {ParsedPath} from 'path';
import * as Fs from 'fs';
import * as Fse from 'fs-extra';
import Decompress = require('decompress');

export class PackageOperations {
    public static getPackage = async (url: string): Promise<string> => {
        const packageFile: string = await PackageOperations.download(url);
        return await PackageOperations.transform(packageFile);
    };

    private static download = async (url: string): Promise<string> => {
        let packageLocation: string = Path.join(Config.TempWorkspace.downloadDirectory(), Path.basename(url));

        const response: any = await Axios.get(url, {responseType: 'stream'});
        response.data.pipe(Fs.createWriteStream(packageLocation));

        return new Promise<string>((resolve, reject) => {
            response.data.on('end', () => resolve(packageLocation));
            response.data.on('error', () => reject(packageLocation));
        });
    };

    private static transform = async (packageFile: string): Promise<string> => {
        const packagePath: ParsedPath = Path.parse(packageFile);
        const packageDirectory: string = Path.join(packagePath.dir, packagePath.name);
        await new Promise(resolve => setTimeout(resolve, 1000)); // vagrant problems
        await PackageOperations.decompress(packageFile, packageDirectory);
        await new Promise(resolve => setTimeout(resolve, 1000)); // vagrant problems
        PackageOperations.refactor(packageDirectory);
        await new Promise(resolve => setTimeout(resolve, 1000)); // vagrant problems
        return packageDirectory;
    };

    private static decompress = async (packageFile: string, packageDirectory: string): Promise<void> => {
        await Decompress(packageFile, packageDirectory);
    };

    private static refactor = (packageDirectory: string): void => {
        const files: string[] = Fs.readdirSync(packageDirectory);
        if (files.length === 1) {
            const singleDirectory: string = Path.join(packageDirectory, files[0]);
            try {
                Fse.copySync(singleDirectory, packageDirectory);
                Fse.removeSync(singleDirectory);
            }
            catch (e) {
                console.log(`Problem with refactoring package ${packageDirectory} - ${e.message}`);
            }
        }
    }
}
