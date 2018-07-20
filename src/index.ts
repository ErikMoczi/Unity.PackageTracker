#!/usr/bin/env node

import {UnityPackages} from "./Unity/UnityPackages";
import {OPackageData} from "./Unity/Interfaces/Object/OPackageData";

const searchPackages: Array<OPackageData> = [
    {name: 'com.unity.burst'},
    {name: 'com.unity.collections'},
    {name: 'com.unity.entities'},
    {name: 'com.unity.incrementalcompiler'},
    {name: 'com.unity.jobs'},
    {name: 'com.unity.mathematics'},
    {name: 'com.unity.properties'},
];

const UnityPackage = new UnityPackages();
UnityPackage.run(searchPackages);
