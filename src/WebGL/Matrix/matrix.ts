export class Matrix2x2{
  protected _matrix: Float32Array;
  constructor(){
    this._matrix = new Float32Array(4);
  }
  get matrix(): Float32Array{
    return this._matrix;
  }
}

export class Matrix3x3{
  protected _matrix: Float32Array;
  constructor(){
    this._matrix = new Float32Array(9);
  }
  get matrix(): Float32Array{
    return this._matrix;
  }
  static identity(): Matrix3x3{
    const mat = new Matrix3x3();
    mat._matrix[0] = 1.0;
    mat._matrix[4] = 1.0;
    mat._matrix[8] = 1.0;
    return mat;
  }
}

export class TransformationMatrix3x3 extends Matrix3x3{
  //private _matrix: Float32Array;
  constructor(){
    super();
    //this._matrix = new Float32Array(9);
  }

  static identity(): TransformationMatrix3x3{
    const mat = new TransformationMatrix3x3();
    mat._matrix[0] = 1.0;
    mat._matrix[4] = 1.0;
    mat._matrix[8] = 1.0;
    return mat;
  }

  static orthographic(left: number, right: number, bottom: number, top: number): TransformationMatrix3x3{
    const mat = TransformationMatrix3x3.identity();
    mat._matrix[0] = 2/(right-left);
    mat._matrix[4] = 2/(top-bottom);
    mat._matrix[6] = (right+left)/(left-right);
    mat._matrix[7] = (top+bottom)/(bottom-top);
    return mat;
  }

  static translate(tx: number, ty: number): TransformationMatrix3x3{
    const mat = TransformationMatrix3x3.identity();
    mat._matrix[6] = tx;
    mat._matrix[7] = ty;
    return mat;
  }

  static scale(sx: number, sy: number): TransformationMatrix3x3{
    const mat = TransformationMatrix3x3.identity();
    mat._matrix[0] = sx;
    mat._matrix[4] = sy;
    return mat;
  }

  static rotate(radians: number): TransformationMatrix3x3{
    const mat = TransformationMatrix3x3.identity();
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    mat._matrix[0] = c;
    mat._matrix[1] = -s;
    mat._matrix[3] = s;
    mat._matrix[4] = c;
    return mat;
  }

  static rotateY(radians: number): TransformationMatrix3x3{
    const mat = TransformationMatrix3x3.identity();
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    mat._matrix[0] = c;
    mat._matrix[6] = -s;
    mat._matrix[2] = s;
    mat._matrix[8] = c;
    return mat;
  }

  setIdentity(){
    this._matrix = new Float32Array(9);
    this._matrix[0] = 1.0;
    this._matrix[4] = 1.0;
    this._matrix[8] = 1.0;
  }
  //static translate()

  translate(tx: number, ty: number){
    this._matrix[6] += tx;
    this._matrix[7] += ty;
  }
  scale(sx: number, sy: number){
    this._matrix[0] *= sx;
    this._matrix[4] *= sy;
  }

  //to test
  rotate(radians: number){
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    this._matrix[0] = c;
    this._matrix[1] = -s;
    this._matrix[3] = s;
    this._matrix[4] = c;
  }

  multiply(mat: TransformationMatrix3x3){
    const temp = this.copy();
    this._matrix[0] = temp._matrix[0]*mat._matrix[0] + temp._matrix[3]*mat._matrix[1] + temp.matrix[6]*mat._matrix[2];
    this._matrix[1] = temp._matrix[1]*mat._matrix[0] + temp._matrix[4]*mat._matrix[1] + temp.matrix[7]*mat._matrix[2];
    this._matrix[2] = temp._matrix[2]*mat._matrix[0] + temp._matrix[5]*mat._matrix[1] + temp.matrix[8]*mat._matrix[2];

    this._matrix[3] = temp._matrix[0]*mat._matrix[3] + temp._matrix[3]*mat._matrix[4] + temp.matrix[6]*mat._matrix[5];
    this._matrix[4] = temp._matrix[1]*mat._matrix[3] + temp._matrix[4]*mat._matrix[4] + temp.matrix[7]*mat._matrix[5];
    this._matrix[5] = temp._matrix[2]*mat._matrix[3] + temp._matrix[5]*mat._matrix[4] + temp.matrix[8]*mat._matrix[5];

    this._matrix[6] = temp._matrix[0]*mat._matrix[6] + temp._matrix[3]*mat._matrix[7] + temp.matrix[6]*mat._matrix[8];
    this._matrix[7] = temp._matrix[1]*mat._matrix[6] + temp._matrix[4]*mat._matrix[7] + temp.matrix[7]*mat._matrix[8];
    this._matrix[8] = temp._matrix[2]*mat._matrix[6] + temp._matrix[5]*mat._matrix[7] + temp.matrix[8]*mat._matrix[8];
  }

  multiplyCopy(mat: TransformationMatrix3x3): TransformationMatrix3x3{
    const cpy = this.copy();
    cpy._matrix[0] = this._matrix[0]*mat._matrix[0] + this._matrix[3]*mat._matrix[1] + this.matrix[6]*mat._matrix[2];
    cpy._matrix[1] = this._matrix[1]*mat._matrix[0] + this._matrix[4]*mat._matrix[1] + this.matrix[7]*mat._matrix[2];
    cpy._matrix[2] = this._matrix[2]*mat._matrix[0] + this._matrix[5]*mat._matrix[1] + this.matrix[8]*mat._matrix[2];

    cpy._matrix[3] = this._matrix[0]*mat._matrix[3] + this._matrix[3]*mat._matrix[4] + this.matrix[6]*mat._matrix[5];
    cpy._matrix[4] = this._matrix[1]*mat._matrix[3] + this._matrix[4]*mat._matrix[4] + this.matrix[7]*mat._matrix[5];
    cpy._matrix[5] = this._matrix[2]*mat._matrix[3] + this._matrix[5]*mat._matrix[4] + this.matrix[8]*mat._matrix[5];

    cpy._matrix[6] = this._matrix[0]*mat._matrix[6] + this._matrix[3]*mat._matrix[7] + this.matrix[6]*mat._matrix[8];
    cpy._matrix[7] = this._matrix[1]*mat._matrix[6] + this._matrix[4]*mat._matrix[7] + this.matrix[7]*mat._matrix[8];
    cpy._matrix[8] = this._matrix[2]*mat._matrix[6] + this._matrix[5]*mat._matrix[7] + this.matrix[8]*mat._matrix[8];
    return cpy;
  }

  print(){
    console.log(`|${this._matrix[0].toFixed(2)} ${this._matrix[1].toFixed(2)} ${this._matrix[2].toFixed(2)}|`);
    console.log(`|${this._matrix[3].toFixed(2)} ${this._matrix[4].toFixed(2)} ${this._matrix[5].toFixed(2)}|`);
    console.log(`|${this._matrix[6].toFixed(2)} ${this._matrix[7].toFixed(2)} ${this._matrix[8].toFixed(2)}|`);
  }

  copy(): TransformationMatrix3x3{
    const c = new TransformationMatrix3x3();
    for(let i = 0; i < 9; i++){
      c._matrix[i] = this._matrix[i];
    }
    return c;
  }
}