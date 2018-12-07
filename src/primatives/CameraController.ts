import GLInstance from "../GLInstance";
import Camera from "./Camera";

export default class CameraController {

    gl:GLInstance
    camera:Camera
    canvas:HTMLCanvasElement

    rotateRate:number = -300 //How fast to rotate, degrees per dragging delta
    panRate:number = 5       //How fast to pan, max unit per dragging delta
    zoomRate:number = 200    //How fast to zoom or can be viewed as forward/backward movement

    offsetX: number
    offsetY: number

    initX: number = 0
    initY: number = 0
    prevX: number = 0
    prevY: number = 0

    mouseIsDown:boolean = false

	constructor(gl:GLInstance,camera:Camera){
		let box = gl.canvas.getBoundingClientRect();
		this.canvas = gl.canvas;						//Need access to the canvas html element, main to access events
		this.camera = camera;							//Reference to the camera to control
		
		this.rotateRate = -300;							//How fast to rotate, degrees per dragging delta
		this.panRate = 5;								//How fast to pan, max unit per dragging delta
		this.zoomRate = 200;							//How fast to zoom or can be viewed as forward/backward movement

		this.offsetX = box.left;						//Help calc global x,y mouse cords.
        this.offsetY = box.top;
        

		this.canvas.addEventListener("mousedown", this.onMouseDown);		//Initializes the up and move events
        this.canvas.addEventListener("mousewheel", this.onMouseWheel);	//Handles zoom/forward movement
		this.canvas.addEventListener("mouseup",this.onMouseUp);
		this.canvas.addEventListener("mousemove",this.onMouseMove);        
	}

	//Transform mouse x,y cords to something useable by the canvas.
	getMouseVec2 (e) { 
        return {
            x:e.pageX - this.offsetX, 
            y:e.pageY - this.offsetY
        }; 
    }

	//Begin listening for dragging movement
	onMouseDown = (e:MouseEvent) => {
        this.mouseIsDown = true
		this.initX = this.prevX = e.pageX - this.offsetX;
		this.initY = this.prevY = e.pageY - this.offsetY;
	}

	//End listening for dragging movement
	onMouseUp = (e:MouseEvent) => {
        this.mouseIsDown = false
	}

	onMouseWheel = (e) => { //TODO: WheelEvent typing
		let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))); //Try to map wheel movement to a number between -1 and 1
		this.camera.panZ(delta * (this.zoomRate / this.canvas.height));		//Keep the movement speed the same, no matter the height diff
	}

	onMouseMove = (e) =>{
        if(!this.mouseIsDown) return

		let x = e.pageX - this.offsetX,	//Get X,y where the canvas's position is origin.
			y = e.pageY - this.offsetY,
			dx = x - this.prevX,		//Difference since last mouse move
			dy = y - this.prevY;

		//When shift is being helt down, we pan around else we rotate.
		if(!e.shiftKey){
			this.camera.transform.rotation.y += dx * (this.rotateRate / this.canvas.width);
			this.camera.transform.rotation.x += dy * (this.rotateRate / this.canvas.height);
		}else{
			this.camera.panX( -dx * (this.panRate / this.canvas.width) );
			this.camera.panY( dy * (this.panRate / this.canvas.height) );
		}

		this.prevX = x;
		this.prevY = y;
	}
}