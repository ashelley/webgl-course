export let rgbArrayFromHex = (...hexColors:string[]) => {
    if(hexColors.length == 0) return null;
    let result:number[] = [];

    for(let i=0; i < hexColors.length; i++){
        if(hexColors[i].length < 6) continue;
        let c = hexColors[i];	
        let p = (c[0] == "#")?1:0;

        result.push(
            parseInt(c[p]	+c[p+1],16)	/ 255.0,
            parseInt(c[p+2]	+c[p+3],16)	/ 255.0,
            parseInt(c[p+4]	+c[p+5],16)	/ 255.0
        );
    }
    return result;

}