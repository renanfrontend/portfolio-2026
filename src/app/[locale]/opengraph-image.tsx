import { ImageResponse } from "next/og";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const alt = "Renan Augusto, Desenvolvedor Frontend Sênior";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagem de compartilhamento com conteúdo verdadeiro do perfil, sem retrato ou métricas. */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: param } = await params;
  const dict = getDictionary(isLocale(param) ? param : defaultLocale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0a0d0d 0%, #0c1f2a 55%, #1f1236 100%)",
          color: "#ecf3f1",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              border: "2px solid #22d3ee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#67e8f9",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            RA
          </div>
          <div style={{ fontSize: 26, color: "#a2b2ae" }}>React · Next.js · TypeScript</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>Renan Augusto</div>
          <div style={{ marginTop: 24, fontSize: 40, color: "#67e8f9", fontWeight: 700 }}>{dict.home.hero.role}</div>
          <div style={{ marginTop: 20, fontSize: 28, color: "#a2b2ae", maxWidth: 980 }}>{dict.footer.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
