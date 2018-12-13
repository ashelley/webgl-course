import Shader from "../../shaders/Shader";
import GLInstance from "../../GLInstance";

export class TexturedQuadShader extends Shader {

    mainTexture: WebGLTexture = -1

	constructor(gl:GLInstance,pMatrix:Float32Array){
        super(gl,vertexShaderGLSL, fragmentShaderGLSL)
        
        let glContext = gl.glContext

		//Standrd Uniforms
		this.setPerspective(pMatrix);

		//Cleanup
		glContext.useProgram(null);
    }
    
    setTexture(texture:WebGLTexture) {
        this.mainTexture = texture
    }

    preRender() {
        let glContext = this.gl.glContext

        glContext.activeTexture(glContext.TEXTURE0)
        glContext.bindTexture(glContext.TEXTURE_2D,this.mainTexture)
        glContext.uniform1i(this.uniformLoc.mainTexture, 0)

        return this
    }
}

let vertexShaderGLSL = `#version 300 es
    
    in vec3 a_position;	//Standard position data.
    in vec2 a_uv;
    
    uniform mat4 uPMatrix;
    uniform mat4 uMVMatrix;
    uniform mat4 uCameraMatrix;

    out highp vec2 texCoord;


    void main(void) {
        texCoord = a_uv;
        gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position, 1.0);
    }
`

let fragmentShaderGLSL = `#version 300 es
    
    precision mediump float;
    
    in highp vec2 texCoord;
    uniform sampler2D uMainTex;
    
    out vec4 finalColor;
    
    void main(void) {
        finalColor = texture(uMainTex,vec2(texCoord.s, texCoord.t));
    }
`