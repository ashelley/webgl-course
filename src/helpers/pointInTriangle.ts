export const pointInTriangle = (point:{x:number,y:number}, triangle:[{x:number,y:number},{x:number,y:number},{x:number,y:number}]) => {
     //NOTE: this maths for this makes way more sense if you watch this
     // youtu.be/HYAgJN3x4GA?list=PLFt_AvWsXl0cD2LPxcjxVjWTQLxJqKpgZ
     // in other words this is not black magic!
    
     let [a,b,c] = triangle
     let s1 = c.y - a.y
     let s2 = c.x - a.x
     let s3 = b.y - a.y
     let s4 = point.y - a.y

     let u = ((a.x * s1) + (s4 * s2) - (point.x * s1)) / ((s3 * s2) - (b.x - a.x) * s1)
     let v = (s4 - (u * s3)) / s1
     
     return u >= 0 && v >= 0 && (u + v) < 1
}   