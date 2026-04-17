import WebGL from "../WebGL/globals";
import * as Shapes from '../WebGL/Shapes/Shapes';
import * as CustomShader from "../WebGL/Shaders/custom";
import * as Matrix from "../WebGL/Matrix/matrix";

type Int32 = number;
type Float = number;

type VoidFunction = () => void;
const EmptyFunction: VoidFunction = () => {};
type TimeTakenFunction = (t:Float) => void
type OnFinishFunction = (onFinish: VoidFunction) => void;

interface IEngine{
  addEvents: () => void;
  loadResources: () => void;
  update: TimeTakenFunction;
}

export class BaseEngine implements IEngine{
  constructor(){};

  //to override
  loadResources(){};
  
  //to override
  update(t: Float){};

  addEvents(){
    this.addKeyEvents();
  }
  private addKeyEvents(){
    window.addEventListener("keydown", (ev) => this.handleKeyDown(ev));
    window.addEventListener("keyup", (ev) => this.handleKeyUp(ev));
    window.addEventListener("mousemove", (ev) => this.handleMouseMove(ev));
    window.addEventListener("mousedown", (ev) => this.handleMouseDown(ev));
    window.addEventListener("mouseup", (ev) => this.handleMouseUp(ev));
  }

  //to override
  protected handleKeyDown(ev: KeyboardEvent){};
  //to override
  protected handleKeyUp(ev: KeyboardEvent){};
  //to override
  protected handleMouseMove(ev: MouseEvent){};
  //to override
  protected handleMouseDown(ev: MouseEvent){};
  //to override
  protected handleMouseUp(ev: MouseEvent){};

}

export interface IEngineRenderer<E extends IEngine>{
  render?: (engine: E) => void;
  renderUpdate?: (time: Int32, engine: E) => void;
  loadTextures?: OnFinishFunction;
  //loadResources: () => void;
}

interface IRenderer{
  render: () => void;
  loadShaders?: () => void; // shaders usually already preloaded (added by raw file and compiled on shader class construction)
  loadTextures?: () => void;
}

export class App<E extends IEngine>{
  private engine: E;
  private renderer: IEngineRenderer<E>;

  constructor(engine: E, renderer: IEngineRenderer<E>){
    this.engine = engine;
    this.renderer = renderer;
  }
  addEvents(){
    this.engine.addEvents();
  }

  //to override?
  loadResources(onLoaded:VoidFunction=()=>{}){
    //this.engine.loadTextures();
    if(this.renderer.loadTextures) this.renderer.loadTextures(onLoaded);
  }
  update(t: Float){
    this.engine.update(t);
  }
  draw(){
    //this.renderer.render(this.engine);
  }
  initApp(){
    this.addEvents();
    this.appCycle(0);
  }
  appCycle(t: Float){
    this.update(t);
    if(this.renderer.render) this.renderer.render(this.engine);
    requestAnimationFrame((t) => this.appCycle(t));
  }
}

type Position = {
  x: number, y: number
};

