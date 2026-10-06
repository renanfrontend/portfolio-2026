import type { Locale } from "./config";
import en from "./messages/en.json";
import ptBR from "./messages/pt-BR.json";

export type Dictionary = typeof ptBR;

// O inglês precisa ter exatamente as mesmas chaves do português.
const dictionaries: Record<Locale, Dictionary> = {
  "pt-BR": ptBR,
  en: en satisfies Dictionary,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
