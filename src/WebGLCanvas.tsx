import React from "react";
import GLInstance from "./GLInstance";
import SimpleAnimatedVertex from "./scenes/SimpleAnimatedVertex";
import SimpleVAO from "./scenes/SimpleVAO";
import SimpleVAOGrid from "./scenes/SimpleVAOGrid";
import TestGridTransformation from "./scenes/TestGridTransformation";


export default class WebGLCanvas extends React.Component<{},{}> {

    canvasRef = React.createRef<HTMLCanvasElement>()
    gl:GLInstance

    componentDidMount() {
        let gl = this.gl = new GLInstance(this.canvasRef.current)

        gl.setSize(500,500).clear()
 
        //let scene = new SimpleAnimatedVertex(gl)
        // let scene = new SimpleVAO(gl)
        // let scene = new SimpleVAOGrid(gl)
        let scene = new TestGridTransformation(gl)

        scene.init()
        scene.start()


 
    }

    render() {
        return <div>
            <canvas ref={this.canvasRef} style={{border: '1px solid black'}} />
        </div>
    }
}