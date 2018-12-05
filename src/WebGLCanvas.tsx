import React from "react";
import GLInstance from "./GLInstance";
import SimpleAnimatedVertex from "./scenes/SimpleAnimatedVertex";
import SimpleVAO from "./scenes/SimpleVAO";


export default class WebGLCanvas extends React.Component<{},{}> {

    canvasRef = React.createRef<HTMLCanvasElement>()
    gl:GLInstance

    componentDidMount() {
        let gl = this.gl = new GLInstance(this.canvasRef.current)

        gl.setSize(500,500).clear()
 
        // let scene = new SimpleAnimatedVertex(gl)
        let scene = new SimpleVAO(gl)

        scene.init()
        scene.start()


 
    }

    render() {
        return <div>
            <canvas ref={this.canvasRef} style={{border: '1px solid black'}} />
        </div>
    }
}