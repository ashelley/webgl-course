import React from "react";
import RenderLoop from "../RenderLoop";
import { RendererBase } from "../software_renderer/RendererBase";

interface IRendererUI {
    getInitialState?:() => any
    debugUI:(state, setState:(partialState:any) => void) => JSX.Element | null
}

export default abstract class SoftwareSceneBase extends React.Component<{},{}> implements IRendererUI {

    canvasRef = React.createRef<HTMLCanvasElement>()
    renderer:RendererBase
    renderLoop:RenderLoop

    state = {
        mouseX: 0,
        mouseY: 0,
    }

    componentDidMount() {
        let state = this.getInitialState()
        if(state != null) {
            this.setState(state, () => {
                this.startScene()
            })
        }
    }    

    getInitialState() {
        return null
    }

    debugUI(state, setState:(partialState:any) => void) {
        return null
    }

    renderUI() {
        if(this.debugUI == null) {
            return null
        } else {
            return this.debugUI(this.state, this.setState)
        }
    }

    abstract createRenderer(canvas:HTMLCanvasElement,width:number,height:number);

    async startScene() {        
        let width = window.innerWidth - 10
        let height = window.innerHeight - 10        

        this.renderer = this.createRenderer(this.canvasRef.current, width, height)
        await this.renderer.init()

        this.renderLoop = new RenderLoop(this.renderer.render)
        this.renderLoop.frameDone = this.frameDone     
        this.renderLoop.start()    
    }    

    frameDone = () => {
        this.setState({})
    }

    handleLockedFpsToggle = e => {
        e.preventDefault()
        e.stopPropagation()
        let frameRateLocked = this.renderLoop.fpsLimit
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

    rendererUI() {
        let renderLoop = this.renderLoop
        if(renderLoop == null) return null
        let {fpsLimit, fps, lastFrameMS, renderTime} = renderLoop

        lastFrameMS = parseFloat(lastFrameMS.toFixed(2))
        renderTime = parseFloat(renderTime.toFixed(2))

        return (
            <div style={{}}>
                <button onClick={this.handleLockedFpsToggle}>{fpsLimit ? fpsLimit: "Variable"} FPS</button>
                <div style={{display:'flex', flexDirection:'row'}}>
                    <div style={{padding: 3}}>FPS: {fps}</div>
                    <div style={{padding: 3}}>Total: {lastFrameMS} ms</div>
                </div>
                <div style={{padding: 3}}>Renderer: {renderTime} ms</div>                
                <div style={{padding: 3}}>Lost: {(lastFrameMS - renderTime).toFixed(2)} ms</div>                
            </div>
        )
    }

    render() {



        return (
            <div style={{position:'relative'}}>
                <div style={{display:'flex', flexDirection:'column', position:'absolute', right: 0, padding: 3, backgroundColor:'white', border:'1px solid black'}}>
                    {this.rendererUI()}
                    <div>mouseX :{this.state.mouseX} mouseY: {this.state.mouseY}</div>                    
                    {this.renderer && <div style={{color:'white', padding: 3}}>{this.renderer.width} x {this.renderer.height}</div>}
                    {this.renderUI()}                    
                </div>
                <canvas ref={this.canvasRef} onMouseMove={this.handleMouseMove} style={{border: '1px solid black'}} />
            </div>
        )
    }
}