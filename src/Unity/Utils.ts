import {IRepositoryData} from './Interfaces/IRepositoryData';
import {IPackageVersion} from './Interfaces/IPackageVersion';
import Semver = require('semver');

export namespace Utils {
    export interface IDictionary<T> {
        [name: string]: T
    }

    export abstract class Base {
        public static arrayRange = <T>(data: T[], from: number, to: number): T[] => {
            if (from > to) {
                throw new Error(`From value is greater then to | ${from} > ${to}`);
            }

            if (from >= 1 || from < 0) {
                throw new Error(`From value is not in range 0 <= x < 1`);
            }

            if (to > 1 || to <= 0) {
                throw new Error(`To value is not in range 0 < x <= 1`);
            }

            const size = data.length;
            return data.slice(Math.round(from * size), Math.ceil(to * size));
        };
    }

    export abstract class Statistics {
        private static readonly beginComment: string = '<!--- @';
        private static readonly endComment: string = ' -->';
        private static readonly valueJoin: string = '-';
        private static readonly beginSymbol: string = 'Begin';
        private static readonly endSymbol: string = 'End';
        private static readonly baseSymbol: string = 'Statistics';

        public static beginTag = (name: string): string => Statistics.makeTag(name, Statistics.beginSymbol);
        public static endTag = (name: string): string => Statistics.makeTag(name, Statistics.endSymbol);
        public static baseBeginTag = (): string => Statistics.makeTag(Statistics.baseSymbol, Statistics.beginSymbol);
        public static baseEndTag = (): string => Statistics.makeTag(Statistics.baseSymbol, Statistics.endSymbol);
        public static containsTag = (value: string): boolean => value.indexOf(Statistics.beginComment) !== -1;
        public static getValueFromTag = (value: string): string => {
            if (!Statistics.containsTag(value)) {
                throw new Error(`Value doesn't contains tag ${value}`);
            }

            const starting: number = value.indexOf(Statistics.beginComment) + Statistics.beginComment.length;
            const ending: number = value.indexOf(Statistics.valueJoin + Statistics.beginSymbol + Statistics.endComment);

            return value.substring(starting, ending);
        };
        public static badge = (status: string, color: string, subject?: string): string => `https://img.shields.io/badge/${subject ? Statistics.escapeTag(subject) + '-' : ''}${Statistics.escapeTag(status)}-${color}.svg`;
        public static md_packageName = (packageName: string, repositoryUrl: string, description?: string): string => {
            let transformDescription: string = '""';
            if (description) {
                transformDescription = Markdown.removeEndLine(description!);
                transformDescription = Markdown.escape(transformDescription);
                transformDescription = `"${transformDescription}"`;
            }

            return `<b>[» ${packageName}](${repositoryUrl}/tree/${packageName} ${transformDescription})</b>`;
        };
        public static md_version = (version: string, repositoryUrl: string, shaCommit: string): string =>
            `[![](${Statistics.badge(version, Semver.prerelease(version) ? 'yellow' : 'blue')})](${repositoryUrl}/commit/${shaCommit})`;
        public static md_releaseData = (date: string, repositoryUrl: string, shaCommit: string): string =>
            `[![](${Statistics.badge(date, 'lightgrey')})](${repositoryUrl}/commit/${shaCommit})`;
        public static md_unityVersion = (unityVersion: string, repositoryUrl: string, shaCommit: string): string =>
            `[![](${Statistics.badge(unityVersion, 'red', '%40')})](${repositoryUrl}/commit/${shaCommit})`;
        public static md_totalVersions = (totalVersions: string, repositoryUrl: string, packageName: string): string =>
            `[![](${Statistics.badge(totalVersions, 'brightgreen', '%23')})](${repositoryUrl}/commits/${packageName})`;

        public static buildStatisticData = (packageVersion: IPackageVersion, repositoryData: IRepositoryData, shaCommit: string, totalVersions: number): string => {
            let element: string = '';
            element += '| ';
            element += Statistics.beginTag(packageVersion.Name());
            element += Statistics.md_packageName(packageVersion.Name(), repositoryData.Url(), packageVersion.Description());
            element += ' | ';
            element += Statistics.md_version(packageVersion.Version(), repositoryData.Url(), shaCommit);
            element += ' | ';
            element += Statistics.md_releaseData(packageVersion.TimeFormatted(), repositoryData.Url(), shaCommit);
            element += ' | ';
            if (packageVersion.UnityVersion()) {
                element += Statistics.md_unityVersion(packageVersion.UnityVersion()!, repositoryData.Url(), shaCommit);
            }
            element += ' | ';
            element += Statistics.md_totalVersions(totalVersions.toString(), repositoryData.Url(), packageVersion.Name());
            element += Statistics.endTag(packageVersion.Name());
            element += ' |';

            return element;
        };

        private static makeTag = (name: string, symbol: string): string => `${Statistics.beginComment}${name}${Statistics.valueJoin}${symbol}${Statistics.endComment}`;
        private static escapeTag = (value: string): string => value.replace('-', '--').replace('_', '__');
    }

    export abstract class Markdown {
        private static readonly map: IDictionary<string> = {
            '*': '\\*',
            '#': '\\#',
            '(': '\\(',
            ')': '\\)',
            '[': '\\[',
            ']': '\\]',
            _: '\\_',
            '\\': '\\\\',
            '+': '\\+',
            '-': '\\-',
            '`': '\\`',
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '\\"'
        };

        public static escape = (value: string): string => value.replace(/[\*\(\)\[\]\+\-\\_`#<>"]/g, m => Markdown.map[m]);
        public static removeEndLine = (value: string): string => value.replace(/(\r\n|\n|\r)/gm, ' ');
    }
}