import { int, makePoint, Color, abs, swapPoint, Colors } from "./helpers";

export abstract class RendererBase {

    canvas:HTMLCanvasElement
    renderingContext: CanvasRenderingContext2D
    screenBuffer:Uint8ClampedArray    
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

        this.clear()
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
            swapPoint(p0) 
            swapPoint(p1)
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
            swapPoint(p0) 
            swapPoint(p1)
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

    setPixel(x:number,y:number,color:Color) {        
        let pixel = (this.height * this.width * this.bytesPerPixel) - (y * this.width * this.bytesPerPixel) + (x * this.bytesPerPixel)
        this.screenBuffer[pixel + 0] = color.r        
        this.screenBuffer[pixel + 1] = color.g
        this.screenBuffer[pixel + 2] = color.b
        this.screenBuffer[pixel + 3] = color.a
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