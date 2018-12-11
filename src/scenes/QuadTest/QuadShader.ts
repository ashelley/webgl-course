import Shader from "../../shaders/Shader";
import GLInstance from "../../GLInstance";

export class QuadShader extends Shader {
	constructor(gl:GLInstance,pMatrix:Float32Array){
        super(gl,vertexShaderGLSL, fragmentShaderGLSL)
        
        let glContext = gl.glContext

		//Standrd Uniforms
		this.setPerspective(pMatrix);

		//Cleanup
		glContext.useProgram(null);
	}
}

let vertexShaderGLSL = `#version 300 es
    
    in vec3 a_position;	//Standard position data.
    in vec2 a_uv;
    
    uniform mat4 uPMatrix;
    uniform mat4 uMVMatrix;
    uniform mat4 uCameraMatrix;
    
    out vec2 uv;
    out vec3 color;

    void main(void){
        uv = a_uv;
        gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position, 1.0);
        color = vec3(gl_Position.x,gl_Position.y, gl_Position.z); 
    }
`

let fragmentShaderGLSL = `#version 300 es
    
    precision mediump float;
    
    in vec2 uv;

    in vec3 color;
    
    out vec4 finalColor;
    
    void main(void){

        finalColor = vec4(color,1.0);

        //Square Border
        //float c = (uv.x <= 0.1 || uv.x >=0.9 || uv.y <= 0.1 || uv.y >= 0.9)? 0.0 : 1.0;
        //finalColor = vec4(c,c,c,1.0-c);

    
        //Circle
        /*
        vec2 delta = uv - vec2(0.5,0.5); //delta position from center;
        float dist = 0.5 - sqrt(delta.x*delta.x + delta.y*delta.y);
        float border = 0.01;
        float a = 0.0;
        if(dist > border) a = 1.0;
        else if(dist > 0.0) a = dist / border;
        finalColor = vec4(0.0,0.0,0.0,a);
        */
    }
`