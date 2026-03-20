type Float = number;

export class Point2D{
  x: Float;
  y: Float;
  constructor(x: Float=0, y: Float=0){
    this.x = x;
    this.y = y;
  }
  equals(p: Point2D): boolean{
    return this.x === p.x && this.y === p.y;
  }
}

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
  static new(arr: Float[]): Matrix3x3{
    const mat = new Matrix3x3();
    mat.setMatrix(arr);
    return mat;
  }
  setMatrix(mat: Float[]){
    const lim = Math.min(9, mat.length);
    for(let i = 0; i < lim; i++){
      this._matrix[i] = mat[i];
    }
  }
  static identity(): Matrix3x3{
    const mat = new Matrix3x3();
    mat._matrix[0] = 1.0;
    mat._matrix[4] = 1.0;
    mat._matrix[8] = 1.0;
    return mat;
  }
  multiplyScalar(scalar: Float){
    for(let i = 0; i < 9; i++){
      this._matrix[i] *= scalar;
    }
  }
  matrixMinorsCopy(): Matrix3x3{
    const minors = new Matrix3x3();
    minors._matrix[0] = this._matrix[4]*this._matrix[8] - this._matrix[5]*this._matrix[7];
    minors._matrix[1] = this._matrix[3]*this._matrix[8] - this._matrix[5]*this._matrix[6];
    minors._matrix[2] = this._matrix[3]*this._matrix[7] - this._matrix[4]*this._matrix[6];
    minors._matrix[3] = this._matrix[1]*this._matrix[8] - this._matrix[2]*this._matrix[7];
    minors._matrix[4] = this._matrix[0]*this._matrix[8] - this._matrix[2]*this._matrix[6];
    minors._matrix[5] = this._matrix[0]*this._matrix[7] - this._matrix[1]*this._matrix[6];
    minors._matrix[6] = this._matrix[1]*this._matrix[5] - this._matrix[2]*this._matrix[4];
    minors._matrix[7] = this._matrix[0]*this._matrix[5] - this._matrix[2]*this._matrix[3];
    minors._matrix[8] = this._matrix[0]*this._matrix[4] - this._matrix[1]*this._matrix[3];
    return minors;
  }
  matrixCofactorsCopy(): Matrix3x3{
    const cof = this.matrixMinorsCopy();
    cof._matrix[1] *= -1;
    cof._matrix[3] *= -1;
    cof._matrix[5] *= -1;
    cof._matrix[7] *= -1;
    return cof;
  }
  adjugateCopy(): Matrix3x3{
    const adj = new Matrix3x3();
    adj._matrix[0] = this._matrix[0];
    adj._matrix[1] = this._matrix[3];
    adj._matrix[2] = this._matrix[6];
    adj._matrix[3] = this._matrix[1];
    adj._matrix[4] = this._matrix[4];
    adj._matrix[5] = this._matrix[7];
    adj._matrix[6] = this._matrix[2];
    adj._matrix[7] = this._matrix[5];
    adj._matrix[8] = this._matrix[8];
    return adj;
  }
  determinant(): Float{
    const a_minor = this._matrix[4]*this._matrix[8] - this._matrix[5]*this._matrix[7];
    const b_minor = this._matrix[3]*this._matrix[8] - this._matrix[5]*this._matrix[6];
    const c_minor = this._matrix[3]*this._matrix[7] - this._matrix[4]*this._matrix[6];
    return this._matrix[0]*a_minor - this._matrix[1]*b_minor + this._matrix[2]*c_minor;
  }

  invert(){
    const determinant = this.determinant();
    const cofactors = this.matrixCofactorsCopy();
    const inverse = cofactors.adjugateCopy();
    inverse.multiplyScalar(1/determinant);
    
    for(let i = 0; i < 9; i++){
      this._matrix[i] = inverse._matrix[i];
    }
  }

  inverseCopy(): Matrix3x3{
    const determinant = this.determinant();
    const cofactors = this.matrixCofactorsCopy();
    const inverse = cofactors.adjugateCopy();
    inverse.multiplyScalar(1/determinant);
    return inverse;
  }

  copy(): Matrix3x3{
    const c = new Matrix3x3();
    for(let i = 0; i < 9; i++){
      c._matrix[i] = this._matrix[i];
    }
    return c;
  }

  static equals(m1: Matrix3x3, m2: Matrix3x3){
    for(let i = 0; i < 9; i++){
      if(m1._matrix[i] !== m2._matrix[i]){
        return false;
      }
    }
    return true;
  }

  print(){
    console.log(`|${this._matrix[0].toFixed(2)} ${this._matrix[1].toFixed(2)} ${this._matrix[2].toFixed(2)}|`);
    console.log(`|${this._matrix[3].toFixed(2)} ${this._matrix[4].toFixed(2)} ${this._matrix[5].toFixed(2)}|`);
    console.log(`|${this._matrix[6].toFixed(2)} ${this._matrix[7].toFixed(2)} ${this._matrix[8].toFixed(2)}|`);
  }
}

export class TransformationMatrix3x3 extends Matrix3x3{
  //private _matrix: Float32Array;
  constructor(){
    super();
    //this._matrix = new Float32Array(9);
  }
  static new(arr: Float[]): TransformationMatrix3x3{
    const mat = new TransformationMatrix3x3();
    mat.setMatrix(arr);
    return mat;
  }
  static newMatrix(cmat: Matrix3x3): TransformationMatrix3x3{
    const mat = new TransformationMatrix3x3();
    for(let i = 0; i < 9; i++){
      mat._matrix[i] = cmat.matrix[i];
    }
    return mat;
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

  static projection(){

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
    mat._matrix[1] = s;
    mat._matrix[3] = -s;
    mat._matrix[4] = c;
    return mat;
  }

  static rotateY(radians: number): TransformationMatrix3x3{
    const mat = TransformationMatrix3x3.identity();
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    mat._matrix[0] = c;
    mat._matrix[6] = s;
    //mat._matrix[2] = -s;
    //mat._matrix[8] = c;
    return mat;
  }

  static rotateX(radians: number): TransformationMatrix3x3{
    const mat = TransformationMatrix3x3.identity();
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    mat._matrix[4] = c;
    //mat._matrix[5] = -s;
    mat._matrix[7] = s;
    //mat._matrix[8] = c;
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
    const tr_matrix = TransformationMatrix3x3.translate(tx, ty);
    this.multiply(tr_matrix);
  }
  scale(sx: number, sy: number){
    const sc_matrix = TransformationMatrix3x3.scale(sx, sy);
    this.multiply(sc_matrix);
  }

  rotate(radians: number){
    const rotation_matrix = TransformationMatrix3x3.rotate(radians);
    this.multiply(rotation_matrix);
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

  transformPoint(point: Point2D): Point2D{
    const x = this._matrix[0] * point.x + this._matrix[3] * point.y + this._matrix[6]
    const y = this._matrix[1] * point.x + this._matrix[4] * point.y + this._matrix[7];
    return new Point2D(x, y);
  }

  copy(): TransformationMatrix3x3{
    const c = new TransformationMatrix3x3();
    for(let i = 0; i < 9; i++){
      c._matrix[i] = this._matrix[i];
    }
    return c;
  }
}