import WebGL from "../../globals";
import * as Mixin from "../../mixin"
import type { Matrix3x3, TransformationMatrix3x3 } from "../../Matrix/matrix";
import * as Shader from "../shader";

//import * as MVP from "./Program/mvp";
import * as Transform from "./Program/transform2d";
//export const MvpShaderProgramMix = MVP.MvpShaderProgramMix;
export const Transform2dShaderProgramMix = Transform.Transform2dShaderProgramMix;

import * as VertexSource from "./Source/vertex_source";

export function loadVertexShaders(){
  SimpleVertexShader.load();
  TranslateVertexShader.load();
  TransformVertexShader.load();
  TransformRelativeVertexShader.load();
  MVPRelativeVertexShader.load();
  MVPIndividualRelativeVertexShader.load();
}

export class MVPRelativeVertexShader{
  static shader?: Shader.VertexShader;
  static load(){
    if(!this.shader){
      this.shader = new Shader.VertexShader();
      if(!this.shader.addSource(VertexSource.mvp_rel)){
        console.log("MVPVertex: vertex source not added");
      }
    }
  }
}

export class MVPIndividualRelativeVertexShader{
  static shader?: Shader.VertexShader;
  static load(){
    if(!this.shader){
      this.shader = new Shader.VertexShader();
      if(!this.shader.addSource(VertexSource.mvp_i_rel)){
        console.log("MVPVertex: vertex source not added");
      }
    }
  }
}


export class SimpleVertexShader{
  static shader?: Shader.VertexShader;
  static load(){
    if(!this.shader){
      this.shader = new Shader.VertexShader();
      if(!this.shader.addSource(VertexSource.simple)){
        console.log("Simple: vertex source not added");
      }
    }
  }
}

/*
export class SimpleShaderProgram extends Shader.NewCustomShaderProgram{
  constructor(){
    super();
    this.name = TranslateShaderProgram.name;
    this.setupVertex();
  }
  setupVertex(){
    if(TranslateVertexShader.shader){
      this.program.addVertex(TranslateVertexShader.shader);
    }else{
      console.log(`${this.name} not loaded`);
    }
  }
  add_vertex_attribute_locations(): void {};
  add_vertex_uniform_locations(): void {};
}*/

export class TranslateVertexShader{
  static shader?: Shader.VertexShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.VertexShader();
      if(!this.shader.addSource(VertexSource.translate)){
        console.log("Translate: vertex source not added");
      }
    }
  }
}

export class TransformRelativeVertexShader{
  static shader?: Shader.VertexShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.VertexShader();
      if(!this.shader.addSource(VertexSource.transform_rel)){
        console.log("TranslateRelative: vertex source not added");
      }
    }
  }
}

export class TranslateShaderProgram extends Shader.CustomShaderProgram{
  private translate_uniform_location: WebGLUniformLocation | null;
  constructor(){
    super();
    this.translate_uniform_location = null;
    this.name = TranslateShaderProgram.name;
    this.setupVertex();
  }
  private setupVertex(){
    if(TranslateVertexShader.shader){
      this.program.addVertex(TranslateVertexShader.shader);
    }else{
      console.log(`${this.name} not loaded`);
    }
  }
  addAttributeLocations(): void {
    
  }
  addUniformLocations(): void {
    this.translate_uniform_location = this.program.getUniformLocation("translate");
  }
  setTranslate(x: number, y:number){
    this.program.setFloat2(this.translate_uniform_location!, x, y)
  }
}

class TransformVertexShader{
  static shader?: Shader.VertexShader;
  static load(){
    if(this.shader == undefined){
      this.shader = new Shader.VertexShader();
      if(!this.shader.addSource(VertexSource.transform)){
        console.log("Transform: vertex source not added");
      }
    }
  }
}

export class TransformShaderProgram extends Shader.CustomShaderProgram{
  private declare transform_uniform_location: WebGLUniformLocation | null;
  constructor(){
    super();
    this.transform_uniform_location = null;
    this.name = TransformShaderProgram.name;
    this.setupVertex();
  }
  setupVertex(){
    if(TranslateVertexShader.shader){
      this.program.addVertex(TranslateVertexShader.shader);
    }else{
      console.log(`${this.name} not loaded`);
    }
  }
  addAttributeLocations(): void {
    
  }
  addUniformLocations(): void {
    this.transform_uniform_location = this.program.getUniformLocation("u_matrix");
  }
  setTransform(matrix: Matrix3x3){
    this.program.setMat3(this.transform_uniform_location!, matrix.matrix);
  }
}

