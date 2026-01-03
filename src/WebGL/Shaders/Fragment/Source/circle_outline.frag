precision mediump float;

varying vec2 v_position;
varying vec2 v_relative;

uniform vec2 u_centre;
uniform float u_radius;
uniform float u_outline_radius;

uniform vec4 u_outline_colour;
uniform vec4 u_background_colour;

void main(){
  vec2 middle = vec2(u_centre);
  float d = distance(middle, v_relative);
  float circle = step(d, u_radius);
  float centre_circle = step(d, u_radius-u_outline_radius);

  float in_outline = circle-centre_circle;

  vec4 col = u_outline_colour*in_outline;
  gl_FragColor = col;
}