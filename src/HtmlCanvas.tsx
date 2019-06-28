import React from "react";
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
import GURU7_1 from "./software_scenes/GURU8_8";
import GURU8_8 from "./software_scenes/GURU8_8";

export default class HtmlCanvas extends React.Component<{},{}> {


    render() {
        return (
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
            //<GURU7_1 />
            <GURU8_8 />
        )
    }
}