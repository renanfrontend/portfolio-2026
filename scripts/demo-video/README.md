# Vídeo de demonstração do checkout

Grava o fluxo real de contratação em **modo de teste** (site → modal → Stripe Checkout → confirmação →
webhook) e monta dois vídeos narrados em português, com legendas:

| Formato | Uso | Resolução |
| --- | --- | --- |
| `landscape` | LinkedIn, YouTube, site | 1920x1080 (16:9) |
| `portrait` | Instagram Reels, Stories, TikTok | 1080x1920 (9:16) |

## Pré-requisitos

- `.env.local` com `STRIPE_SECRET_KEY=sk_test_...`, `STRIPE_WEBHOOK_SECRET` (do `stripe listen`) e
  `EMAIL_PROVIDER=test`. **Nunca use chave `sk_live_`**: a gravação faz um pagamento.
- Stripe CLI e ffmpeg (com libx264 e libass). Sem ffmpeg no PATH, instale numa pasta à parte
  (`npm i ffmpeg-static`) e aponte `FFMPEG` para o executável.
- Windows com a voz **Microsoft Daniel (pt-BR)** (Configurações → Hora e idioma → Fala).

## Passo a passo

```bash
npm run build:check
NEXT_DIST_DIR=.next-check npx next start --port 3400
stripe listen --forward-to localhost:3400/api/webhooks/stripe > listen.log
```

Em outro terminal (`W` = pasta de trabalho, fora do repositório):

```bash
FFMPEG=... node scripts/demo-video/prepare-audio.mjs "$W"
DEMO_URL=http://localhost:3400 STRIPE_LISTEN_LOG=listen.log node scripts/demo-video/record.mjs landscape "$W"
FFMPEG=... node scripts/demo-video/compose.mjs landscape "$W" video-demo/checkout-linkedin-16x9.mp4
```

Repita `record.mjs` e `compose.mjs` com `portrait` para a versão vertical.

## Como funciona

- `narration.mjs`: roteiro. `text` vira legenda; `say` ajusta a pronúncia de termos em inglês.
- `prepare-audio.mjs` + `tts.ps1`: voz do Windows (sem serviço externo), silêncios cortados,
  equalização leve, e a duração de cada fala vai para `durations.json`.
- `record.mjs`: Playwright percorre o fluxo com cursor visível e grava os quadros do screencast.
  - Roda em **câmera lenta** (`SLOWMO=3`): animações CSS, relógio do JavaScript do site e as próprias
    ações ficam 3x mais lentas. Isso garante vídeo fluido mesmo em máquina modesta.
  - Cada cena dura, no mínimo, o tempo da sua fala.
- `compose.mjs`:
  - Volta à velocidade real e acelera até 4x as esperas sem fala (digitação, carregamentos).
  - Posiciona as falas, queima as legendas e normaliza o áudio em -14 LUFS (referência de Instagram, LinkedIn e YouTube).
- `cards.mjs`: telas de abertura, bastidores (com o log real do `stripe listen`) e encerramento.

## Diagnóstico

`DEMO_DEBUG=1 DEMO_STOP_AFTER=<cena>` mostra quem chamou cada rolagem da página e encerra a gravação
depois da cena indicada (ex.: `pacotes`), sem gastar tempo com o resto do fluxo.
