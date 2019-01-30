import React from "react";
import RenderLoop from "./RenderLoop";
export default class HtmlCanvas extends React.Component<{},{}> {

    canvasRef = React.createRef<HTMLCanvasElement>()
    renderer:Renderer
    renderLoop:RenderLoop

    state = {
        fps: 0,
        frameRateLocked: 0
    }

    componentDidMount() {
        this.startScene()
    }

    async startScene() {        
        let width = window.innerWidth - 10
        let height = window.innerHeight - 10        
        this.renderer = new Renderer(this.canvasRef.current, width, height)
        this.renderLoop = new RenderLoop(this.renderer.render)
        this.renderLoop.start()    
        this.logFps()    
    }

    logFps = () => {
        let fps = this.renderLoop.fps
        if(fps != this.state.fps) {
            this.setState({fps})
        }
        setTimeout(this.logFps, 500)
    }

    handleLockedFpsToggle = e => {
        e.preventDefault()
        e.stopPropagation()
        let frameRateLocked = this.state.frameRateLocked
        if(frameRateLocked == 0) {
            frameRateLocked = 30
        }
        else {
            frameRateLocked = 0
        }
        this.setState({frameRateLocked}, () => {
            this.renderLoop.fpsLimit = frameRateLocked
        })
    }

    render() {
        return (
            <div style={{position:'relative'}}>
                <div style={{display:'flex', flexDirection:'row', position:'absolute', right: 0}}>
                    <button onClick={this.handleLockedFpsToggle}>{this.state.frameRateLocked ? this.state.frameRateLocked: "Variable"} FPS</button>
                    <div style={{color:'white', padding: 3}}>{this.state.fps}</div>
                </div>
                <canvas ref={this.canvasRef} style={{border: '1px solid black'}} />
            </div>
        )
    }
}

class Renderer {

    canvas:HTMLCanvasElement
    renderingContext: CanvasRenderingContext2D
    screenBuffer:Uint8ClampedArray    
    width:number
    height:number

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

        this.width = width
        this.height = height

        let bytesPerPixel = 4
        let bufferSize = width*height*bytesPerPixel        

        let arrayBuffer = new ArrayBuffer(bufferSize)        
        this.screenBuffer = new Uint8ClampedArray(arrayBuffer)                               
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

        let i = 0

        {
            //let currentTick = performance.now()
            for(let y = 0; y < height; y++) {
                for(let x = 0; x < width; x++) {
                    this.screenBuffer[i++] = 0x00 //R
                    this.screenBuffer[i++] = 0xFF //G
                    this.screenBuffer[i++] = 0xFF //B
                    this.screenBuffer[i++] = 0xFF //A
                }
            }
            //console.log(performance.now() - currentTick, 'drawPixels')        
        }

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