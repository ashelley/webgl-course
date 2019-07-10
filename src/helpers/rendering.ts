import { calcNormal, isBackFace, clampMax, dot } from './math';

export interface IRenderable {
    vertices: {x:number,y:number,z:number,w:number}[]    
    faceBaseColors:{r:number,g:number,b:number,a:number}[]
}

export interface IRenderList {
    vertices:{x:number,y:number,z:number,w:number}[]
}

export interface IRenderGroup {
    numVertices: number
    numFaces:number
    worldSpaceVertices:{x:number,y:number,z:number,w:number}[]        
    transformedVertices:{x:number,y:number,z:number,w:number}[]    
    faceNormals:{x:number,y:number,z:number}[]    
    vertexNormals:{x:number,y:number,z:number}[]    
    faceBaseColors:{r:number,g:number,b:number,a:number}[]
    calculatedFaceColors:{r:number,g:number,b:number,a:number}[]
    isBackFace:boolean[]
}

export let createRenderGroup = ():IRenderGroup => {
    return {
        numVertices: 0,
        numFaces: 0,
        worldSpaceVertices:[],        
        transformedVertices:[],    
        faceNormals:[],    
        vertexNormals:[],    
        faceBaseColors:[],
        calculatedFaceColors:[],
        isBackFace:[] //TODO should we integrate calculatedFaceColors + isBackFace into a single per face thingy
    }
}

export let pushRenderable = (renderGroup:IRenderGroup, renderable:IRenderable) => {
    let numVerticies = renderable.vertices.length;
    let numFaces = numVerticies / 3
    for(let i = 0; i < renderable.vertices.length; i++) {
        let vertex = renderable.vertices[i]
        renderGroup.worldSpaceVertices.push({x:vertex.x,y:vertex.y,z:vertex.z,w:vertex.w})        
    }
    for(let i = 0; i < numFaces; i++) {
        let baseColor = renderable.faceBaseColors[i]
        //TODO: should we make colors just a uint32 for perf?
        renderGroup.faceBaseColors.push({r:baseColor.r, g: baseColor.g, b: baseColor.b, a:baseColor.a})
        renderGroup.calculatedFaceColors.push({r: 0, g: 0, b: 0, a: 0})
    }
    renderGroup.numVertices += numVerticies
    renderGroup.numFaces += numFaces    
}

export let prepareRenderGroupForRendering = (renderGroup:IRenderGroup, camPos:{x:number,y:number,z:number}) => {
    for(let i = 0; i < renderGroup.numVertices; i++) {
        let vertex = renderGroup.worldSpaceVertices[i]
        //TODO: calculate per vertex normals?
        renderGroup.transformedVertices.push({x:vertex.x,y:vertex.y,z:vertex.z,w:vertex.w})        
    }    
    for(let i = 0, f = 0; i < renderGroup.numVertices; i+=3, f++) {
        let p0 = renderGroup.worldSpaceVertices[i+0]
        let p1 = renderGroup.worldSpaceVertices[i+1]
        let p2 = renderGroup.worldSpaceVertices[i+2]
        
        let n = calcNormal(p0,p1,p2,true) //TODO: normalize?        
        //let c = centroid(p0,p1,p2)

        let backFacing = isBackFace(n,p0,camPos)

        renderGroup.faceNormals[f] = n
        renderGroup.isBackFace[f] = backFacing
    }    
}

export let addAmbientLight = (renderGroup:IRenderGroup, lightColor:{r:number,g:number,b:number}) => {

    for(let i = 0; i < renderGroup.numFaces; i++) {
        let baseColor = renderGroup.faceBaseColors[i]

        let r = baseColor.r * lightColor.r
        let g = baseColor.g * lightColor.g
        let b = baseColor.b * lightColor.b

        let a = baseColor.a
        
        //TODO: should this be 0-255
        r = clampMax(r,1)
        g = clampMax(g,1)
        b = clampMax(b,1)        

        renderGroup.calculatedFaceColors[i] = {r,g,b,a}
    }

}

export let addSunLight = (renderGroup:IRenderGroup, lightDir:{x:number,y:number,z:number}, lightColor:{r:number,g:number,b:number}) => {
    for(let i = 0, f = 0; i < renderGroup.numVertices; i+=3,f++) {        
        let color = renderGroup.calculatedFaceColors[f]
        let normal = renderGroup.faceNormals[f]

        let dp = dot(normal,lightDir)

        //TODO: i don't think this is right review intensity stuff
        let intensity = dp/length
        intensity = 1

        if(dp > 0) {
            color.r += lightColor.r * dp * intensity
            color.g += lightColor.g * dp * intensity
            color.b += lightColor.b * dp * intensity
        }

        color.r = clampMax(color.r,1)
        color.g = clampMax(color.r,1)
        color.b = clampMax(color.b,1)
    }
}