
precision mediump float;

uniform vec2 resolution;
uniform float time;

varying vec2 fragCoord;

void main()
{
  vec2 p = (2.0 * fragCoord.xy - resolution) / max(resolution.x, resolution.y);

  for (int i = 1; i < 30; i++)
  {
    vec2 newp = p + time * 0.0001;
    newp.x += 0.6 / float(i) * sin(float(i) * p.y + time / 50.0 + 0.3 * float(i)) + 0.5;
    newp.y += 0.6 / float(i) * sin(float(i) * p.x + time / 25.0 + 0.3 * float(i + 10)) - 0.5;
    p = newp;
  }

  vec3 col = vec3(0.1 * sin(3.0 * p.x) + 0.8, 0.1 * sin(p.y) + 0.8, 0.1 * sin(p.x + p.y) + 0.8);

  gl_FragColor = vec4(col, 0.1);
}