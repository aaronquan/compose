precision mediump float;

varying vec2 v_position;
varying vec2 v_relative;

uniform vec2 u_centre;
uniform float u_radius;
uniform vec3 u_circle_colour; //colour

void main(){
  vec2 middle = vec2(u_centre);
  float circle = step(u_radius, distance(middle, v_relative));
  float in_circle = 1.0-circle;
  gl_FragColor = vec4(u_circle_colour, in_circle);
}