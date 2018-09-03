import {OPackageDist} from './Object/OPackageDist';

export interface IPackageVersion {
    id(): string;

    Name(): string;

    Version(): string;

    VersionWithSeparator(): string

    Dist(): OPackageDist;

    Keywords(): string[];

    Time(): string;

    TimeFormatted(): string

    UnityVersion(): string | undefined;

    Category(): string | undefined;

    Description(): string | undefined;
}
