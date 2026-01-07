precision mediump float;

varying vec2 v_position;
varying vec2 v_relative;

uniform float u_left;
uniform float u_right;
uniform float u_top;
uniform float u_bot;
uniform float u_circle_radius;
uniform float u_size; // between 0 and 0.5
uniform vec3 u_colour;
uniform vec3 u_background_colour;

void main(){
  vec2 uv = v_relative;
  float sz = u_size/2.;
  float inside_top = step(abs(0.5-uv.x), sz)*step(0.5-sz, uv.y)*u_top;
  float inside_bot = step(abs(0.5-uv.x), sz)*step(uv.y, 0.5+sz)*u_bot;
  float inside_left = step(abs(0.5-uv.y), sz)*step(uv.x, 0.5-sz)*u_left;
  float inside_right = step(abs(0.5-uv.y), sz)*step(0.5-sz, uv.x)*u_right;

  vec2 middle = vec2(0.5, 0.5);
  float inside_circle = step(u_circle_radius, distance(middle, v_relative));
  float inside = clamp(inside_top+inside_bot+inside_left+inside_right+inside_circle, 0.0, 1.0);

  gl_FragColor = vec4(inside*u_colour+(1.0-inside)*u_background_colour, 1.0);
}