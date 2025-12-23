attribute vec2 a_position; // pos 0
attribute vec2 a_relative; // pos 1

uniform mat3 u_mvp;
//uniform mat3 u_view;

varying vec2 v_position;
varying vec2 v_relative;

void main(){
  vec2 position = (u_mvp*vec3(a_position, 1)).xy;

  gl_Position = vec4(position, 1.0, 1.0);

  v_position = position;
  v_relative = a_relative;
}