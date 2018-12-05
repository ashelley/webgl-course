export default class RenderLoop {

    fps = 0
    fpsLimit = 0
    isActive = false
    lastFrameMs = 0
    render:(dt:number)=>void

    constructor(render:(dt:number)=>void) {
        this.render = render        
    }

    start() {
        this.isActive = true
        this.lastFrameMs = performance.now()
        window.requestAnimationFrame(this.run)
        return this        
    }

    stop() {
        this.isActive = false
    }

    run = () => {
        let fps 
        if(false) {
            this.limitFps()
        }
        else {
            this.variableRate()
        }
    }

    variableRate() {
        let currentMs = performance.now()
        let deltaMs = (currentMs - this.lastFrameMs)
        let deltaT = deltaMs / 1000

        this.lastFrameMs = currentMs
        this.fps = Math.floor(1.0/deltaT)

        this.render(deltaT)

        if(this.isActive) {
            window.requestAnimationFrame(this.run)
        }
    }

    limitFps() {
        let currentMs = performance.now()
        let deltaMs = (currentMs - this.lastFrameMs)

        let deltaT = deltaMs / 1000

        if(deltaMs > this.fpsLimit) {
            this.fps = Math.floor(1.0/deltaT)
            this.lastFrameMs = currentMs
            this.render(deltaT)
        }

        if(this.isActive) {
            window.requestAnimationFrame(this.run)
        }
    }
}