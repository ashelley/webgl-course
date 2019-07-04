import GLInstance from "../GLInstance";
import Transform, { deg2Rad } from "./Transform";
import Matrix4 from "../helpers/Matrix4";
import { vec4, vec3 } from "../software_renderer/helpers";
import { mat4x4 } from '../helpers/math';

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

export interface IEulerCamera {
	pos: {x:number,y:number,z:number,w:number}
	dir: {x:number,y:number,z:number,w:number}
	target: {x:number,y:number,z:number,w:number}

	u: {x:number,y:number,z:number,w:number}
	v: {x:number,y:number,z:number,w:number}
	n: {x:number,y:number,z:number,w:number}

	nearClipZ: number
	farClipZ: number

	fov: number
	aspectRatio: number
	viewDistance: number
}

interface IEulerCameraInit {
	pos: {x:number,y:number,z:number,w:number}
	dir: {x:number,y:number,z:number,w:number}
	target: {x:number,y:number,z:number,w:number}	
	viewportWidth:number
	viewportHeight:number
	nearClipZ:number
	farClipZ:number
}

export let initializeEulerCamera = (args:IEulerCameraInit):IEulerCamera => {
	let campos = args.pos
	let camdir = args.dir
	let camtarget = args.target

	let cam_u = vec4(1,0,0,1) //+x 
	let cam_v = vec4(0,1,0,1) //+y
	let cam_n = vec4(0,0,1,1) //+z


	let nearclip = args.nearClipZ
	let farclip = args.farClipZ

	let fov = 90
	let aspectRatio = args.viewportWidth/args.viewportHeight

	let viewplaneWidth = 2
	let viewplaneHeight = 2 / aspectRatio

	let tan_fov_div2 = Math.tan(fov/2*Math.PI/180)

	let cameraViewDistance = 0.5 * viewplaneWidth * tan_fov_div2

	let rightClippingPlane:{x:number,y:number,z:number}        
	let leftClippingPlane:{x:number,y:number,z:number}
	let topClippingPlane:{x:number,y:number,z:number}
	let bottomClippingPlane:{x:number,y:number,z:number}

	if(fov == 90) {
		rightClippingPlane = vec3(1,0,-1) //x=z
		leftClippingPlane = vec3(-1,0,-1) //-x=z
		topClippingPlane = vec3(0,1,-1) //y=z
		bottomClippingPlane = vec3(0,-1,-1) //-y=z            
	}
	else {

	}

	return {
		pos: campos,
		dir: camdir,
		target: camtarget,

		fov: fov,
		aspectRatio: aspectRatio,
		viewDistance: cameraViewDistance,
	
		u: cam_u,
		v: cam_v,
		n: cam_n,
	
		nearClipZ: nearclip,
		farClipZ: farclip
	}
}

export let buildCameraMatrixEuler = (cam:IEulerCamera) => {
	// step 1: create the inverse translation matrix for the camera position        
	let matInverse = mat4x4( 1,        0,        0,        0,
		0,        1,        0,        0,
		0,        0,        1,        0,
		-cam.pos.x,-cam.pos.y,-cam.pos.z,1 )

	let matInvX:Float32Array // inverse camera x axis rotation matrix            
	let matInvY:Float32Array // inverse camera y axis rotation matrix         
	let matInvZ:Float32Array // inverse camera z axis rotation matrix     

	// step 2: create the inverse rotation sequence for the camera
	// rember either the transpose of the normal rotation matrix or
	// plugging negative values into each of the rotations will result
	// in an inverse matrix        

	let thetaX = cam.dir.x
	let thetaY = cam.dir.y
	let thetaZ = cam.dir.z

	// compute the sine and cosine of the angle x        
	{
	let cosTheta = Math.cos(thetaX) // no change since cos(-x) = cos(x)
	let sinTheta = -Math.sin(thetaX) // sin(-x) = -sin(x)

	matInvX = mat4x4(1,  0,        0        , 0,
			0,  cosTheta, sinTheta , 0,
			0, -sinTheta, cosTheta , 0,
			0, 0,         0        , 1)
	}

	// compute the sine and cosine of the angle y        
	{
	let cosTheta = Math.cos(thetaY) // no change since cos(-x) = cos(x)
	let sinTheta = -Math.sin(thetaY) // sin(-x) = -sin(x)

	matInvY = mat4x4(cosTheta, 0, -sinTheta,        0,
			0,        1,        0,         0,
			sinTheta, 0, cosTheta,         0,
			0,        0,         0,        1)
	}     

	// compute the sine and cosine of the angle z        
	{
	let cosTheta = Math.cos(thetaZ) // no change since cos(-x) = cos(x)
	let sinTheta = -Math.sin(thetaZ) // sin(-x) = -sin(x)

	matInvZ = mat4x4(cosTheta, sinTheta, 0,       0,
			-sinTheta,cosTheta, 0,       0,
			0,        0,        1,        0,
			0,        0,        0,        1)                             
	}          

	//ZYX SEQUENCE
	let matRot = new Float32Array(16)  // concatenated inverse rotation matrices            

	let mTmp = new Float32Array(16)
	Matrix4.mult(mTmp,matInvZ,matInvY)
	Matrix4.mult(matRot,mTmp,matInvX)

	let matCam = new Float32Array(16)
	Matrix4.mult(matCam, matInverse, matRot)

	return matCam
}