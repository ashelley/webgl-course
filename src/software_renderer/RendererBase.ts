import { makePoint, swapPointXY, sortPointByY, sortPointByX, Point } from "./helpers";
import Vector2 from "../helpers/Vector2";
import { add2d, multiply2d, subtract2d, multiply2dToScalar as multiply2dByScalar, barycentric, int, abs } from "../helpers/math";
import { boundingBox } from "../helpers/boundingBox";
import { pointInTriangle } from "../helpers/pointInTriangle";
import Vector3 from "../helpers/Vector3";
import Matrix4 from "../helpers/Matrix4";
import { Colors, Color } from "../primatives/Color";

export abstract class RendererBase {

    canvas:HTMLCanvasElement
    renderingContext: CanvasRenderingContext2D
    screenBuffer:Uint8ClampedArray    
    zBuffer:Float32Array
    width:number
    height:number

    bytesPerPixel:number = 4

    constructor(canvas:HTMLCanvasElement, width:number,height:number) {
        this.canvas = canvas
        this.renderingContext = canvas.getContext("2d");      
        this.width = width
        this.height = height          
        this.setSize(width,height)        
    }

    setSize(width:number,height:number) {
        this.width = width
        this.height = height

        let canvas = this.canvas        

        canvas.style.width = width + "px"
        canvas.style.height = height + "px"

        canvas.width = width
        canvas.height = height        

        let bufferSize = width*height*this.bytesPerPixel        

        let arrayBuffer = new ArrayBuffer(bufferSize)        
        this.screenBuffer = new Uint8ClampedArray(arrayBuffer)
        
        if(this.zBuffer != null) {
            this.setupZBuffer()
        }

        this.clear()
    }

    setupZBuffer() {
        let bufferSize = this.width*this.height * 4
        let arrayBuffer = new ArrayBuffer(bufferSize)
        this.zBuffer = new Float32Array(arrayBuffer)
    }

    lineCalcPixels(x0:number, y0:number, x1:number, y1:number, color:Color) { 
        for (let x=x0; x<=x1; x++) { 
            let t = (x-x0)/(x1-x0); 
            let y = y0*(1.-t) + y1*t; 
            this.setPixel(int(x), int(y), color)
        } 
    }    

    lineCalcPixelsForSlope(x0:number, y0:number, x1:number, y1:number, color:Color) { 
        let steep = false;
        let p0 = makePoint(x0,y0)
        let p1 = makePoint(x1,y1)
        if (abs(p0.x-p1.x)<abs(p0.y-p1.y)) { // if the line is steep, we transpose the image 
            swapPointXY(p0) 
            swapPointXY(p1)
            steep = true; 
        } 
        if (p0.x>p1.x) { // make it left−to−right 
            {
                let temp = p0.x
                p0.x = p1.x
                p1.x = temp            
            }
            {
                let temp = p0.y
                p0.y = p1.y
                p1.y = temp
            }
        } 
        
        for (let x=p0.x; x<=p1.x; x++) { 
            let t = (x-p0.x)/(p1.x-p0.x) 
            let y = p0.y*(1.-t) + p1.y*t 
            if (steep) { 
                this.setPixel(int(y),int(x),color)
            } else { 
                this.setPixel(int(x),int(y),color)
            } 
        } 
    }    

