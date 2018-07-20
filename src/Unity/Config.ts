import * as Path from 'path';

export namespace Config {
    export abstract class UnityRepository {
        private static readonly baseUrl: string = 'packages.unity.com';
        private static readonly stagingUrl: string = 'staging-';
        private static readonly protocol: string = 'https://';

        public static currentPackages = (): string => UnityRepository.protocol + UnityRepository.baseUrl;
        public static stagingPackages = (): string => UnityRepository.protocol + UnityRepository.stagingUrl + UnityRepository.baseUrl;
        public static repositoryUrls = (): string[] => [
            UnityRepository.currentPackages(),
            UnityRepository.stagingPackages()
        ];
    }

    export abstract class TempWorkspace {
        private static workDirectoryName: string = 'Packages';
        private static downloadDirectoryName: string = 'Download';
        private static repositoriesDirectoryName: string = 'Repositories';
        public static baseWorkDirectory = (): string => Path.resolve(__dirname, '../../' + TempWorkspace.workDirectoryName);
        public static downloadDirectory = (): string => Path.join(TempWorkspace.baseWorkDirectory(), TempWorkspace.downloadDirectoryName);
        public static repositoryDirectory = (): string => Path.join(TempWorkspace.baseWorkDirectory(), TempWorkspace.repositoriesDirectoryName);
    }

    export abstract class Git {
        public static readonly authorName: string = '???';
        public static readonly repositoryName: string = '???';
        public static readonly username: string = '???';
        public static readonly token: string = '???';
        public static readonly versionFile: string = 'versions.txt';
        public static readonly packageDirectory: string = 'package';
        public static readonly readmeFile: string = 'README.md';
        public static readonly versionSeparator: string = '\n';
    }
}
