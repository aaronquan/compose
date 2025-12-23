
import WebGL from '../globals';
import * as Vertex from './Vertex/vertex';
import * as Fragment from './Fragment/fragment';
import * as Shader from './shader'

//TODO add shader programs here


//const MVPMixin = Vertex.MvpShaderProgramMix(Shader.ShaderProgramMixin);
//const TransformMixin = Vertex.Transform2dShaderProgramMix(Shader.ShaderProgramMixin);

export class MVPColourProgram extends Fragment.ColourMixin(Vertex.Mvp2dMixin){};
export class TransformColourProgram extends Fragment.ColourMixin(Vertex.Transform2dMixin){};
export class TransformCircleProgram extends Fragment.CircleMixin(Vertex.Transform2dMixin){};
export class MVPOutlineCircleProgram extends Fragment.CircleOutlineMixin(Vertex.Mvp2dMixin){};
export class MVPSolidPathProgram extends Fragment.SolidPathMixin(Vertex.Mvp2dMixin){};
export class MVPOutlineRectProgram extends Fragment.RectOutlineMixin(Vertex.Mvp2dMixin){};
export class MVPSolidLineProgram extends Fragment.LineMixin(Vertex.Mvp2dMixin){};
export class MVPPathCenterCircleProgram extends Fragment.PathCentreCircleMixin(Vertex.Mvp2dMixin){};

/*
interface Colour{
  setColour(r: GLfloat, g: GLfloat, b: GLfloat): void;
}*/

/*
export class TestSimple extends Vertex.SimpleShaderProgram{
  constructor(){
    super();
    this.setup();
    this.link();
  }
  setupFragment(){
    console.log("loading proper simple");
    if(Fragment.SimpleFragmentShader.shader){
      this.program.addFragment(Fragment.SimpleFragmentShader.shader);
    }else{
      console.log("SimpleFragmentShader not loaded");
    }
  }
}*/
/*
export class TestTranslate extends Vertex.TranslateShaderProgram{
  constructor(){
    super();
    this.setupFragment();
    this.link();
  }
  private setupFragment(){
    if(Fragment.SimpleFragmentShader.shader){
      this.program.addFragment(Fragment.SimpleFragmentShader.shader);
    }else{
      console.log("SimpleFragmentShader not loaded");
    }
  }
}

export class TestColourTranslate extends Vertex.TranslateShaderProgram implements Colour {
  private declare colour_uniform_location: WebGLUniformLocation | null;
  constructor(){
    super();
    this.setupFragment();
  }
  private setupFragment(){
    if(Fragment.ColourFragmentShader.shader){
      this.program.addFragment(Fragment.ColourFragmentShader.shader);
    }else{
      console.log("ColourFragmentShader not loaded");
    }
  }
  addUniformLocations(): void {
    super.addUniformLocations();
    this.colour_uniform_location =  this.program.getUniformLocation("colour");
  };
  setColour(r: GLfloat, g: GLfloat, b: GLfloat){
    this.program.setFloat3(this.colour_uniform_location!, r, g, b);
  }
}

export class TestColourTransform extends Vertex.TransformShaderProgram implements Colour{
  private declare colour_uniform_location: WebGLUniformLocation | null;
  constructor(){
    super();
    this.setupFragment();
  }
  private setupFragment(){
    if(Fragment.ColourFragmentShader.shader){
      this.program.addFragment(Fragment.ColourFragmentShader.shader);
    }else{
      console.log("ColourFragmentShader not loaded");
    }
  }
  addUniformLocations(): void {
    super.addUniformLocations();
    this.colour_uniform_location =  this.program.getUniformLocation("colour");
  };
  setColour(r: GLfloat, g: GLfloat, b: GLfloat){
    this.program.setFloat3(this.colour_uniform_location!, r, g, b);
  }
}

const TransformMixin = Vertex.TransformShaderProgramMixin(Shader.ShaderProgramMixin);
const TranslateMixin = Vertex.TranslateShaderProgramMixin(Shader.ShaderProgramMixin);
const TransformRelativeMixin = Vertex.TransformRelativeShaderProgramMixin(Shader.ShaderProgramMixin);
const MVPRelativeMixin = Vertex.MVPRelativeShaderProgramMixin(Shader.ShaderProgramMixin);
//export class TransformColourMixin = Fragment.ColourShaderProgramMixin(TransformMixin);

//export const TransformColourMixinT = Fragment.ColourShaderProgramMixin(TransformMixin);

export class TransformColourProgram extends Fragment.ColourShaderProgramMixin(TransformMixin){};
export class TranslateColourProgram extends Fragment.ColourShaderProgramMixin(TranslateMixin){};

export class TransformCircleProgram extends Fragment.CircleShaderProgramMixin(TransformRelativeMixin){};

export class MVPColourProgram extends Fragment.ColourShaderProgramMixin(MVPRelativeMixin){};
export class MVPOutlineCircleProgram extends Fragment.CircleOutlineShaderProgramMixin(MVPRelativeMixin){};
export class MVPOutlineRectProgram extends Fragment.RectOutlineShaderProgramMixin(MVPRelativeMixin){};

export class MVPSolidLineProgram extends Fragment.SolidLineShaderProgramMixin(MVPRelativeMixin){};
*/
