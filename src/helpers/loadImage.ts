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

export let loadImages = async (imageSources:{[id:string]:string}) => {
    let loadedImages:{[id:string]: HTMLImageElement} = {}
    let keys = Object.keys(imageSources)
    for(let id of keys) {
        let src = imageSources[id]
        let loadedImage = await loadImage(src)
        if(loadedImage == null) {
            throw new Error("Failed to load image: " + src)
        }
        loadedImages[id] = loadedImage.image
    }

    return loadedImages
}

export default loadImage