import React from "react";
import TestSoftwareLineDrawing from "./software_scenes/TestSoftwareLineDrawing";
import TestWireFrame from "./software_scenes/TestWireFrame";
import TriangleRasterization from "./software_scenes/TriangleRasterization";
import TestShadedRandom from "./software_scenes/TestShadedRandom";

export default class HtmlCanvas extends React.Component<{},{}> {


    render() {
        return (
            // <TestSoftwareLineDrawing />
            // <TestWireFrame />
            //<TriangleRasterization />
            <TestShadedRandom />
        )
    }
}