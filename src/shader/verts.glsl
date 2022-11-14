#version 300 es
precision mediump float;

in vec4 aVertexPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
out float depth;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  depth = gl_Position.z;
}

