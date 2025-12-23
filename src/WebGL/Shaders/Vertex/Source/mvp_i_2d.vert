attribute vec2 a_position; // pos 0
attribute vec2 a_relative; // pos 1

uniform mat3 u_model;
uniform mat3 u_view;
uniform mat3 u_perspective;

varying vec2 v_position;
varying vec2 v_relative;

void main(){
  vec2 position = (u_perspective*u_view*u_model*vec3(a_position, 1)).xy;

  gl_Position = vec4(position, 1.0, 1.0);

  v_position = position;
  v_relative = a_relative;
}