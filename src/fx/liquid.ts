// Shader WebGL leve: "vidro líquido" com cáusticas verdes e ondulação reativa ao cursor.
// Carregado sob demanda (chunk separado), renderiza em baixa resolução e pausa fora da tela/aba oculta.

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform float mi;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;float k=r.x/r.y;
  vec2 p=uv*vec2(k,1.)*2.4;vec2 mm=m*vec2(k,1.)*2.4;
  float d=length(p-mm);
  p+=normalize(p-mm+1e-4)*.09*mi*exp(-d*2.2)*sin(d*13.-t*3.2);
  vec2 q=vec2(fbm(p+t*.045),fbm(p+vec2(5.2,1.3)-t*.035));
  float f=fbm(p+2.2*q+t*.02);
  float c=pow(smoothstep(.48,.92,f),3.)*1.4;
  vec3 col=mix(vec3(.01,.035,.022),vec3(.04,.2,.12),f)+c*vec3(.38,.86,.62);
  float v=smoothstep(1.35,.15,length((uv-vec2(.25,.45))*vec2(1.,1.25)));
  gl_FragColor=vec4(col,(.5+c*.45)*v);
}`;

export function startLiquid(canvas: HTMLCanvasElement): (() => void) | null {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) return null;

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // triângulo que cobre a tela
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't');
  const uM = gl.getUniformLocation(prog, 'm'), uMi = gl.getUniformLocation(prog, 'mi');

  const ESCALA = 0.5; // meia resolução: o efeito é suave e custa 4× menos
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr * ESCALA));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr * ESCALA));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // Cursor suavizado (alvo -> atual) para a ondulação não "pular".
  const alvo = { x: 0.7, y: 0.5, i: 0 }, atual = { x: 0.7, y: 0.5, i: 0 };
  const onMove = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect();
    alvo.x = (e.clientX - b.left) / b.width; alvo.y = 1 - (e.clientY - b.top) / b.height;
    alvo.i = e.pointerType === 'mouse' ? 1 : 0.6;
  };
  const onLeave = () => { alvo.i = 0; };
  const host = canvas.parentElement ?? canvas;
  host.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerleave', onLeave);

  let visivel = true, raf = 0;
  const t0 = performance.now();
  const frame = (now: number) => {
    raf = 0;
    if (!visivel || document.hidden) return;
    atual.x += (alvo.x - atual.x) * 0.06; atual.y += (alvo.y - atual.y) * 0.06; atual.i += (alvo.i - atual.i) * 0.04;
    gl.uniform2f(uR, canvas.width, canvas.height);
    gl.uniform1f(uT, (now - t0) / 1000);
    gl.uniform2f(uM, atual.x, atual.y);
    gl.uniform1f(uMi, atual.i);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  };
  const play = () => { if (!raf && visivel && !document.hidden) raf = requestAnimationFrame(frame); };
  const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; play(); });
  io.observe(canvas);
  document.addEventListener('visibilitychange', play);
  play();

  return () => {
    cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
    document.removeEventListener('visibilitychange', play);
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerleave', onLeave);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
