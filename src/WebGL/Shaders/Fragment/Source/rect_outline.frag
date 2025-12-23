precision mediump float;

varying vec2 v_position;
varying vec2 v_relative;

uniform vec4 u_outline_colour;
uniform float u_outline_ratio;

void main(){
  float in_x = 1.0-step(u_outline_ratio, v_relative.x)*step(v_relative.x, 1.0-u_outline_ratio);
  float in_y = 1.0-step(u_outline_ratio, v_relative.y)*step(v_relative.y, 1.0-u_outline_ratio);
  float inside = step(1.0, in_x+in_y);

  
  gl_FragColor = inside*u_outline_colour;

  //gl_FragColor = vec4(v_relative.x,0.0,0.0,1.0);


}