
type Float = number;
export class Line{
  x1: Float;
  y1: Float;
  x2: Float;
  y2: Float;
  constructor(x1: Float, y1: Float, x2: Float, y2: Float){
    this.x1 = x1; this.y1 = y1;
    this.x2 = x2; this.y2 = y2;
  }
  angleInRadians(flip_y:boolean=true): Float{
    const dx = this.x2-this.x1;
    const dy = this.y2-this.y1;
    return Math.atan2(flip_y ? -dy : dy, dx);
  }
  length(){
    const dx = this.x2-this.x1;
    const dy = this.y2-this.y1;

    return Math.sqrt(dx*dx + dy*dy);
  }
  midPoint(): {x: Float, y: Float}{
    const dx = this.x2-this.x1;
    const dy = this.y2-this.y1;

    return {x: this.x1+dx/2, y: this.y1+dy/2};
  }
}