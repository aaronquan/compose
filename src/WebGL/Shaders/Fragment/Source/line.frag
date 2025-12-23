precision mediump float;

varying vec2 v_position;
varying vec2 v_relative;

uniform float u_thickness;
uniform vec3 u_equation;

void main(){
  float in_line = 1.0-step(u_thickness, abs(u_equation.x*v_relative.x + u_equation.y*v_relative.y + u_equation.z));
  gl_FragColor = vec4(vec3(1.0), in_line);
}