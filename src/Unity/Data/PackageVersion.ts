import {IPackageVersion} from "../Interfaces/IPackageVersion";
import {OPackageDist} from "../Interfaces/Object/OPackageDist";
import {Config} from "../Config";
import Moment = require('moment');

export class PackageVersion implements IPackageVersion {
    private readonly _id: string;
    private readonly name: string;
    private readonly version: string;
    private readonly dist: OPackageDist;
    private readonly keywords: string[];
    private readonly time: string;
    private readonly unityVersion?: string;
    private readonly category?: string;
    private readonly description?: string;

    constructor(id: string, name: string, version: string, dist: OPackageDist, keywords: string[], time: string, unityVersion?: string, category?: string, description?: string) {
        this._id = id;
        this.name = name;
        this.version = version;
        this.dist = dist;
        this.keywords = keywords;
        this.time = time;
        this.unityVersion = unityVersion;
        this.category = category;
        this.description = description;
    }

    Category(): string | undefined {
        return this.category;
    }

    Description(): string | undefined {
        return this.description;
    }

    Dist(): OPackageDist {
        return this.dist;
    }

    Keywords(): string[] {
        return this.keywords;
    }

    Name(): string {
        return this.name;
    }

    Time(): string {
        return "";
    }

    UnityVersion(): string | undefined {
        return this.unityVersion;
    }

    Version(): string {
        return this.version;
    }

    id(): string {
        return this._id;
    }

    TimeFormatted(): string {
        let time = 'XXX';
        if (this.time) {
            time = Moment(this.time).format('YYYY/MM/DD');
        }

        return time;
    }

    VersionWithSeparator(): string {
        return this.version + Config.Git.versionSeparator;
    }
}
