import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Ícone para a tela inicial do celular: monograma "RA" com o degradê do site. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 55%, #a855f7 100%)",
          color: "#03141a",
          fontSize: 76,
          fontWeight: 800,
          fontFamily: "monospace",
        }}
      >
        RA
      </div>
    ),
    size,
  );
}
