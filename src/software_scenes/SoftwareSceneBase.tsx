import React from "react";
import RenderLoop from "../RenderLoop";
import { RendererBase } from "../software_renderer/RendererBase";

export default abstract class SoftwareSceneBase extends React.Component<{},{}> {

    canvasRef = React.createRef<HTMLCanvasElement>()
    renderer:RendererBase
    renderLoop:RenderLoop

    state = {
        fps: 0,        
        lastFrameTime: 0,
        frameRateLocked: 0,
        mouseX: 0,
        mouseY: 0,
    }

    componentDidMount() {
        this.startScene()
    }

    abstract createRenderer(canvas:HTMLCanvasElement,width:number,height:number);

    async startScene() {        
        let width = window.innerWidth - 10
        let height = window.innerHeight - 10        

        this.renderer = this.createRenderer(this.canvasRef.current, width, height)
        await this.renderer.init()

        this.renderLoop = new RenderLoop(this.renderer.render)
        this.renderLoop.start()    
        this.logFps()    
    }

    logFps = () => {
        let fps = this.renderLoop.fps
        let lastFrameTime = Math.floor(this.renderLoop.lastFrameMS)
        if(fps != this.state.fps || this.state.lastFrameTime != lastFrameTime) {
            this.setState({fps, lastFrameTime})
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

    mouseTimer

    handleMouseMove = (e) => {
        if(this.mouseTimer == null) {
            let rect = e.target.getBoundingClientRect()
            let mouseX = e.clientX - rect.left
            let mouseY = e.clientY - rect.top
            this.setState({mouseX, mouseY})
            this.mouseTimer = setTimeout(() => { this.mouseTimer = null }, 300)            
        }

    }

    render() {
        return (
            <div style={{position:'relative'}}>
                <div style={{display:'flex', flexDirection:'row', position:'absolute', right: 0, WebkitTextStroke: "1px black"}}>
                    <button onClick={this.handleLockedFpsToggle}>{this.state.frameRateLocked ? this.state.frameRateLocked: "Variable"} FPS</button>
                    <div style={{color:'white', padding: 3}}>{this.state.fps}</div>
                    <div style={{color:'white', padding: 3}}>{this.state.lastFrameTime} ms</div>
                    <div style={{color:'white', padding: 3}}>mouseX :{this.state.mouseX} mouseY: {this.state.mouseY}</div>
                    {this.renderer && <div style={{color:'white', padding: 3}}>{this.renderer.width} x {this.renderer.height}</div>}
                </div>
                <canvas ref={this.canvasRef} onMouseMove={this.handleMouseMove} style={{border: '1px solid black'}} />
            </div>
        )
    }
}