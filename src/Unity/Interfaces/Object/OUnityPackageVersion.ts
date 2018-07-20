export interface OUnityPackageVersion {
    _id: string
    name: string
    description?: string
    version: string
    dist: {
        tarball: string
        shasum: string
    }
    keywords: string[]
    dependencies: {
        [name: string]: string
    },
    unity?: string
    category?: string
}
