export const THEME_STORAGE_KEY = "theme";
export const INTRO_STORAGE_KEY = "intro-seen";

/**
 * Executado antes da pintura para aplicar o tema salvo e evitar flash.
 * Também marca <html class="js"> e desliga a abertura quando ela já foi vista
 * nesta sessão, quando o usuário prefere movimento reduzido ou quando quem acessa é um
 * robô de busca ou de prévia de links (Google, Bing, LinkedIn, WhatsApp...).
 */
export const themeInitScript = `(function(){try{var d=document.documentElement;d.classList.add("js");var c=localStorage.getItem("${THEME_STORAGE_KEY}");if(c!=="light"&&c!=="dark"&&c!=="system")c="dark";var t=c==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):c;d.setAttribute("data-theme",t);if(sessionStorage.getItem("${INTRO_STORAGE_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches||/bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|linkedin|embedly/i.test(navigator.userAgent))d.setAttribute("data-intro","off");}catch(e){document.documentElement.setAttribute("data-intro","off");}})();`;
