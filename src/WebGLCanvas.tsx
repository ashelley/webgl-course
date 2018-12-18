import React from "react";
import GLInstance from "./GLInstance";
import SimpleAnimatedVertex from "./scenes/SimpleAnimatedVertex";
import SimpleVAO from "./scenes/SimpleVAO";
import SimpleVAOGrid from "./scenes/SimpleVAOGrid";
import TestGridTransformation from "./scenes/TestGridTransformation";
import TestMouseController from "./scenes/TestMouseController";
import QuadTest from "./scenes/QuadTest";
import TextureTest from "./scenes/TextureTest";
import Cube8Test from "./scenes/Cube8Test";
import CubeTest from "./scenes/CubeTest";


export default class WebGLCanvas extends React.Component<{},{}> {

    canvasRef = React.createRef<HTMLCanvasElement>()
    gl:GLInstance

    componentDidMount() {
        let gl = this.gl = new GLInstance(this.canvasRef.current)
        gl.setSize(500,500).clear()
        this.startScene()
    }

    async startScene() {
        //let scene = new SimpleAnimatedVertex(gl)
        //let scene = new SimpleVAO(gl)
        // let scene = new SimpleVAOGrid(gl)
        // let scene = new TestGridTransformation(gl)
        //let scene = new TestMouseController(gl)
        //let scene = new QuadTest(gl)
        //let scene = new TextureTest(this.gl)
        //let scene = new Cube8Test(this.gl)
        let scene = new CubeTest(this.gl)

        await scene.init()
        scene.start()
    }

    render() {
        return <canvas ref={this.canvasRef} style={{border: '1px solid black'}} />
    }
}