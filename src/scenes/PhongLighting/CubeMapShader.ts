import Shader from "../../shaders/Shader";
import GLInstance from "../../GLInstance";

export class CubeMapShader extends Shader {

    dayTexture: WebGLTexture = -1
    dayTextureLoc: WebGLUniformLocation

    nightTexture: WebGLTexture = -1
    nightTextureLoc: WebGLUniformLocation
    
    timeLoc: WebGLUniformLocation

	constructor(gl:GLInstance,pMatrix:Float32Array){
        super(gl,vertexShaderGLSL, fragmentShaderGLSL)
        
        let glContext = gl.glContext

        this.timeLoc = glContext.getUniformLocation(this.program, "uTime")
        this.dayTextureLoc = glContext.getUniformLocation(this.program, "uDayTex")
        this.nightTextureLoc = glContext.getUniformLocation(this.program, "uNightTex")        

        this.setPerspective(pMatrix)    

		glContext.useProgram(null);
    }

    setDayTexture(texture:WebGLTexture) {
        this.dayTexture = texture
    }

    setNightTexture(texture:WebGLTexture) {
        this.nightTexture = texture
    }    

    setTime(dT:number) {
        let glContext = this.gl.glContext
        glContext.uniform1f(this.timeLoc, dT)
        return this
    }

    preRender() {
        let glContext = this.gl.glContext

        glContext.activeTexture(glContext.TEXTURE0)
        glContext.bindTexture(glContext.TEXTURE_CUBE_MAP,this.dayTexture)
        glContext.uniform1i(this.dayTextureLoc, 0)        

        glContext.activeTexture(glContext.TEXTURE1)
        glContext.bindTexture(glContext.TEXTURE_CUBE_MAP,this.nightTexture)
        glContext.uniform1i(this.nightTextureLoc, 1)        

        return this
    }
}

let vertexShaderGLSL = `#version 300 es
    
    in vec4 a_position;	
    in vec2 a_uv;
    
    uniform mat4 uPMatrix;
    uniform mat4 uMVMatrix;
    uniform mat4 uCameraMatrix;

    out highp vec3 texCoord;

    void main(void) {
        texCoord = a_position.xyz;
        gl_Position = uPMatrix * uCameraMatrix * vec4(a_position.xyz, 1.0);
    }
`

let fragmentShaderGLSL = `#version 300 es
    
    precision mediump float;

    in highp vec3 texCoord;
    
    uniform samplerCube uDayTex;
    uniform samplerCube uNightTex;

    uniform float uTime;    
    
    out vec4 finalColor;
    
    void main(void) {
        finalColor = mix(texture(uDayTex,texCoord), texture(uNightTex, texCoord), abs(sin(uTime * 0.0005)));
    }
`