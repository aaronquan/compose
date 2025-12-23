precision mediump float;

varying vec2 v_position;
varying vec2 v_relative;

uniform vec2 u_centre;
uniform float u_radius;
uniform vec3 u_circle_colour;
uniform vec3 u_background_colour;

void main(){
  vec2 middle = vec2(u_centre);

  float circle = step(u_radius, distance(middle, v_relative));

  vec3 col = circle*u_background_colour + (1.0-circle)*u_circle_colour;
  
  gl_FragColor = vec4(col, 1.0);
}