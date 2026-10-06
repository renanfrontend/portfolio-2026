/** Valida o parâmetro `servico` da URL; valores desconhecidos resultam em nenhuma seleção. */
export function resolveInitialService(param: string | null, serviceSlugs: readonly string[]): string | undefined {
  if (!param) return undefined;
  const value = param.trim().toLowerCase();
  return serviceSlugs.includes(value) ? value : undefined;
}
