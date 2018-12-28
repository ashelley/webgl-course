import Shader from "../../shaders/Shader";
import GLInstance from "../../GLInstance";
import { rgbArrayFromHex } from "../../helpers/rbaArrayfromHex";

export class TexturedCubeShader extends Shader {

    mainTexture: WebGLTexture = -1

    timeLoc: WebGLUniformLocation

	constructor(gl:GLInstance,pMatrix:Float32Array){
        super(gl,vertexShaderGLSL, fragmentShaderGLSL)
        
        let glContext = gl.glContext

        this.timeLoc = glContext.getUniformLocation(this.program, "uTime")

        let colorLoc = glContext.getUniformLocation(this.program, "uColor")
        let colors255 = rgbArrayFromHex("#FF0000", "#00FF00", "#0000FF", "#909090", "#C0C0C0", "#404040")
        glContext.uniform3fv(colorLoc, new Float32Array(colors255))

		this.setPerspective(pMatrix);
		glContext.useProgram(null);
    }

    setTime(dT:number) {
        let glContext = this.gl.glContext
        glContext.uniform1f(this.timeLoc, dT)
        return this
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
    
    in vec4 a_position;	//Standard position data.
    in vec3 a_norm;
    in vec2 a_uv;
    
    uniform mat4 uPMatrix;
    uniform mat4 uMVMatrix;
    uniform mat4 uCameraMatrix;

    uniform vec3 uColor[6];
    uniform float uTime;

    out lowp vec4 color;
    out highp vec2 texCoord;

    vec3 warp(vec3 p) {
        //return p + 0.2 * abs(cos(uTime * 0.002)) * a_norm;
        return p + 0.5 * abs(cos(uTime * 0.003 + p.y)) * a_norm;
    }

    void main(void) {
        texCoord = a_uv;
        color = vec4(uColor[int(a_position.w)], 1.0);
        gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position.xyz, 1.0);
        //gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(warp(a_position.xyz), 1.0);
    }
`

let fragmentShaderGLSL = `#version 300 es
    
    precision mediump float;
    
    in vec4 color;
    in highp vec2 texCoord;
    uniform sampler2D uMainTex;
    
    out vec4 finalColor;
    
    void main(void) {
        //finalColor = color;
        //finalColor = texture(uMainTex,vec2(texCoord.s, texCoord.t));
        finalColor = mix(color, texture(uMainTex, texCoord), 0.8f);
        //finalColor = color * texture(uMainTex, texCoord);
        //finalColor = color * texture(uMainTex, texCoord) * 0.5;
        //finalColor = color + texture(uMainTex, texCoord);
    }
`