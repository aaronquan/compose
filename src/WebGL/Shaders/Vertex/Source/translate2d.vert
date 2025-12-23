attribute vec2 position;

uniform vec2 translate;

void main(){
  gl_Position = vec4(position.x+translate.x, position.y+translate.y, 1, 1);
}