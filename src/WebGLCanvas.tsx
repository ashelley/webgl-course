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
import CubeMap from "./scenes/CubeMap";
import ObjTest from "./scenes/ObjTest";
import SiameseCat from "./scenes/SiameseCat";
import PhongLighting from "./scenes/PhongLighting";


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
        //let scene = new SimpleVAO(this.gl)
        //let scene = new SimpleVAOGrid(this.gl)
        //let scene = new TestGridTransformation(this.gl)
        //let scene = new TestMouseController(this.gl)
        //let scene = new QuadTest(this.gl)
        //let scene = new TextureTest(this.gl)
        //let scene = new Cube8Test(this.gl)
        //let scene = new CubeTest(this.gl)
        //let scene = new CubeMap(this.gl)
        // let scene = new ObjTest(this.gl)
        // let scene = new SiameseCat(this.gl)
        let scene = new PhongLighting(this.gl)

        await scene.init()
        scene.start()
    }

    render() {
        return <canvas ref={this.canvasRef} style={{border: '1px solid black'}} />
    }
}