import { getWhatsappNumber } from "@/config/contact";
import { whatsappHref } from "@/lib/links";
import { WhatsappIcon } from "./icons";

type WhatsappButtonProps = { label: string; message: string; newTabHint: string };

/** Botão flutuante que abre o WhatsApp com uma mensagem pronta. Some se não houver número configurado. */
export function WhatsappButton({ label, message, newTabHint }: WhatsappButtonProps) {
  const number = getWhatsappNumber();
  if (!number) return null;

  return (
    <a
      href={whatsappHref(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-50 inline-flex h-14 items-center gap-0 overflow-hidden rounded-full bg-[#25d366] pl-4 pr-4 text-[#06301a] shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] transition-all duration-300 hover:gap-2 hover:pr-5 focus-visible:gap-2 focus-visible:pr-5 focus-visible:outline-offset-4 motion-reduce:transition-none sm:right-6"
    >
      {/* Anel pulsando discretamente para chamar atenção, sem movimento quando o usuário prefere reduzir. */}
      <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#25d366] opacity-20 [animation-duration:2.5s] motion-reduce:hidden" aria-hidden />
      <WhatsappIcon width={26} height={26} className="relative shrink-0" />
      <span className="relative inline-block max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-[max-width] duration-300 group-hover:max-w-56 group-focus-visible:max-w-56 motion-reduce:transition-none">
        {label}
      </span>
      <span className="sr-only">
        {" "}
        {newTabHint}
      </span>
    </a>
  );
}
