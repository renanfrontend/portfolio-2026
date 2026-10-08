// Telas do vídeo (abertura, bastidores e encerramento) no visual do site: grafite, pontos, aurora ciano/violeta.
// Cada tela anima quando o gravador adiciona a classe "go" ao <body>, no início da cena.

const escapeHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const base = (body, extraCss = "") => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@700&display=block" rel="stylesheet">
<style>
  :root { --bg:#0a0d0d; --fg:#ecf3f1; --muted:#a2b2ae; --subtle:#7c8e8a; --accent:#22d3ee; --blue:#3b82f6; --violet:#a855f7; --success:#4ade80; }
  * { box-sizing:border-box; margin:0; }
  html, body { height:100%; }
  body { background:var(--bg); color:var(--fg); font-family:Inter, system-ui, sans-serif; overflow:hidden; display:grid; place-items:center; position:relative; }
  body::before { content:""; position:absolute; inset:0; background-image:radial-gradient(rgb(255 255 255 / .05) 1.2px, transparent 1.6px); background-size:22px 22px; }
  body::after { content:""; position:absolute; inset:0; pointer-events:none;
    background: radial-gradient(ellipse 55% 45% at 12% 0%, rgb(34 211 238 / .18), transparent 70%), radial-gradient(ellipse 50% 45% at 90% 100%, rgb(168 85 247 / .16), transparent 70%); }
  main { position:relative; z-index:1; width:min(88vw, 1100px); text-align:center; }
  .grad { background:linear-gradient(100deg, var(--accent), var(--blue) 55%, var(--violet)); -webkit-background-clip:text; background-clip:text; color:transparent; filter:drop-shadow(0 0 22px rgb(34 211 238 / .35)); }
  h1 { font-family:"Space Grotesk", sans-serif; font-weight:700; letter-spacing:-.02em; line-height:1.05; }
  .badge { display:inline-flex; align-items:center; gap:.6em; border:1px solid rgb(34 211 238 / .45); background:rgb(34 211 238 / .1); color:var(--accent);
    border-radius:999px; padding:.45em 1.1em; font-family:"JetBrains Mono", monospace; font-size:clamp(12px, 2.1vmin, 20px); letter-spacing:.12em; text-transform:uppercase; }
  .badge i { width:.6em; height:.6em; border-radius:50%; background:var(--accent); box-shadow:0 0 12px var(--accent); }
  .in { opacity:0; transform:translateY(24px); }
  body.go .in { animation:in .8s cubic-bezier(.2,.8,.2,1) forwards; }
  @keyframes in { to { opacity:1; transform:none; } }
  ${extraCss}
</style></head><body>${body}</body></html>`;

export function titleCard() {
  return base(
    `<main>
      <span class="badge in"><i></i>Modo de teste · Stripe</span>
      <h1 class="in" style="animation-delay:.15s">Do clique ao <span class="grad">pagamento</span></h1>
      <p class="lead in" style="animation-delay:.35s">Fluxo de contratação com Next.js, React e Stripe</p>
      <p class="site in" style="animation-delay:.55s">renanaugusto.com.br</p>
    </main>`,
    `h1 { font-size:clamp(44px, 10vmin, 120px); margin-top:.45em; }
     .lead { margin-top:.9em; font-size:clamp(18px, 3.6vmin, 36px); color:var(--muted); }
     .site { margin-top:2.2em; font-family:"JetBrains Mono", monospace; font-size:clamp(14px, 2.6vmin, 24px); color:var(--subtle); letter-spacing:.06em; }`,
  );
}

/** Terminal com as linhas reais do `stripe listen` desta gravação. */
export function terminalCard({ lines, orderId }) {
  const rows = lines
    .map((line, index) => {
      const ok = /\[200\]/.test(line);
      return `<div class="row in ${ok ? "ok" : ""}" style="animation-delay:${0.5 + index * 0.55}s">${escapeHtml(line)}</div>`;
    })
    .join("");
  const checks = ["Assinatura do webhook verificada", `Pedido ${orderId} marcado como pago`, "E-mails para o cliente e para o Renan"];
  const chips = checks
    .map((text, index) => `<li class="in" style="animation-delay:${0.9 + lines.length * 0.55 + index * 0.35}s"><b>✓</b>${escapeHtml(text)}</li>`)
    .join("");
  return base(
    `<main>
      <span class="badge in"><i></i>Nos bastidores</span>
      <section class="term in" style="animation-delay:.2s">
        <header><span></span><span></span><span></span><em>stripe listen</em></header>
        <div class="body">${rows}<div class="row caret in" style="animation-delay:${0.5 + lines.length * 0.55}s">▍</div></div>
      </section>
      <ul>${chips}</ul>
    </main>`,
    `.term { margin:1.2em auto 0; text-align:left; border-radius:18px; overflow:hidden; background:#060908; border:1px solid #2e3c3a;
        box-shadow:0 0 60px -20px rgb(34 211 238 / .5); }
     .term header { display:flex; align-items:center; gap:8px; padding:12px 16px; background:#131a19; border-bottom:1px solid #212c2b; }
     .term header span { width:12px; height:12px; border-radius:50%; background:#2e3c3a; }
     .term header span:nth-child(1){background:#ff6b7a} .term header span:nth-child(2){background:#fbbf24} .term header span:nth-child(3){background:#4ade80}
     .term header em { margin-left:10px; font-style:normal; font-family:"JetBrains Mono", monospace; color:var(--subtle); font-size:clamp(12px,1.9vmin,18px); }
     .term .body { padding:clamp(14px,2.6vmin,26px); font-family:"JetBrains Mono", monospace; font-size:clamp(11px, 2.05vmin, 21px); line-height:1.75; color:var(--muted); white-space:pre-wrap; word-break:break-word; }
     .row.ok { color:var(--success); }
     .caret { color:var(--accent); animation-name:in, blink !important; animation-duration:.8s, 1s !important; animation-iteration-count:1, infinite !important; animation-timing-function:ease, steps(1) !important; }
     @keyframes blink { 50% { opacity:0; } }
     ul { list-style:none; padding:0; margin-top:1.4em; display:flex; flex-wrap:wrap; justify-content:center; gap:.7em; }
     li { display:inline-flex; gap:.55em; align-items:center; border:1px solid #2e3c3a; background:#131a19; border-radius:999px; padding:.5em 1em; font-size:clamp(13px, 2.3vmin, 22px); }
     li b { color:var(--success); }`,
  );
}

export function outroCard({ origin }) {
  const stack = ["Next.js 16", "React 19", "TypeScript", "Stripe", "Playwright"];
  return base(
    `<main>
      <img class="in" src="${escapeHtml(origin)}/images/profile/renan-github.jpg" alt="">
      <h1 class="in" style="animation-delay:.15s">Renan <span class="grad">Augusto</span></h1>
      <p class="role in" style="animation-delay:.3s">Desenvolvedor Frontend Sênior</p>
      <p class="site in" style="animation-delay:.5s">renanaugusto.com.br</p>
      <ul class="in" style="animation-delay:.7s">${stack.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </main>`,
    `img { width:clamp(96px, 20vmin, 200px); height:clamp(96px, 20vmin, 200px); border-radius:50%; object-fit:cover;
        border:3px solid transparent; background:linear-gradient(#0a0d0d,#0a0d0d) padding-box, linear-gradient(135deg,var(--accent),var(--blue),var(--violet)) border-box;
        box-shadow:0 0 50px -10px rgb(34 211 238 / .55); }
     h1 { font-size:clamp(40px, 9vmin, 104px); margin-top:.35em; }
     .role { margin-top:.5em; font-size:clamp(18px, 3.4vmin, 34px); color:var(--muted); }
     .site { display:inline-block; margin-top:1.3em; padding:.5em 1.2em; border-radius:999px; font-family:"Space Grotesk", sans-serif; font-weight:700;
        font-size:clamp(20px, 4vmin, 40px); color:#03141a; background:var(--accent); box-shadow:0 0 40px -8px rgb(34 211 238 / .8); }
     ul { list-style:none; padding:0; margin-top:1.6em; display:flex; flex-wrap:wrap; justify-content:center; gap:.6em; }
     li { border:1px solid #2e3c3a; background:#131a19; border-radius:999px; padding:.4em .95em; font-family:"JetBrains Mono", monospace; font-size:clamp(12px, 2.1vmin, 20px); color:var(--muted); }`,
  );
}
