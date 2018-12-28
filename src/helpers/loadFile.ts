
export let loadTextFile = async (args:{url:string}) => {
    let res = await fetch(args.url)
    return await res.text()
}