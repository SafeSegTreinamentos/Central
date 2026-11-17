/**
 * SafeSeg — Backup automático do Firestore (portal-safeseg) para o Google Drive
 *
 * O que faz: lê TODAS as coleções do Firestore (inclusive subcoleções,
 * como funcionários e certificados dentro de cada empresa) e salva um
 * arquivo JSON na pasta 08_SISTEMAS/Backups Firestone Safeseg do Drive.
 *
 * COMO INSTALAR (uma vez só, ~5 min) — logado como safesegseguranca@gmail.com:
 *  1. Abra https://script.google.com → Novo projeto → nome "SafeSeg Backup Firestore".
 *  2. Apague o conteúdo e cole ESTE arquivo inteiro.
 *  3. Engrenagem (Configurações do projeto) → marque
 *     "Mostrar arquivo de manifesto appsscript.json no editor".
 *  4. Abra appsscript.json e troque o conteúdo por:
 *     {
 *       "timeZone": "America/Sao_Paulo",
 *       "exceptionLogging": "STACKDRIVER",
 *       "runtimeVersion": "V8",
 *       "oauthScopes": [
 *         "https://www.googleapis.com/auth/datastore",
 *         "https://www.googleapis.com/auth/drive",
 *         "https://www.googleapis.com/auth/script.external_request",
 *         "https://www.googleapis.com/auth/script.scriptapp"
 *       ]
 *     }
 *  5. Volte ao Código.gs, escolha a função "fazerBackup" e clique Executar.
 *     Autorize as permissões. Confira se o JSON apareceu na pasta do Drive.
 *  6. Escolha a função "instalarAgendamento" e clique Executar.
 *     Pronto: backup automático todo domingo às 3h.
 */

const PROJECT_ID = 'portal-safeseg';
const PASTA_BACKUP_ID = '1WULcJxkhx83g9m2MPqQQZ71SlaLmBAhr'; // 08_SISTEMAS/Backups Firestone Safeseg
const BASE = 'https://firestore.googleapis.com/v1/projects/' + PROJECT_ID + '/databases/(default)/documents';

function fazerBackup() {
  const inicio = new Date();
  const dados = {};
  let total = 0;

  listarColecoes_(BASE).forEach(function (col) {
    dados[col] = lerColecao_(BASE + '/' + col, function () { total++; });
  });

  const nome = 'backup-firestore_' +
    Utilities.formatDate(inicio, 'America/Sao_Paulo', 'yyyy-MM-dd_HHmm') + '.json';
  const conteudo = JSON.stringify({
    projeto: PROJECT_ID,
    geradoEm: inicio.toISOString(),
    totalDocumentos: total,
    colecoes: dados
  });
  DriveApp.getFolderById(PASTA_BACKUP_ID).createFile(nome, conteudo, 'application/json');
  Logger.log('Backup salvo: ' + nome + ' (' + total + ' documentos)');
}

/** Agenda o backup semanal (domingo, 3h). Rode uma vez. */
function instalarAgendamento() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'fazerBackup') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('fazerBackup')
    .timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(3).create();
  Logger.log('Agendamento instalado: todo domingo às 3h.');
}

// ---------- internos ----------

function chamar_(url, opcoes) {
  opcoes = opcoes || {};
  opcoes.headers = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() };
  opcoes.muteHttpExceptions = true;
  const resp = UrlFetchApp.fetch(url, opcoes);
  if (resp.getResponseCode() >= 300) {
    throw new Error('Firestore ' + resp.getResponseCode() + ': ' + resp.getContentText().slice(0, 300));
  }
  return JSON.parse(resp.getContentText() || '{}');
}

/** Lista os nomes das coleções logo abaixo de um caminho (raiz ou documento). */
function listarColecoes_(caminho) {
  const ids = [];
  let token = '';
  do {
    const r = chamar_(caminho + ':listCollectionIds', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ pageSize: 300, pageToken: token })
    });
    (r.collectionIds || []).forEach(function (id) { ids.push(id); });
    token = r.nextPageToken || '';
  } while (token);
  return ids;
}

/** Lê todos os documentos de uma coleção, com subcoleções. */
function lerColecao_(urlColecao, contar) {
  const docs = {};
  let token = '';
  do {
    const r = chamar_(urlColecao + '?pageSize=300&showMissing=true' + (token ? '&pageToken=' + encodeURIComponent(token) : ''));
    (r.documents || []).forEach(function (d) {
      const id = d.name.split('/').pop();
      const item = { campos: d.fields || {}, atualizadoEm: d.updateTime };
      const subs = listarColecoes_(BASE + d.name.split('/documents')[1]);
      if (subs.length) {
        item.subcolecoes = {};
        subs.forEach(function (s) {
          item.subcolecoes[s] = lerColecao_(urlColecao + '/' + id + '/' + s, contar);
        });
      }
      docs[id] = item;
      contar();
    });
    token = r.nextPageToken || '';
  } while (token);
  return docs;
}
