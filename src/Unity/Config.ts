import * as Path from 'path';

export namespace Config {
    export abstract class UnityRepository {
        private static readonly baseUrl: string = 'packages.unity.com';
        private static readonly stagingUrl: string = 'staging-';
        private static readonly protocol: string = 'https://';
        private static readonly download: string = 'download.';
        private static readonly npmJson: string = '/.npm/all.json';

        public static currentPackages = (): string => UnityRepository.protocol + UnityRepository.baseUrl;
        public static stagingPackages = (): string => UnityRepository.protocol + UnityRepository.stagingUrl + UnityRepository.baseUrl;
        public static repositoryUrls = (): string[] => [
            UnityRepository.currentPackages(),
            UnityRepository.stagingPackages()
        ];

        public static currentPackageInfo = (): string => UnityRepository.protocol + UnityRepository.download + UnityRepository.baseUrl + UnityRepository.npmJson;
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
        public static readonly repositoryUrl: string = '???';
        public static readonly username: string = '???';
        public static readonly token: string = '???';
        public static readonly repositoryGitName: string = Git.repositoryUrl + '.git';
        public static readonly templateBranch: string = 'packageTemplate';
        public static readonly statisticsBranch: string = 'master';
        public static readonly versionFile: string = 'versions.txt';
        public static readonly packageDirectory: string = 'package';
        public static readonly readmeFile: string = 'README.md';
        public static readonly versionSeparator: string = '\n';
    }
}
