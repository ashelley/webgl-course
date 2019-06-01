

export const boundingBox = (...points:{x:number,y:number}[]):{min:{x:number,y:number},max:{x:number,y:number}} => {
        let minX:number = Number.MAX_VALUE
        let minY:number = Number.MAX_VALUE
        let maxX:number = Number.MIN_VALUE
        let maxY:number = Number.MIN_VALUE
        
        for(let p = 0; p < points.length; p++) {
            let point = points[p]
            if(point.x < minX) minX = point.x
            if(point.x > maxX) maxX = point.x
            if(point.y < minY) minY = point.y
            if(point.y > maxY) maxY = point.y
        }
        return {min:{x: minX, y: minY}, max:{x:maxX, y:maxY}}
    }