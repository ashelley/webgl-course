import Shader from "../../shaders/Shader";
import GLInstance from "../../GLInstance";

export class GridAxisShader extends Shader {
	constructor(gl:GLInstance,pMatrix:Float32Array){
        super(gl,vertexShaderGLSL, fragmentShaderGLSL)
        
        let glContext = gl.glContext

		//Standrd Uniforms
		this.setPerspective(pMatrix);

		//Custom Uniforms 
        var uColor	= glContext.getUniformLocation(this.program,"uColor");
        
		glContext.uniform3fv(uColor, new Float32Array([ 0.8,0.8,0.8,  1,0,0,  0,1,0,  0,0,1 ]));

		//Cleanup
		glContext.useProgram(null);
	}
}

let vertexShaderGLSL = `#version 300 es
    in vec3 a_position;
    layout(location=4) in float a_color;

    uniform mat4 uPMatrix;
    uniform mat4 uMVMatrix;
    uniform mat4 uCameraMatrix;
    uniform vec3 uColor[4];

    out lowp vec4 color;

    void main(void) {
        color = vec4(uColor[ int(a_color) ],1.0);
        gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position, 1.0);
    }
`

let fragmentShaderGLSL = `#version 300 es
    precision mediump float;
    in vec4 color;
    out vec4 finalColor;

    void main(void) { 
        finalColor = color; 
    }
`