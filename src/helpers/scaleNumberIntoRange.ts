let scaleNumberIntoRange = (x:number, min:number,max:number, scaledMin:number,scaledMax:number) => {
    return (x - min) / (max- min) * (scaledMax - scaledMin) + scaledMin
}

export default scaleNumberIntoRange