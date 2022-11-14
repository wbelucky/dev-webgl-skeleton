#version 300 es
precision mediump float;

out vec4 color_out;

in float depth;

void main() {
    color_out = vec4(1., .5, 0., 1.);
}
