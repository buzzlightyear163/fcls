import { useEffect, useRef } from 'react'

/** Fragment shader för den orange rök-/brusbakgrunden (samma uttryck som referensen) */
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = r * p * 2.03 + 3.1;
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_time * 0.04;
  vec2 m = (u_mouse - 0.5) * vec2(0.35, 0.25);
  vec2 q = vec2(fbm(p * 1.3 + t + m), fbm(p * 1.3 - t * 1.25 + vec2(4.7, 1.3)));
  vec2 r = vec2(
    fbm(p * 1.7 + 2.3 * q + vec2(1.7, 9.2) + t * 0.6),
    fbm(p * 1.7 + 2.3 * q + vec2(8.3, 2.8) - t * 0.45)
  );
  float f = fbm(p * 1.5 + 2.4 * r);
  vec3 col = vec3(0.008, 0.016, 0.034);
  col = mix(col, vec3(0.07, 0.19, 0.36), smoothstep(0.28, 0.95, f));
  col += vec3(0.01, 0.03, 0.08) * smoothstep(0.45, 1.0, r.y);
  float lift = smoothstep(0.62, 0.98, f * (0.6 + r.x));
  col += vec3(0.62, 0.85, 1.0) * lift * lift * 0.55;
  col += vec3(0.02, 0.04, 0.07) * smoothstep(1.1, 0.0, length(uv - vec2(0.62, 1.12)));
  col *= smoothstep(1.6, 0.15, length(p * vec2(0.8, 1.1)));
  float g = hash(gl_FragCoord.xy + fract(u_time * 7.13) * vec2(91.7, 37.3));
  col *= 0.72 + g * 0.56;
  col += (g - 0.5) * 0.035;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}`

let startOffset: number | null = null
const FRAME_MS = 1000 / 30

export function GrainField({ splash = false }: { splash?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const gl = canvas?.getContext('webgl', { antialias: false, alpha: false, depth: false, preserveDrawingBuffer: reduced })
    if (!canvas || !gl) {
      canvas?.setAttribute('data-fallback', '')
      return
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const vs = sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}')
    const fs = sh(gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    if (!vs || !fs || !prog) return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')

    const target = { x: 0.5, y: 0.5 }
    const cur = { x: 0.5, y: 0.5 }
    if (startOffset == null) startOffset = performance.now() - 4e4 * Math.random()
    const t0 = startOffset
    const draw = (t: number) => {
      cur.x += (target.x - cur.x) * 0.04
      cur.y += (target.y - cur.y) * 0.04
      gl.uniform1f(uTime, (t - t0) / 1000)
      gl.uniform2f(uMouse, cur.x, cur.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    // Halv upplösning, som referensen
    const resize = () => {
      const w = Math.max(1, Math.round(window.innerWidth * 0.5))
      const h = Math.max(1, Math.round(window.innerHeight * 0.5))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(uRes, w, h)
      if (reduced) draw(performance.now())
    }
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth
      target.y = 1 - e.clientY / window.innerHeight
    }
    let raf = 0
    let last = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden || t - last < FRAME_MS) return
      last = t
      draw(t)
    }
    resize()
    window.addEventListener('resize', resize)
    if (!reduced) {
      window.addEventListener('pointermove', onMove, { passive: true })
      raf = requestAnimationFrame(loop)
    }
    canvas.setAttribute('data-ready', '')
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [splash])

  return (
    <div className={splash ? 'grain-field splash-mist' : 'grain-field'} aria-hidden="true">
      <canvas ref={ref} />
    </div>
  )
}
