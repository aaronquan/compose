attribute vec2 position;

uniform mat3 u_matrix;

varying vec2 v_position;

void main(){
  vec2 position = (u_matrix*vec3(position, 1)).xy;

  gl_Position = vec4(position, 1.0, 1.0);

  v_position = position;
}