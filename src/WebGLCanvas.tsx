import React from "react";
import GLInstance from "./GLInstance";
import createShader from "./shaders/createShader";

import fragmentShaderGLSL from './shaders/fragment.glsl'
import vertextShaderGLSL from './shaders/vertex.glsl'

import createProgram from "./shaders/createdProgram";

export default class WebGLCanvas extends React.Component<{},{}> {

    canvasRef = React.createRef<HTMLCanvasElement>()
    gl:GLInstance

    componentDidMount() {
        let gl = this.gl = new GLInstance(this.canvasRef.current)

        gl.setSize(500,500).clear()

        let glContext = gl.glContext  

        let vertextShader = createShader(glContext,vertextShaderGLSL,glContext.VERTEX_SHADER)
        let fragmentShader = createShader(glContext,fragmentShaderGLSL,glContext.FRAGMENT_SHADER)
 
        let shaderProgram = createProgram(glContext,vertextShader,fragmentShader,true)

        glContext.useProgram(shaderProgram)

        let aPositionLocation = glContext.getAttribLocation(shaderProgram, "a_position")
        let uPointSizeLocation = glContext.getUniformLocation(shaderProgram, "uPointSize")

        glContext.useProgram(null)

        var verts = new Float32Array([0,0,0])
        var vbo = glContext.createBuffer()

        glContext.bindBuffer(glContext.ARRAY_BUFFER, vbo)
        glContext.bufferData(glContext.ARRAY_BUFFER, verts, glContext.STATIC_DRAW)
        glContext.bindBuffer(glContext.ARRAY_BUFFER, null)

        glContext.useProgram(shaderProgram)
        glContext.uniform1f(uPointSizeLocation, 50.0)

        glContext.bindBuffer(glContext.ARRAY_BUFFER, vbo)        
        glContext.enableVertexAttribArray(aPositionLocation)
        glContext.vertexAttribPointer(aPositionLocation,3,glContext.FLOAT,false,0,0)
        glContext.bindBuffer(glContext.ARRAY_BUFFER, null)

        glContext.drawArrays(glContext.POINTS, 0, 1)
    }

    render() {
        return <div>
            <canvas ref={this.canvasRef} style={{border: '1px solid black'}} />
        </div>
    }
}