    lineCalcPixelsForSlopeAccumulateError(x0:number, y0:number, x1:number, y1:number, color:Color) { 
        let steep = false;
        let p0 = makePoint(x0,y0)
        let p1 = makePoint(x1,y1)
        if (abs(p0.x-p1.x)<abs(p0.y-p1.y)) { // if the line is steep, we transpose the image 
            swapPointXY(p0) 
            swapPointXY(p1)
            steep = true; 
        } 
        if (p0.x>p1.x) { // make it left−to−right 
            {
                let temp = p0.x
                p0.x = p1.x
                p1.x = temp            
            }
            {
                let temp = p0.y
                p0.y = p1.y
                p1.y = temp
            }
        } 
        
        let dx = p1.x-p0.x
        let dy = p1.y-p0.y
        let derror = abs(dy/dx); 
        let error = 0; 
        let y = p0.y; 
        for (let x=p0.x; x<=p1.x; x++) { 
            if (steep) { 
                this.setPixel(int(y), int(x), color); 
            } else { 
                this.setPixel(int(x), int(y), color); 
            } 
            error += derror; 
            if (error>.5) { 
                y += (p1.y>p0.y?1:-1); 
                error -= 1.; 
            } 
        }
    }      

    naiveLine(x0:number,y0:number,x1:number,y1:number, color:Color) {
        for(let t = 0.0; t < 1.0; t+= 0.1) {
            let x = int(x0 + (x1-x0)*t) 
            let y = int(y0 + (y1-y0)*t);
            this.setPixel(x,y,color)        
        }
    }

    line(p0:Vector2, p1:Vector2, color:Color = Colors.WHITE) {
        this.lineXY(p0.x, p0.y, p1.x, p1.y, color)
    }

    lineXY(x0:number,y0:number,x1:number,y1:number, color:Color) {
        this.lineCalcPixelsForSlopeAccumulateError(x0, y0, x1, y1, color)
    }

    screenSpaceLine(x0:number,y0:number,x1:number,y1:number,color:Color) {
        let screenX0 = Math.floor(x0)
        let screenY0 = Math.floor(y0)
        let screenX1 = Math.floor(x1)
        let screenY1 = Math.floor(y1)

        if(screenX0 < 0) screenX0 = 0
        if(screenY0 < 0) screenY0 = 0
        if(screenX1 < 0) screenX1 = 0
        if(screenY1 < 0) screenY1 = 0        

        if(screenX0 > this.width) screenX0 = this.width
        if(screenY0 > this.height) screenY0 = this.height
        if(screenX1 > this.width) screenX1 = this.width
        if(screenY1 > this.height) screenY1 = this.height           

        this.lineXY(screenX0,screenY0,screenX1,screenY1,color)
    }        

    triangleWithoutOrdering(t0:Vector2, t1:Vector2, t2:Vector2, color:Color = Colors.WHITE) {
        this.line(t0, t1, color)
        this.line(t1, t2, color)
        this.line(t2, t0, color)
    }

    triangleOutlineSegmented(t0:Vector2, t1:Vector2, t2:Vector2, 
                                            colorTopLeft:Color = Colors.RED, colorTopRight:Color = Colors.GREEN, 
                                            colorBottomLeft:Color = Colors.YELLOW, colorBottomRight:Color = Colors.PURPLE) {
        sortPointByY(t0,t1)
        sortPointByY(t0,t2)
        sortPointByY(t1,t2)  
        
        
        let totalHeight = t2.y - t0.y
        for(let y = t0.y; y < t1.y; y++) {
            let segmentHeight = t1.y - t0.y + 1
            let alpha = (y - t0.y) / totalHeight
            let beta = (y - t0.y) / segmentHeight
            let a = add2d(t0, multiply2dByScalar(subtract2d(t2,t0), alpha))
            let b = add2d(t0, multiply2dByScalar(subtract2d(t1,t0), beta))

            this.setPixel(int(a.x),y,colorTopLeft)
            this.setPixel(int(b.x),y,colorTopRight)
        }


        for(let y = t1.y; y < t2.y; y++) {
            let segmentHeight = t2.y - t1.y + 1
            let alpha = (y - t0.y) / totalHeight
            let beta = (y - t1.y) / segmentHeight
            let a = add2d(t0, multiply2dByScalar(subtract2d(t2,t0), alpha))
            let b = add2d(t1, multiply2dByScalar(subtract2d(t2,t1), beta))

            this.setPixel(int(a.x),y,colorBottomLeft)
            this.setPixel(int(b.x),y,colorBottomRight)
        }        


    }

