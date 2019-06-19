export default class RenderLoop {

    fps = 0
    fpsLimit = 0
    isActive = false
    lastFrameMS = 0
    lastFrameStartAt = 0
    renderTime = 0
    render:(dt:number)=>void

    constructor(render:(dt:number)=>void) {
        this.render = render        
    }

    frameDone() {

    }

    start() {
        this.isActive = true
        this.lastFrameStartAt = performance.now()
        window.requestAnimationFrame(this.run)
        return this        
    }

    stop() {
        this.isActive = false
    }

    run = () => {
        if(this.fpsLimit) {
            this.limitFps()
        }
        else {
            this.variableRate()
        }
        this.frameDone()
    }

    variableRate() {
        let currentMs = performance.now()
        let deltaMs = (currentMs - this.lastFrameStartAt)
        let deltaT = deltaMs / 1000

        this.lastFrameStartAt = currentMs
        this.fps = Math.floor(1.0/deltaT)
        this.lastFrameMS = deltaMs

        let startRenderAt = performance.now()
        this.render(deltaT)
        this.renderTime = performance.now() - startRenderAt

        if(this.isActive) {
            window.requestAnimationFrame(this.run)
        }
    }

    limitFps() {
        let currentMs = performance.now()
        let deltaMs = (currentMs - this.lastFrameStartAt)

        let deltaT = deltaMs / 1000

        if(deltaMs > this.fpsLimit) {
            this.fps = Math.floor(1.0/deltaT)
            this.lastFrameStartAt = currentMs
            this.render(deltaT)
        }

        if(this.isActive) {
            window.requestAnimationFrame(this.run)
        }
    }
}