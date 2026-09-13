// ============================================================
// SafeSeg — Utilitários compartilhados
// Importado como <script type="module"> nas páginas que precisam,
// do mesmo jeito que firebase-init.js.
//
// Centraliza 2 correções que estavam duplicadas (e divergentes) em
// vários arquivos — a ideia é nunca mais precisar corrigir a mesma
// coisa em 8 lugares diferentes:
//   1. escapeHtml — nome de empresa/colaborador/lead inserido direto
//      no HTML sem escapar podia quebrar o card (aspas, < >)
//   2. statusPorData — comparava datas passando por new Date('AAAA-MM-DD'),
//      que o JS sempre lê como meia-noite UTC, adiantando o status em
//      3h (fuso do Brasil) — um certificado que vence hoje aparecia
//      "Vencido" desde a meia-noite local, 3h antes da hora real
// ============================================================

/**
 * Escapa texto antes de inserir em innerHTML/template literal.
 * Sempre usar em qualquer texto vindo do Firestore (nome de empresa,
 * colaborador, lead, etc.) antes de colocar dentro de HTML.
 */
export function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = (texto ?? '').toString();
  return div.innerHTML;
}

/**
 * Calcula quantos dias faltam pra uma data no formato "DD/MM/AAAA"
 * vencer — sempre por comparação de STRING "AAAA-MM-DD", nunca
 * passando por new Date(), que é o que causava o bug de fuso horário
 * (new Date('AAAA-MM-DD') é sempre lido como meia-noite UTC pelo
 * motor JS, adiantando a virada de dia em 3h no horário do Brasil).
 *
 * @param {string} dataBR - data no formato "DD/MM/AAAA"
 * @returns {number|null} dias até vencer (negativo se já venceu), ou null se a data for inválida
 */
export function diasAteVencer(dataBR) {
  if (!dataBR) return null;
  const partes = dataBR.split('/');
  if (partes.length !== 3) return null;
  const [dd, mm, aaaa] = partes;
  const dataAlvo = new Date(Number(aaaa), Number(mm) - 1, Number(dd)); // construtor local, não string ISO — não sofre do bug de fuso
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  dataAlvo.setHours(0,0,0,0);
  return Math.round((dataAlvo - hoje) / 86400000);
}

/**
 * Calcula o status (Válido / Atenção / Vencido) a partir de uma data
 * no formato "DD/MM/AAAA", comparando por STRING "AAAA-MM-DD" — nunca
 * passa por new Date(), então nunca sofre do bug de fuso horário
 * (new Date('AAAA-MM-DD') é sempre lido como UTC pelo motor JS, o que
 * adianta a virada de dia em 3h no horário do Brasil).
 *
 * @param {string} dataBR - data no formato "DD/MM/AAAA"
 * @param {number} diasAlertaVencendo - quantos dias antes conta como "Atenção" (padrão 60)
 * @returns {{ cls: string, label: string }} cls: 'ok' | 'warn' | 'danger' | 'pending'
 */
export function statusPorData(dataBR, diasAlertaVencendo = 60) {
  const dias = diasAteVencer(dataBR);
  if (dias === null) return { cls: 'pending', label: 'Pendente' };
  if (dias < 0) return { cls: 'danger', label: 'Vencido' };
  if (dias <= diasAlertaVencendo) return { cls: 'warn', label: 'Atenção' };
  return { cls: 'ok', label: 'Válido' };
}