    triangleShadedSegmented(t0:{x:number,y:number}, t1:{x:number,y:number}, t2:{x:number,y:number}, color:Color, 
                                                                colorBottom?:Color) {
        sortPointByY(t0,t1)
        sortPointByY(t0,t2)
        sortPointByY(t1,t2)  

        if(colorBottom == undefined) {
            colorBottom = color
        }
        
        
        let totalHeight = t2.y - t0.y
        for(let y = t0.y; y < t1.y; y++) {
            let segmentHeight = t1.y - t0.y + 1
            let alpha = (y - t0.y) / totalHeight
            let beta = (y - t0.y) / segmentHeight
            let a = add2d(t0, multiply2dByScalar(subtract2d(t2,t0), alpha))
            let b = add2d(t0, multiply2dByScalar(subtract2d(t1,t0), beta))

            sortPointByX(a,b)

            for(let x = int(a.x); x < int(b.x); x++) {
                this.setPixel(x,y,color)
            }
        }


        for(let y = t1.y; y < t2.y; y++) {
            let segmentHeight = t2.y - t1.y + 1
            let alpha = (y - t0.y) / totalHeight
            let beta = (y - t1.y) / segmentHeight
            let a = add2d(t0, multiply2dByScalar(subtract2d(t2,t0), alpha))
            let b = add2d(t1, multiply2dByScalar(subtract2d(t2,t1), beta))

            sortPointByX(a,b)

            for(let x = int(a.x); x < int(b.x); x++) {
                this.setPixel(x,y,colorBottom)
            }
        }        


    }    

    triangleShadedBBoxPointsInTriangle(t0:{x:number,y:number}, t1:{x:number,y:number},t2:{x:number,y:number}, color:Color) {
        var points:[{x:number,y:number},{x:number,y:number},{x:number,y:number}] = [t0,t1,t2]
        var bbox = boundingBox(t0,t1,t2)
        for(var x = bbox.min.x; x < bbox.max.x; x++) {
            for(var y = bbox.min.y; y < bbox.max.y; y++) {
                if(pointInTriangle({x,y}, points)) {
                    this.setPixel(x,y,color)
                }
            }
        }
    }

    triangleShadedZBuffer(t0:{x:number,y:number,z:number},t1:{x:number,y:number,z:number},t2:{x:number,y:number,z:number}, color:Color) {
        let points:[{x:number,y:number,z:number},{x:number,y:number,z:number},{x:number,y:number,z:number}] = [t0,t1,t2]
        let bbox = boundingBox(t0,t1,t2)
        for(let x = bbox.min.x; x < bbox.max.x; x++) {
            for(let y = bbox.min.y; y < bbox.max.y; y++) {
                let p = {x,y,z:0}
                var bc = barycentric(p,points)
                if(bc.x < 0 || bc.y < 0 || bc.z < 0) continue
                p.z += t0.z * bc.x
                p.z += t1.z * bc.y
                p.z += t2.z * bc.z
                let zIndex = p.x + (p.y * this.width)
                if(this.zBuffer[zIndex] < p.z) {
                    this.zBuffer[zIndex] = p.z
                    this.setPixel(p.x,p.y,color)
                }
            }
        }        
    }

