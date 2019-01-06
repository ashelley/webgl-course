export let rgbFromHex = (color:string):[number,number,number] => {
    let p = (color[0] == "#")?1:0;

    return [
        parseInt(color[p]	+ color[p+1],16)	/ 255.0,
        parseInt(color[p+2]	+ color[p+3],16)	/ 255.0,
        parseInt(color[p+4]	+ color[p+5],16)	/ 255.0
    ]
}

export let rgbArrayFromHex = (...hexColors:string[]) => {
    if(hexColors.length == 0) return null;
    let result:number[] = [];

    for(let i=0; i < hexColors.length; i++){
        if(hexColors[i].length < 6) continue;
        result.push.apply(result, rgbFromHex(hexColors[i]))
    }

    return result;

}