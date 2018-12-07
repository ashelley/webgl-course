import GLInstance from "../GLInstance";
import Transform, { deg2Rad } from "./Transform";
import Matrix4 from "../helpers/Matrix4";

export enum CameraMode {    
    MODE_FREE = 0,
    MODE_ORBIT = 1
}

export default class Camera {

    mode:CameraMode  = CameraMode.MODE_ORBIT

    transform:Transform
    projectionMatrix:Float32Array
    viewMatrix:Float32Array

	constructor(gl:GLInstance,fov?:number,near?:number,far?:number) {
        //Setup the perspective matrix
        let ratio = gl.canvas.width / gl.canvas.height;        
        
        this.projectionMatrix = new Float32Array(16);
		this.transform = new Transform();		//Setup transform to control the position of the camera
		this.viewMatrix = new Float32Array(16);	//Cache the matrix that will hold the inverse of the transform.        
        
		Matrix4.perspective(this.projectionMatrix, fov || 45, ratio, near || 0.1, far || 100.0);
	}

	panX(v:number){
        if(this.mode == CameraMode.MODE_ORBIT) return; // Panning on the X Axis is only allowed when in free mode
        
		this.updateViewMatrix();
		this.transform.position.x += this.transform.right[0] * v;
		this.transform.position.y += this.transform.right[1] * v;
		this.transform.position.z += this.transform.right[2] * v; 
	}

	panY(v:number){
		this.updateViewMatrix();
		this.transform.position.y += this.transform.up[1] * v;
        if(this.mode == CameraMode.MODE_ORBIT) return; //Can only move up and down the y axix in orbit mode
        
		this.transform.position.x += this.transform.up[0] * v;
		this.transform.position.z += this.transform.up[2] * v; 
	}

	panZ(v:number){
		this.updateViewMatrix();
		if(this.mode == CameraMode.MODE_ORBIT){
			this.transform.position.z += v; //orbit mode does translate after rotate, so only need to set Z, the rotate will handle the rest.
		}else{
			//in freemode to move forward, we need to move based on our forward which is relative to our current rotation
			this.transform.position.x += this.transform.forward[0] * v;
			this.transform.position.y += this.transform.forward[1] * v;
			this.transform.position.z += this.transform.forward[2] * v; 
		}
	}

	//To have different modes of movements, this function handles the view matrix update for the transform object.
	updateViewMatrix(){
		//Optimize camera transform update, no need for scale nor rotateZ
		if(this.mode == CameraMode.MODE_FREE){
			this.transform.viewMatrix.reset()
				.vtranslate(this.transform.position)
				.rotateX(this.transform.rotation.x * deg2Rad)
				.rotateY(this.transform.rotation.y * deg2Rad);
				
		}else{
			this.transform.viewMatrix.reset()
				.rotateX(this.transform.rotation.x * deg2Rad)
				.rotateY(this.transform.rotation.y * deg2Rad)
				.vtranslate(this.transform.position);

		}

		this.transform.updateDirection();

		//Cameras work by doing the inverse transformation on all meshes, the camera itself is a lie :)
		Matrix4.invert(this.viewMatrix,this.transform.viewMatrix.raw);
		return this.viewMatrix;
	}
}