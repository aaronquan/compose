import WebGL from '../globals';

export class RightTriangle{
  private static positions = new Float32Array([
    0, 0,
    0, 0.5,
    0.5, 0
  ]);
  private static positionBuffer: WebGLBuffer | undefined;
  //private static p = new 
  static draw(){
    if(!RightTriangle.positionBuffer) RightTriangle.setup();
    if(WebGL.gl){
      const gl = WebGL.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, RightTriangle.positionBuffer!);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); // changes the bind buffers
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }

  private static setup(){
    if(WebGL.gl){
      const gl = WebGL.gl;
      RightTriangle.positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, RightTriangle.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(RightTriangle.positions), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    }else{
      throw new Error("WebGL globals not initialised");
    }
  }
}

export class Quad{
  private static positions = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1
  ]);
  private static positionBuffer: WebGLBuffer | undefined;
  private static indices = new Uint16Array([0,1,2, 2,1,3]);
  private static indicesBuffer: WebGLBuffer | undefined;

  private static positionsArray = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1
  ]);
  private static positionsArrayBuffer: WebGLBuffer | undefined;


  //private static p = new 
  static draw(){
    if(!Quad.positionBuffer) Quad.setup();
    if(WebGL.gl){
      const gl = WebGL.gl;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Quad.indicesBuffer!);
      gl.bindBuffer(gl.ARRAY_BUFFER, Quad.positionBuffer!);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); // changes the bind buffers
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
  }

  static drawArrays(){
    if(!Quad.positionsArrayBuffer) Quad.setup();
    if(WebGL.gl){
      const gl = WebGL.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, Quad.positionsArrayBuffer!);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  static drawRelative(){
    if(!Quad.positionBuffer) Quad.setup();
    if(WebGL.gl){
      const gl = WebGL.gl;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Quad.indicesBuffer!);
      gl.bindBuffer(gl.ARRAY_BUFFER, Quad.positionBuffer!);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); // changes the bind buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, Quad.positionBuffer!);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0); // changes the bind buffers
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
  }

  private static setup(){
    if(WebGL.gl){
      const gl = WebGL.gl;
      Quad.positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, Quad.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, Quad.positions, gl.STATIC_DRAW);

      Quad.indicesBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Quad.indicesBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Quad.indices, gl.STATIC_DRAW);
      
      Quad.positionsArrayBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, Quad.positionsArrayBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, Quad.positionsArray, gl.DYNAMIC_DRAW);
      
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    }else{
      throw new Error("WebGL globals not initialised");
    }
  }
}

export class CenterQuad{
  private static positions = new Float32Array([
    0.5, 0.5,
    -0.5, 0.5,
    0.5, -0.5,
    -0.5, -0.5,
    /*0.5, 0.5,
    -0.5, 0.5,
    0.5, -0.5,
    -0.5, -0.5*/
  ]);
  private static positionBuffer: WebGLBuffer | undefined;
  private static relativePositions = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1
    /*0.5, 0.5,
    -0.5, 0.5,
    0.5, -0.5,
    -0.5, -0.5*/
  ]);
  private static relativeBuffer: WebGLBuffer | undefined;
  private static indices = new Uint16Array([0,1,2,2,1,3]);
  private static indicesBuffer: WebGLBuffer | undefined;

  static draw(){
    if(!CenterQuad.positionBuffer) CenterQuad.setup();
    if(WebGL.gl){
      const gl = WebGL.gl;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CenterQuad.indicesBuffer!);
      gl.bindBuffer(gl.ARRAY_BUFFER, CenterQuad.positionBuffer!);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); // changes the bind buffers
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
  }

  static drawRelative(){
    if(!CenterQuad.relativeBuffer) CenterQuad.setup();
    if(WebGL.gl){
      const gl = WebGL.gl;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CenterQuad.indicesBuffer!);
      gl.bindBuffer(gl.ARRAY_BUFFER, CenterQuad.positionBuffer!);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); // changes the bind buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, CenterQuad.relativeBuffer!);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0); // changes the bind buffers
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
  }

  private static setup(){
    if(WebGL.gl){
      const gl = WebGL.gl;
      CenterQuad.positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, CenterQuad.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, CenterQuad.positions, gl.STATIC_DRAW);

      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      CenterQuad.indicesBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, CenterQuad.indicesBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, CenterQuad.indices, gl.STATIC_DRAW);

      CenterQuad.relativeBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, CenterQuad.relativeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, CenterQuad.relativePositions, gl.STATIC_DRAW);

      gl.enableVertexAttribArray(1);
      //gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    }
  }
}