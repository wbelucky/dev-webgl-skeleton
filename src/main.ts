import vertexShaderSource from './shader/verts.glsl';
import fragmentShaderSource from './shader/flag.glsl';
import { mat4 } from 'gl-matrix';

const cSize = {
  width: 600,
  height: 600,
} as const;

export const assertIsDefined: <T>(val: T) => asserts val is NonNullable<T> = <T>(
  val: T
): asserts val is NonNullable<T> => {
  if (val === undefined || val === null) {
    throw new Error(`Expected 'val' to be defined, but received ${val}`);
  }
};

const VERTEX_SIZE = 3;

const main = () => {
  const canvas = document.createElement('canvas');
  canvas.width = cSize.width;
  canvas.height = cSize.height;
  document.body.appendChild(canvas);

  const gl = canvas.getContext('webgl2');
  assertIsDefined(gl);
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  assertIsDefined(vertexShader);

  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const vertexShaderCompileStatus = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (!vertexShaderCompileStatus) {
    const info = gl.getShaderInfoLog(vertexShader);
    console.warn(info);
    return;
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  assertIsDefined(fragmentShader);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  const fragmentShaderCompileStatus = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (!fragmentShaderCompileStatus) {
    const info = gl.getShaderInfoLog(fragmentShader);
    assertIsDefined(info);
    throw new Error(info);
  }

  const program = gl.createProgram();
  assertIsDefined(program);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const linkStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linkStatus) {
    const info = gl.getProgramInfoLog(program);
    assertIsDefined(info);
    throw new Error(info);
  }
  gl.useProgram(program);

  // Clear screen
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  /*
    2___3
    |\  |
    | \ |
    |__\|
    0   1
   */
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  const vv = [
    // 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0,
    // -1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0,
    // 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, -1.0,
    // 1
    0.0,
    1.0, 0.0,
    // 2
    -1.0, -1.0, 1.0,
    // 3
    1.0, -1.0, 1.0,
    // 4
    0.0, 1.0, 0.0,
    // 5
    1.0, -1.0, 1.0,
    // 6
    1.0, -1.0, -1.0,
    // 7
    0.0, 1.0, 0.0,
    // 8
    1.0, -1.0, -1.0,
    // 9
    -1.0, -1.0, -1.0,
    // 10
    0.0, 1.0, 0.0,
    // 11
    -1.0, -1.0, -1.0,
    // 12
    -1.0, -1.0, 1.0,
  ];

  const VERTEX_NUMS = vv.length;
  const vertices = new Float32Array(vv);

  // TODO:
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  let cubeRotation = 0.0;
  let then = 0.0;

  const render = (now: number) => {
    gl.enable(gl.DEPTH_TEST);

    // Draw triangles

    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [-0.0, 0.0, -6.0]
    ); // amount to translate
    mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      cubeRotation, // amount to rotate in radians
      [0, 0, 1]
    ); // axis to rotate around (Z)
    mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      cubeRotation * 0.7, // amount to rotate in radians
      [0, 1, 0]
    ); // axis to rotate around (Y)
    mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      cubeRotation * 0.3, // amount to rotate in radians
      [1, 0, 0]
    ); // axis to rotate around (X)

    // Get and set vertex attribute
    const vertexAttribLocation = gl.getAttribLocation(program, 'aVertexPosition');

    gl.enableVertexAttribArray(vertexAttribLocation);
    gl.vertexAttribPointer(vertexAttribLocation, VERTEX_SIZE, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, 'uProjectionMatrix'),
      false,
      projectionMatrix
    );
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uModelViewMatrix'), false, modelViewMatrix);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, VERTEX_NUMS);

    now *= 0.001; // convert to seconds
    const deltaTime = now - then;
    then = now;
    cubeRotation += deltaTime;
    console.log(cubeRotation);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
};

window.onload = main;
