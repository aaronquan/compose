precision mediump float;

varying vec2 v_position;
varying vec2 v_relative;

uniform sampler2D u_texture_id;
uniform float u_width;
uniform float u_height;
uniform float u_x;
uniform float u_y;

void main(){
    float px = (u_x+v_relative.x)/u_width;
	float py = (u_y+v_relative.y)/u_height;

    gl_FragColor = texture2D(u_texture_id, vec2(px, py));
}