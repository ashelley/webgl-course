import React from "react";
import RenderLoop from "../RenderLoop";
import { RendererBase } from "../software_renderer/RendererBase";

export default abstract class SoftwareSceneBase extends React.Component<{},{}> {

    canvasRef = React.createRef<HTMLCanvasElement>()
    renderer:RendererBase
    renderLoop:RenderLoop

    state = {
        fps: 0,
        frameRateLocked: 0
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