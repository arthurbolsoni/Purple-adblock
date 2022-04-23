//external request throuhg purple server
export async function external(channelName: string): Promise<string> {
    try{
        global.LogPrint("External Server: Loading");
        const response: Response =  await global.realFetch("https://jupter.ga/test/" + channelName);

        if (!response.ok){
            throw new Error("server proxy return error or not found");
        }
    
        const text: string = await response.text();
    
        global.LogPrint("External Server: OK");
    
        return text;

    }catch (e){
        global.LogPrint(e);
        return "";
    }
}