    triangleShaded(t0:{x:number,y:number}, t1:{x:number,y:number},t2:{x:number,y:number}, color:Color) {
        //draw triangles by decomposing into 2 triangles with flat top and flat bottom
        let x0 = int(t0.x)
        let y0 = int(t0.y)
        let x1 = int(t1.x)
        let y1 = int(t1.y)        
        let x2 = int(t2.x)
        let y2 = int(t2.y)        

        // //straight lines
        // if((x0 == x1 && x1 == x2) || y0==y1 && y1==y2) return

        // //sort in ascending order
        // if(y1 < y0) {
        //     let tmpX = x1
        //     let tmpY = y1
        //     x1 = x0
        //     y1 = y0
        //     x0 = tmpX
        //     y0 = tmpY
        // }

        // //now p0 and p1 are in order
        // if(y2 < y0)  {
        //     let tmpX = x2
        //     let tmpY = y2
        //     x2 = x0
        //     y2 = y0
        //     x0 = tmpX
        //     y0 = tmpY            
        // }

        // //now y2 and y1
        // if(y2 < y0)  {
        //     let tmpX = x2
        //     let tmpY = y2
        //     x2 = x1
        //     y2 = y1
        //     x1 = tmpX
        //     y1 = tmpY            
        // }

        //this.triangleShadedBBoxPointsInTriangle({x:x0,y:y0},{x:x1,y:y1},{x:x2,y:y2}, color)
        this.triangleShadedSegmented({x:x0,y:y0},{x:x1,y:y1},{x:x2,y:y2}, color)
        
        
    }

    drawBottomTri(x0:number,y0:number,x1:number,y1:number,x2:number,y2:number,color:Color) {
        if(x2 < x1) {
            let tmpX = x1
            x1 = x2
            x2 = tmpX
        }

        let height = y2 - y0
        let dxLeft = (x1-x0)/height
        let dxRight = (x2-x0)/height

 
        throw new Error("Not implmemented")

    }

    applyProjection(viewport:Float32Array, projection:Float32Array, p:Vector3) {
        let m = Matrix4.identity()
        Matrix4.mult(m, viewport, projection)
        let [m0,m1,m2,m3] = Matrix4.multiplyVector(m,[p.x,p.y,p.z,1])

        let x = m0/m3
        let y = m1/m3
        let z = m2/m3

        return {x,y,z}
    } 

    setPixel(x:number,y:number,color:Color) {        
        let pixel = (this.height * this.width * this.bytesPerPixel) - (y * this.width * this.bytesPerPixel) + (x * this.bytesPerPixel)
        this.screenBuffer[pixel + 0] = color.r        
        this.screenBuffer[pixel + 1] = color.g
        this.screenBuffer[pixel + 2] = color.b
        this.screenBuffer[pixel + 3] = color.a
    }

    setPixelF(x:number,y:number,color:Color) {        
        let pixel = (this.height * this.width * this.bytesPerPixel) - (y * this.width * this.bytesPerPixel) + (x * this.bytesPerPixel)
        this.screenBuffer[pixel + 0] = color.r * 255        
        this.screenBuffer[pixel + 1] = color.g * 255
        this.screenBuffer[pixel + 2] = color.b * 255
        this.screenBuffer[pixel + 3] = color.a * 255
    }    

    clear() {
        let width = this.width
        let height = this.height        
        
        let i = 0
        {
            //let currentTick = performance.now()
            for(let y = 0; y < height; y++) {
                for(let x = 0; x < width; x++) {
                    this.screenBuffer[i++] = 0x0 //R
                    this.screenBuffer[i++] = 0x0 //G
                    this.screenBuffer[i++] = 0x0 //B
                    this.screenBuffer[i++] = 0xFF //A
                }
            }
            //console.log(performance.now() - currentTick, 'drawPixels')        
        }        
    }

    abstract doRenderWork();
    async init() {
        
    }

    render = () => {
        let width = this.width
        let height = this.height

        let imageData:ImageData
        {
            //let currentTick = performance.now()
            imageData = this.renderingContext.getImageData(0,0,width,height)                    
            //console.log(performance.now() - currentTick, 'getImageData')        
        }

        this.doRenderWork()

        {
            //let currentTick = performance.now()
            imageData.data.set(this.screenBuffer)
            //console.log(performance.now() - currentTick, 'imageData set')        
        }

        {
            //let currentTick = performance.now()
            this.renderingContext.putImageData(imageData,0,0)
            //console.log(performance.now() - currentTick, 'imageData put')        
        }
    }
}