import WebGL from "./../globals";
import * as File from "./../Util/file"
import * as Shader from "./../Shaders/custom"

type Int32 = number;
type VoidFunction = () => void;

export class Texture{
    static setup(){
      //not needed? should be set after each texture load?
      /*
      if(WebGL.gl){
        const gl = WebGL.gl;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      }*/
    }
    static createTextureFromUrl(url: string): Texture{
      const img = new Image();
      img.src = url;
      this.textures_requested++;
      const gl = WebGL.gl;
      if(gl){
        img.onload = () => {
          if(WebGL.gl){
            const gl = WebGL.gl;
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            this.textures_loaded++;
          }
        }
      }
      return new Texture(url);
    }

    static textures_loaded: Int32 = 0;
    static textures_requested: Int32 = 0;
    static textures_failed: Set<string> = new Set();
    static path = "/";


    texture: WebGLTexture | undefined;
    is_loaded: boolean;
    url: string
    constructor(fn: string){
      //const gl = WebGL.gl;
      this.url = Texture.path+fn;
      this.is_loaded = false;
    }
    load(onLoad: VoidFunction){
      if(!this.is_loaded){
        Texture.textures_requested++;
        const gl = WebGL.gl;
        if(gl != undefined){
          const img = new Image();
          img.src = this.url;
          img.onload = () => {
            console.log(`Loaded ${this.url}`);
            this.texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            Texture.textures_loaded++;
            this.is_loaded = true;
            onLoad();
          }
        }
      }
    }
    active(id: Int32){
      const gl = WebGL.gl;
      if(this.texture && gl != undefined){
        gl.activeTexture(gl.TEXTURE0+id);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
      }
    }
}

export class TextureCollection{
  textures: Map<string, Texture>;
  constructor(){
    this.textures = new Map();
  }
}

type SpriteSheetPosition = {
  x: Int32;
  y: Int32;
}
type Char = string;

interface FontSheetShader{
  setWidth: (w: Int32) => void;
  setHeight: (h: Int32) => void;
  setX: (x: Int32) => void;
  setY: (y: Int32) => void;
}

export class CustomFont{
  coord_to_sheet_position: Map<Char, SpriteSheetPosition>
  font_sheet: Texture;
  font_name: string;
  loaded: boolean;
  width: Int32;
  height: Int32;
  
  //fn requires extension e.g. .png
  constructor(font_sheet_fn: string){
    this.font_sheet = new Texture(font_sheet_fn);
    this.font_name = font_sheet_fn.split('.')[0];
    this.loaded = false;
    this.coord_to_sheet_position = new Map();
    this.width = 0;
    this.height = 0;
    //test font settings
    //this.coord_to_sheet_position.set("a", {x: 0, y: 0});
    //this.coord_to_sheet_position.set("b", {x: 1, y: 0});
    //this.coord_to_sheet_position.set("c", {x: 2, y: 0});
  }
  active(id: Int32){
    this.font_sheet.active(id);
  }
  load(onLoaded:()=>void=()=>{}, onError?: (e: any) => void){
    this.font_sheet.load(() => {
      File.fetchPublicFile(`${this.font_name}.txt`, (txt) => {
        const sp = txt.split('\r\n');
        const dims = sp[0].split(' ');
        this.width = parseInt(dims[0]);
        this.height = parseInt(dims[1]);
        for(let i = 1; i < sp.length; i++){
          const x = (i-1)%this.width;
          const y = Math.floor((i-1)/this.width);
          for(let j = 0; j < sp[i].length; j++){
            this.coord_to_sheet_position.set(sp[i][j], {x, y});
          }
        }
        console.log(txt);
        console.log(`Font: loaded success, ${this.font_name}`);
        onLoaded();
        this.loaded = true;
      }, 
      (error) => { 
          console.log(error);
          if(onError) onError(error);
      });
    });
  }

  setChar(shader: FontSheetShader, char: Char){
    shader.setWidth(this.width);
    shader.setHeight(this.height);
    const coord = this.coord_to_sheet_position.get(char);
    if(coord != undefined){
      shader.setX(coord.x);
      shader.setY(coord.y);
    }
  }
}


//export class Texture