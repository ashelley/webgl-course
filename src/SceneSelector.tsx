import { useCallback, useState } from "react";
import TestSoftwareLineDrawing from "./software_scenes/TestSoftwareLineDrawing";
import TestWireFrame from "./software_scenes/TestWireFrame";
import TriangleRasterization from "./software_scenes/TriangleRasterization";
import TestShadedRandom from "./software_scenes/TestShadedRandom";
import TestSimpleShading from "./software_scenes/TestSimpleShading";
import TestZBuffer from "./software_scenes/TestZBuffer";
import TestProjection from "./software_scenes/TestProjection";
import TestMaxtrixTransform from "./software_scenes/TestMatrixTransform";
import TestRayTracer from "./software_scenes/TestRayTracer";
import TestXTree from "./software_scenes/TestXTree";
import TestPinHole from "./software_scenes/TestPinHole";
import TriangleRasterizationScratch from "./software_scenes/TriangleRasterizationScratch";
import PerspectiveRasterizationScratchZBuffer from "./software_scenes/PerspectiveRasterizationScratchZBuffer";
import GURU8_8 from "./software_scenes/GURU8_8";
import GURU7_1 from './software_scenes/GURU7_1';
import React from "react";

let scenes:{[name:string]:any} = {}

scenes['guru8_8'] = {Component: GURU8_8, label: 'Guru 8-8'}
scenes['guru7_1'] = {Component: GURU7_1, label: 'Guru 7-1'}

function SceneOption({scene,setScene}:{scene:string,setScene:(name:string) => void}) {

    let options = []
    for(let key in scenes) {
        let info = scenes[key]
        let {label} = info
        options.push(<option key={key} value={key}>{label}</option>)
    }

    let onSceneChange = useCallback((e) => {
        setScene(e.target.value)
    },[])

    return (
        <select value={scene} onChange={onSceneChange}>
            {options}
        </select>
    )
}

export default function SceneSelector() {

    let [scene,setScene] = useState<string>('guru8_8')

    let {Component} = scenes[scene]

    return (
        //* <WebGLCanvas /> */}
        // <TestSoftwareLineDrawing />
        // <TestWireFrame />
        //<TriangleRasterization />
        //<TestShadedRandom />
        //<TestSimpleShading />
        // <TestZBuffer />
        //<TestProjection />   //TODO: not complete
        //<TestMaxtrixTransform />
        //<TestRayTracer />
        //<TestXTree />
        //<TestPinHole />
        //<TriangleRasterizationScratch />
        //<PerspectiveRasterizationScratchZBuffer />
        <>
        <div style={{position:'absolute', top: 0, right: 0}}>
            <SceneOption scene={scene} setScene={setScene} />
        </div>
        <Component />
        </>
    )
}