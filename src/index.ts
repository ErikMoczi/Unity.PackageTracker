#!/usr/bin/env node

import {UnityPackages} from "./Unity/UnityPackages";
import {OPackageData} from "./Unity/Interfaces/Object/OPackageData";
import {AllUnityPackages} from "./Unity/AllUnityPackages";
import {Utils} from "./Unity/Utils";

const exceptPackages: string[] = [
    'com.unity.package-manager'
];
const searchPackages: Promise<OPackageData[]> = new AllUnityPackages().GetData(exceptPackages);
searchPackages.then(async (value) => {
    const unityPackages: UnityPackages = new UnityPackages();
    /*
        sometimes problems with package isomorphic-git, need to split data
     */
    await unityPackages.run(Utils.Base.arrayRange(value, 0, 0.2));
    await unityPackages.run(Utils.Base.arrayRange(value, 0.2, 0.4));
    await unityPackages.run(Utils.Base.arrayRange(value, 0.4, 0.6));
    await unityPackages.run(Utils.Base.arrayRange(value, 0.6, 0.8));
    await unityPackages.run(Utils.Base.arrayRange(value, 0.8, 1));
});

// const searchPackages: Array<OPackageData> = [
//     {name: 'com.unity.test-framework'},
//     {name: 'com.unity.test-framework.performance'},
//     {name: 'com.unity.burst'},
//     {name: 'com.unity.collections'},
//     {name: 'com.unity.entities'},
//     {name: 'com.unity.rendering.hybrid'},
//     {name: 'com.unity.jobs'},
//     {name: 'com.unity.mathematics'},
//     {name: 'com.unity.properties'},
// ];
//
// const unityPackages: UnityPackages = new UnityPackages();
// unityPackages.run(searchPackages);