export function TransformShaderProgramMixin<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class Transform extends Base{
    private declare transform_uniform_location: WebGLUniformLocation | null;
    protected override setupVertex(){
      if(TransformVertexShader.shader){
        this.program.addVertex(TransformVertexShader.shader);
      }else{
        throw new Error(`${this.vertex_name} not loaded`);
      }
    }
    override addVertexAttributeLocations(): void {
      
    }
    override addVertexUniformLocations(): void {
      this.transform_uniform_location = this.program.getUniformLocation("u_matrix");
    }
    setTransform(matrix: TransformationMatrix3x3){
      this.program.setMat3(this.transform_uniform_location!, matrix.matrix);
    }

  }
}

export function TranslateShaderProgramMixin<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class Translate extends Base{
    private declare translate_uniform_location: WebGLUniformLocation | null;
    protected override setupVertex(){
      this.vertex_name = "TranslateShader";
      if(TranslateVertexShader.shader){
        this.program.addVertex(TranslateVertexShader.shader);
      }else{
        throw new Error(`${this.vertex_name} not loaded`);
      }
    }
    protected override addVertexAttributeLocations(): void {
      
    }
    protected override addVertexUniformLocations(): void {
      this.translate_uniform_location = this.program.getUniformLocation("translate");
    }
    setTranslate(x: number, y:number){
      this.program.setFloat2(this.translate_uniform_location!, x, y)
    }
  }
}

export function TransformRelativeShaderProgramMixin<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class TransformRelative extends Base{
    private declare transform_uniform_location: WebGLUniformLocation | null;
    //private declare relative_attribute_location: GLint | null;
    protected override setupVertex(){
      this.vertex_name = "TransformRelativeShader";
      if(TransformRelativeVertexShader.shader){
        this.program.addVertex(TransformRelativeVertexShader.shader!);
      }else{
        throw new Error(`${this.vertex_name} not loaded`);
      }
    }
    protected override addVertexAttributeLocations(): void {
      //this.relative_attribute_location = this.program.getAttributeLocation("a_relative");
    }
    protected override addVertexUniformLocations(): void {
      this.transform_uniform_location = this.program.getUniformLocation("u_matrix");
    }
    setTransform(matrix: TransformationMatrix3x3){
      this.program.setMat3(this.transform_uniform_location!, matrix.matrix);
    }
  }
}

export function MVPRelativeShaderProgramMixin<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class MVPRelative extends Base{
    private declare mvp_uniform_location: WebGLUniformLocation | null;
    protected override setupVertex(){
      this.vertex_name = "MVPRelativeShader";
      if(MVPRelativeVertexShader.shader){
        this.program.addVertex(MVPRelativeVertexShader.shader!);
      }else{
        throw new Error(`${this.vertex_name} not loaded`);
      }
    }
    protected override addVertexAttributeLocations(): void {
      //this.relative_attribute_location = this.program.getAttributeLocation("a_relative");
    }
    protected override addVertexUniformLocations(): void {
      this.mvp_uniform_location = this.program.getUniformLocation("u_mvp");
    }
    setMVP(matrix: TransformationMatrix3x3){
      this.program.setMat3(this.mvp_uniform_location!, matrix.matrix);
    }
  }
}

export function MVPIndividualRelativeShaderProgramMixin<TBase extends Shader.CustomShaderProgramable>(Base: TBase){
  return class MVPIndividualRelative extends Base{
    private declare model_uniform_location: WebGLUniformLocation | null;
    private declare view_uniform_location: WebGLUniformLocation | null;
    private declare perspective_uniform_location: WebGLUniformLocation | null;
    protected override setupVertex(){
      this.vertex_name = "MVPIndividualRelativeShader";
      if(MVPRelativeVertexShader.shader){
        this.program.addVertex(MVPRelativeVertexShader.shader!);
      }else{
        throw new Error(`${this.vertex_name} not loaded`);
      }
    }
    protected override addVertexAttributeLocations(): void {
      //this.relative_attribute_location = this.program.getAttributeLocation("a_relative");
    }
    protected override addVertexUniformLocations(): void {
      this.model_uniform_location = this.program.getUniformLocation("u_model");
      this.view_uniform_location = this.program.getUniformLocation("u_view");
      this.perspective_uniform_location = this.program.getUniformLocation("u_perspective");
    }
    setModel(matrix: TransformationMatrix3x3){
      this.program.setMat3(this.model_uniform_location!, matrix.matrix);
    }
    setView(matrix: TransformationMatrix3x3){
      this.program.setMat3(this.view_uniform_location!, matrix.matrix);
    }
    setPerspective(matrix: TransformationMatrix3x3){
      this.program.setMat3(this.perspective_uniform_location!, matrix.matrix);
    }
  }
}
