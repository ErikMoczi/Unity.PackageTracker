export interface IRepositoryData {
    Url(): string

    GitName(): string

    Branch(): string

    TemplateBranch(): string

    StatisticsBranch(): string

    Username(): string

    Token(): string
}
