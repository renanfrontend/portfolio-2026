import type { Locale } from "@/i18n/config";

/**
 * Capas feitas à mão para projetos importados do GitHub que não têm site publicado (jogos em Unity, por exemplo).
 * As imagens são capturas do próprio jogo. Diferente de github-covers.ts, este arquivo não é gerado por script.
 */
export const gameCovers: Record<string, { src: string; width: number; height: number; alt: Record<Locale, string> }> = {
  "dev-city-v": {
    src: "/images/projects/dev-city-v.png",
    width: 1440,
    height: 900,
    alt: {
      "pt-BR": "Cruzamento no centro comercial do Dev City V visto do alto, com prédios, semáforos, faixas de pedestre e carros na neblina.",
      en: "Aerial view of an intersection in Dev City V's commercial district, with buildings, traffic lights, crosswalks and cars in the fog.",
    },
  },
  ravenbrook: {
    src: "/images/projects/ravenbrook.png",
    width: 1440,
    height: 900,
    alt: {
      "pt-BR": "Tela inicial de Ravenbrook: O Surto, com o título em vermelho, o menu e uma estátua iluminada no saguão escuro da delegacia.",
      en: "Ravenbrook: O Surto title screen, with the red title, the menu and a lit statue in the police station's dark lobby.",
    },
  },
};
