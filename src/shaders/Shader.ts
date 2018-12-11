import GLInstance from "../GLInstance";
import createProgram from "./createdProgram";
import getStandardAttribLocations, { StandardShaderAttributeLocations } from "./standardAttributeLocations";
import { VAO } from "./createMeshVAO";
import { bindVertexArray } from "./vertexArray";
import loadShaderProgram from "./loadShaderProgram";
import Model from "../primatives/Model";
import getStandardUniformLocations, { StandardShaderUniformLocations } from "./standardUniformLocations";

export default class Shader {

    gl:GLInstance
    program:WebGLProgram

    attribLoc:StandardShaderAttributeLocations
    uniformLoc:StandardShaderUniformLocations

	constructor(gl:GLInstance,vertShaderSrc:string,fragShaderSrc:string){
        this.gl = gl
        let glContext = gl.glContext        

        this.program = loadShaderProgram(glContext,vertShaderSrc,fragShaderSrc,true);

		if(this.program != null){
			glContext.useProgram(this.program);
            this.attribLoc = getStandardAttribLocations(glContext,this.program);
            this.uniformLoc = getStandardUniformLocations(glContext, this.program);
		}

		//NOTE: Extended shaders should deactivate shader when done calling super and setting up custom parts in the constructor.
	}

	activate() { 
        let glContext = this.gl.glContext
        glContext.useProgram(this.program)
        return this
    }
	deactivate() { 
        let glContext = this.gl.glContext
        glContext.useProgram(null)
        return this
    }

	dispose(){
        let glContext = this.gl.glContext
		if(glContext.getParameter(glContext.CURRENT_PROGRAM) === this.program) { 
            glContext.useProgram(null)
        }
		glContext.deleteProgram(this.program);
    }
    
	setPerspective(matData:Float32Array) {	
        this.gl.glContext.uniformMatrix4fv(this.uniformLoc.perspective, false, matData); 
        return this; 
    }
	setModalMatrix(matData){	this.gl.glContext.uniformMatrix4fv(this.uniformLoc.modalMatrix, false, matData); return this; }
	setCameraMatrix(matData){	this.gl.glContext.uniformMatrix4fv(this.uniformLoc.cameraMatrix, false, matData); return this; }    

	preRender() {

    } 

    renderModel(model:Model) {
        let glContext = this.gl.glContext
        this.setModalMatrix(model.transform.getViewMatrix());
        this.render(model.vao)
    }

	render(vao:Partial<VAO>) {
        let glContext = this.gl.glContext
        bindVertexArray(glContext, vao.vao)
        
        if(vao.noCulling) {
            glContext.disable(glContext.CULL_FACE)
        }

        if(vao.doBlending) {
            glContext.enable(glContext.BLEND)
        }
		
		if(vao.indexCount) {
            glContext.drawElements(vao.drawMode, vao.indexCount, glContext.UNSIGNED_SHORT, 0)
        }
		else {
            glContext.drawArrays(vao.drawMode, 0, vao.vertexCount)
        }

		bindVertexArray(glContext, null)

		return this
	}
}