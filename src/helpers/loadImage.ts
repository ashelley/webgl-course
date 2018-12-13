let loadImage = async (src:string) => {

    // if(requiresBase64Conversion(src)) {
    //     src = await base64ToDataUrl(src)
    // }

    return new Promise<{image:HTMLImageElement}|null>(resolve => {
        var loadingImage = new Image();
        loadingImage.src = src;
        loadingImage.addEventListener("load", () => {
            console.log('load', src)
            resolve({image: loadingImage});
        })
        loadingImage.addEventListener("abort", () => {
            resolve(null)
        })
        loadingImage.addEventListener("error", () => {
            resolve(null)
        })                
    })              
}

export default loadImage