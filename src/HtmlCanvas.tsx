import React from "react";
import TestSoftwareLineDrawing from "./software_scenes/TestSoftwareLineDrawing";
import TestWireFrame from "./software_scenes/TestWireFrame";

export default class HtmlCanvas extends React.Component<{},{}> {


    render() {
        return (
            // <TestSoftwareLineDrawing />
            <TestWireFrame />
        )
    }
}