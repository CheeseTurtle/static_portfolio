import fs from "node:fs/promises";
import path from "node:path";


const fileNameExtractionRegex = /(?<=\/|^)[^/.]+(?=\.(?:txt|md)$)/;
function extractFileName(filePath: string): string {
  const match = fileNameExtractionRegex.exec(filePath);
  if (match === null) throw `Invalid filepath/name: '${filePath}'`;
  return match[0];
}

export default class LazyTextFileInstance {
  id: string;
  path: string;
  absPath: string;
  loadedContent: string|undefined;
  paragraphs: undefined|string[];
  async loaderFunc(): Promise<string> {
    try {
      return await fs.readFile(this.absPath, "utf-8"); 
    } catch {
      return await fs.readFile(this.path, "utf-8");
    }
  }  
  // load: (()=>Promise<string|undefined>);
  async load(): Promise<string|undefined> {
    if(this.loadedContent === undefined)
      this.loadedContent = await this.loaderFunc().catch((reason)=>{
        console.warn(`Failed to read from file '${this.path}' due to reason:`, reason); 
        return undefined; });
    if(this.loadedContent === "") {
      console.warn(`File is empty: '${this.path}'`);
      this.paragraphs = [];
    } else if(this.loadedContent !== undefined) {
      this.paragraphs = this.loadedContent.split(/(\s*\r?\n){2,}/ms).map(
        (str)=>str.trim()
      ).filter(x=>x.length);
    }
    return this.loadedContent;
  }
  async getParagraph(index: number) {
    if(this.paragraphs === undefined) {
      if((await this.load()) === undefined) return "";
      if(!this.loadedContent?.length) return "";
    }
    if(!this.paragraphs?.length) {
      console.warn("Lorem Ipsum file is empty:", this.path);
      return "";
    }
    return this.paragraphs[index % this.paragraphs.length];
  }
  constructor(filePath: string, id?: string) {
    if(id === undefined)
      this.id = extractFileName(filePath);
    // console.log(id, filePath);
    else this.id = id;
    // this.path = path.resolve(filePath);
    // if(path.isAbsolute(filePath))
    this.path = filePath;
    // else
    this.absPath = path.join(process.cwd(),filePath);
    // console.log("filePath:", this.path);
    // console.log("id:", this.id);
    
    this.loadedContent = this.paragraphs = undefined;
    // this.load = this.load_;
    // this.paragraphs = [];
    // this.loaderFunc = async () => fs.readFile(this.path, "utf-8");
  }
}
