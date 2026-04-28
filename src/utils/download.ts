

export function downloadTextFile(name: string, contents: string){
  const link = document.createElement("a");
  link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents));
  link.setAttribute('download', name);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}