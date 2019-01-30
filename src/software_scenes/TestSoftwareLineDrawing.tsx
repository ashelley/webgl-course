import SoftwareSceneBase from "./SoftwareSceneBase";
import { RendererBase } from "../software_renderer/RendererBase";
import { Colors } from "../software_renderer/helpers";

export default class TestSoftwareLineDrawing extends SoftwareSceneBase {
    createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
        return new TestLineDrawing(canvas,width,height)
    }
}

class TestLineDrawing extends RendererBase {
    doRenderWork() {
        let halfWidth = this.width / 2
        let halfHeight = this.height / 2
        
        // this.naiveLine(halfWidth - 100,halfHeight,halfWidth + 100,halfHeight,Colors.RED)
        // this.naiveLine(halfWidth,halfHeight-100,halfWidth,halfHeight+100,Colors.GREEN)
        
        // this.lineCalcPixels(13, 20, 80, 40, Colors.WHITE); 
        // this.lineCalcPixels(20, 13, 40, 80, Colors.RED); 
        // this.lineCalcPixels(80, 40, 13, 20, Colors.RED);        

        // this.lineCalcPixelsForSlope(13, 20, 80, 40, Colors.WHITE); 
        // this.lineCalcPixelsForSlope(20, 13, 40, 80, Colors.RED); 
        // this.lineCalcPixelsForSlope(80, 40, 13, 20, Colors.RED);   
        
        this.lineCalcPixelsForSlopeAccumulateError(13, 20, 80, 40, Colors.WHITE); 
        this.lineCalcPixelsForSlopeAccumulateError(20, 13, 40, 80, Colors.RED); 
        this.lineCalcPixelsForSlopeAccumulateError(80, 40, 13, 20, Colors.RED);           

        //TODO: line with just ints as error accumulation
    }

}