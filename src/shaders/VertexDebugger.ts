import Transform from "../primatives/Transform";
import { rgbFromHex } from "../helpers/rbaArrayfromHex";
import createProgram from "./createdProgram";
import createArrayBuffer from "./createArrayBuffer";
import Camera from "../primatives/Camera";
import loadShaderProgram from "./loadShaderProgram";

export default class VertexDebugger {

    transform = new Transform()
    glContext:WebGLRenderingContext

    colors:number[] = []
    mVerts:number[] = [];
    mVertBuffer:WebGLBuffer = -1;
    mVertCount:number = 0;
    mVertexComponentLen:number = 4;
    mPointSize:number
    mShader:WebGLShader

    mUniformColor:WebGLUniformLocation
    mUniformProj:WebGLUniformLocation
    mUniformCamera:WebGLUniformLocation
    mUniformModelV:WebGLUniformLocation
    mUniformPointSize:WebGLUniformLocation
    mUniformCameraPos:WebGLUniformLocation

	constructor(glContext:WebGLRenderingContext, pntSize:number) {
        this.glContext = glContext
        this.mPointSize = pntSize
	}

	addColor(color:string){
        this.colors.push.apply(this.colors, rgbFromHex(color))
		return this;
	}

	addPoint(x1:number,y1:number,z1:number,cIndex:number = 0){
		this.mVerts.push(x1,y1,z1,cIndex);
		this.mVertCount = this.mVerts.length / this.mVertexComponentLen;
		return this;
	}

	addMeshPoints(cIndex:number,mesh:{aVert:number[]}){
		if(mesh.aVert === undefined) return this;

		var len = mesh.aVert.length;
		for(var i=0; i < len; i+=3){
			this.mVerts.push(
				mesh.aVert[i],
				mesh.aVert[i+1],
				mesh.aVert[i+2],
				cIndex
			);
		}

		this.mVertCount = this.mVerts.length / this.mVertexComponentLen;
		return this;
	}

	createShader(){

        let glContext = this.glContext
		//........................................
		this.mShader			=  loadShaderProgram(glContext,vertexShader,fragmentShader,true);
		this.mUniformColor		= glContext.getUniformLocation(this.mShader,"uColorAry");
		this.mUniformProj		= glContext.getUniformLocation(this.mShader,"uPMatrix");
		this.mUniformCamera		= glContext.getUniformLocation(this.mShader,"uCameraMatrix");
		this.mUniformModelV		= glContext.getUniformLocation(this.mShader,"uMVMatrix");
		this.mUniformPointSize	= glContext.getUniformLocation(this.mShader,"uPointSize");
		this.mUniformCameraPos	= glContext.getUniformLocation(this.mShader,"uCameraPos");

		//........................................
		//Save colors in the shader. Should only need to render once.
		glContext.useProgram(this.mShader);
		glContext.uniform3fv(this.mUniformColor, new Float32Array( this.colors ));
		glContext.uniform1f(this.mUniformPointSize, this.mPointSize);
		glContext.useProgram(null);
	}

	finalize(){
		this.mVertBuffer = createArrayBuffer(this.glContext, new Float32Array(this.mVerts));
		this.createShader();
		return this;
	}

	render(camera:Camera){
		//Update Transform Matrix (Modal View)
		this.transform.updateMatrix()

		let glContext = this.glContext

		//Start up the Shader
		glContext.useProgram(this.mShader);

		//Push Uniform Data
		glContext.uniformMatrix4fv(this.mUniformProj, false, camera.projectionMatrix); 
		glContext.uniformMatrix4fv(this.mUniformCamera, false, camera.viewMatrix);
		glContext.uniformMatrix4fv(this.mUniformModelV, false, this.transform.getViewMatrix());
		glContext.uniform3fv(this.mUniformCameraPos, new Float32Array( camera.transform.position.asArray()));

		//Activate Vertice Buffer Array
		glContext.bindBuffer(glContext.ARRAY_BUFFER, this.mVertBuffer);
		glContext.enableVertexAttribArray(0);
		glContext.vertexAttribPointer(0,this.mVertexComponentLen,glContext.FLOAT,false,0,0);

		//Draw
		glContext.drawArrays(glContext.POINTS,0,this.mVertCount);

		//Cleanup
		glContext.disableVertexAttribArray(0);
		glContext.useProgram(null);
		glContext.bindBuffer(glContext.ARRAY_BUFFER, null);
	}
}

let vertexShader = `#version 300 es
    layout(location=0) in vec4 a_position;

    uniform mat4 uPMatrix;
    uniform mat4 uCameraMatrix;
    uniform mat4 uMVMatrix;
    uniform vec3 uColorAry[6];
    uniform vec3 uCameraPos;
    uniform float uPointSize;

    out lowp vec4 color;

    void main(void) {
        vec4 pos = uMVMatrix * vec4(a_position.xyz, 1.0);
        color = vec4(uColorAry[ int(a_position.w) ],1.0); 
        gl_PointSize = (1.0 - distance( uCameraPos, pos.xyz ) / 10.0 ) * uPointSize;
        gl_Position = uPMatrix * uCameraMatrix * pos;
    }
`


var fragmentShader = `#version 300 es
    precision mediump float;
 
    in vec4 color;
 
    out vec4 finalColor;
    
    void main(void) { 
        finalColor = color; 
    }
`