export function fetchPublicFile(fn: string, success:(text: string) => void, 
error:(reason: any) => void=(e)=>{console.log(e)}){
  fetch(`/${fn}`).then(async (res) => {
    if(res.ok){
      const text = await res.blob().then((b) => {
        if(b.type == "text/plain"){
          return b.text();
        }
        return undefined;
      });

      return text;
    }
    return res.text();
  }).then((text) => {
    if(text != undefined){
      success(text);
    }else{
      error("public file is not a text file");
    }
  }).catch((e) => {
    error(e);
  });
}