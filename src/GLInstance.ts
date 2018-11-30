import createShader from "./shaders/createShader";

export default class GLInstance {

    canvas:HTMLCanvasElement
    glContext:WebGLRenderingContext
    
    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas
        this.glContext = canvas.getContext("webgl2") as WebGLRenderingContext

        this.initialize()
    }

    initialize() {
        let gl = this.glContext
        gl.clearColor(1.0,1.0,1.0,1.0)
    }

    clear() {
        let gl = this.glContext
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        return this
    }

    setSize(width:number,height:number) {
        let canvas = this.canvas
        let glContext = this.glContext
        
        canvas.style.width = width + "px"
        canvas.style.height = height + "px"

        canvas.width = width
        canvas.height = height

        glContext.viewport(0,0,width,height)

        return this
    }
}