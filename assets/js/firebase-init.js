// ============================================================
// SafeSeg — Inicialização compartilhada do Firebase
// Importado como <script type="module"> nas páginas que precisam
// de dado real do Firestore (Empresas, Certificados, Documentos,
// Dashboard, Validador).
//
// A apiKey aqui é pública por definição do próprio Firebase — a
// segurança real está nas Regras do Firestore, não nesse arquivo.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  collectionGroup,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  or,
  orderBy,
  limit,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBWLjXZky00EbJOohMkU0MPdlZtxj0mrhs",
  authDomain: "portal-safeseg.firebaseapp.com",
  projectId: "portal-safeseg",
  storageBucket: "portal-safeseg.firebasestorage.app",
  messagingSenderId: "1079674980653",
  appId: "1:1079674980653:web:a34490005877c271eceba4"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ============================================================
// criarUsuarioCliente() — cria um novo login (e-mail/senha) pra um
// cliente, vinculado a uma empresa, SEM deslogar o admin.
//
// Truque: cria um segundo "app" Firebase só pra esse momento (mesmo
// projeto, mesma configuração), usa ele pra criar a conta, desloga
// só essa instância secundária — a sessão do admin (app principal)
// nunca é tocada.
// ============================================================
export async function criarUsuarioCliente({ nome, email, senha, empresaId }) {
  const secondaryApp = initializeApp(firebaseConfig, 'secundario-' + Date.now());
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, senha);
    const novoUid = cred.user.uid;
    // grava o perfil no banco principal (o admin logado tem permissão de escrita)
    await setDoc(doc(db, 'usuarios', novoUid), {
      nome: nome || '',
      email,
      role: 'cliente',
      empresaId
    });
    await signOut(secondaryAuth);
    return { ok: true, uid: novoUid };
  } catch (err) {
    try { await signOut(secondaryAuth); } catch (e) {}
    return { ok: false, error: err.message };
  }
}

// ============================================================
// TELA DE LOGIN — aparece automaticamente por cima de qualquer
// página quando ninguém está logado. Não precisa mexer em nenhuma
// página individual pra isso funcionar: toda página que usa
// esperarAuth() (direto ou via obterMeuPerfil) já ganha isso.
// ============================================================
function mostrarTelaLogin() {
  return new Promise((resolve) => {
    if (document.getElementById('authOverlay')) return; // já está mostrando

    const overlay = document.createElement('div');
    overlay.id = 'authOverlay';
    const LOGO = new URL('../img/logo-safeseg.webp', import.meta.url).href;
    const BEBAS = new URL('../fonts/bebas-neue-latin-400-normal.woff2', import.meta.url).href;
    const SITE = 'https://www.safeseg.eng.br/';
    const WA = 'https://wa.me/5546999203945?text=' + encodeURIComponent('Olá, preciso de ajuda para entrar no Portal SafeSeg');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;overflow-y:auto;background:#14171B;font-family:Inter,system-ui,Arial,sans-serif;color:#ECE7DD;';
    overlay.innerHTML = `
      <style>
        @font-face{font-family:'Bebas Neue';font-display:swap;src:url(${BEBAS}) format('woff2')}
        #authOverlay *{box-sizing:border-box}
        #authOverlay .al-wrap{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 16px 40px;gap:22px}
        #authOverlay .al-logo{width:132px;height:auto}
        #authOverlay .al-placa{position:relative;width:100%;max-width:400px;background:#F59E0B;border-radius:10px;padding:10px}
        #authOverlay .al-placa::before{content:"";position:absolute;inset:0;border-radius:10px;padding:10px;background:repeating-linear-gradient(-45deg,#14171B 0 12px,#F59E0B 12px 24px);-webkit-mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}
        #authOverlay .al-miolo{position:relative;background:#F59E0B;border:3px solid #14171B;border-radius:4px;padding:24px 22px 22px;color:#14171B}
        #authOverlay h1{font:400 44px/.9 'Bebas Neue',Impact,'Arial Narrow',sans-serif;margin:0 0 6px;letter-spacing:.01em}
        #authOverlay .al-sub{font-size:15px;font-weight:500;margin:0 0 18px}
        #authOverlay label{display:block;font-size:14px;font-weight:600;margin:0 0 6px}
        #authOverlay .al-campo{position:relative;margin-bottom:14px}
        #authOverlay input{width:100%;padding:13px 14px;font-size:16px;border:2px solid #14171B;border-radius:8px;background:#FFFBF2;color:#14171B;font-family:inherit}
        #authOverlay input:focus{outline:3px solid #14171B;outline-offset:1px}
        #authOverlay .al-ver{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:0;font:600 13px Inter,Arial,sans-serif;color:#14171B;padding:6px 8px;cursor:pointer;text-decoration:underline}
        #authOverlay .al-erro{display:none;background:#14171B;color:#FF9C94;border-radius:6px;padding:10px 12px;font-size:14px;margin-bottom:12px}
        #authOverlay .al-entrar{width:100%;padding:15px;border:0;border-radius:8px;background:#14171B;color:#fff;font:700 16px Inter,Arial,sans-serif;cursor:pointer}
        #authOverlay .al-entrar:hover{background:#000}
        #authOverlay .al-entrar:disabled{opacity:.7;cursor:wait}
        #authOverlay .al-links{display:flex;flex-wrap:wrap;gap:10px 22px;justify-content:center;font-size:14.5px}
        #authOverlay .al-links a{color:#ECE7DD;text-decoration:none;border-bottom:1.5px solid rgba(245,158,11,.6);padding-bottom:2px}
        #authOverlay .al-links a:hover{color:#F59E0B}
        #authOverlay .al-nota{max-width:400px;text-align:center;color:#9AA0A8;font-size:13.5px;line-height:1.5;margin:0}
      </style>
      <div class="al-wrap">
        <a href="${SITE}" aria-label="Voltar ao site da SafeSeg"><img class="al-logo" src="${LOGO}" alt="SafeSeg Segurança do Trabalho"></a>
        <div class="al-placa"><form class="al-miolo" id="authForm" novalidate>
          <h1>Portal SafeSeg</h1>
          <p class="al-sub">Entre para ver os certificados e os treinamentos da sua empresa.</p>
          <label for="authEmail">E-mail</label>
          <div class="al-campo"><input id="authEmail" type="email" inputmode="email" placeholder="seuemail@empresa.com" autocomplete="username"></div>
          <label for="authSenha">Senha</label>
          <div class="al-campo"><input id="authSenha" type="password" placeholder="Sua senha" autocomplete="current-password" style="padding-right:76px"><button type="button" class="al-ver" id="authVer" aria-pressed="false">Mostrar</button></div>
          <div class="al-erro" id="authErro" role="alert"></div>
          <button type="submit" class="al-entrar" id="authBtnEntrar">Entrar</button>
        </form></div>
        <div class="al-links">
          <a href="${WA}">Esqueci a senha ou não tenho acesso</a>
          <a href="${SITE}">Voltar ao site</a>
        </div>
        <p class="al-nota">O acesso é liberado pela SafeSeg para cada empresa cliente. Cada empresa vê só os próprios dados.</p>
      </div>`;
    document.body.appendChild(overlay);

    const emailInput = document.getElementById('authEmail');
    const senhaInput = document.getElementById('authSenha');
    const erroBox = document.getElementById('authErro');
    const btn = document.getElementById('authBtnEntrar');

    async function tentarLogin() {
      const email = emailInput.value.trim();
      const senha = senhaInput.value;
      erroBox.style.display = 'none';
      if (!email || !senha) {
        erroBox.textContent = 'Preencha e-mail e senha.';
        erroBox.style.display = 'block';
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Entrando...';
      try {
        const cred = await signInWithEmailAndPassword(auth, email, senha);
        overlay.remove();
        resolve(cred.user);
      } catch (err) {
        erroBox.textContent = 'E-mail ou senha incorretos.';
        erroBox.style.display = 'block';
        senhaInput.select();
        btn.disabled = false;
        btn.textContent = 'Entrar';
      }
    }

    document.getElementById('authForm').addEventListener('submit', (e) => { e.preventDefault(); tentarLogin(); });
    const ver = document.getElementById('authVer');
    ver.addEventListener('click', () => {
      const mostrar = senhaInput.type === 'password';
      senhaInput.type = mostrar ? 'text' : 'password';
      ver.textContent = mostrar ? 'Ocultar' : 'Mostrar';
      ver.setAttribute('aria-pressed', mostrar);
    });
    emailInput.focus();
  });
}

export function esperarAuth() {
  // Resolve a corrida entre o Firestore tentar ler dado e o Firebase
  // ainda estar carregando a sessão salva do usuário — e, se ninguém
  // estiver logado, mostra a tela de login e só resolve depois que
  // o login der certo.
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (user) {
        resolve(user);
      } else {
        const userLogado = await mostrarTelaLogin();
        resolve(userLogado);
      }
    });
  });
}

// ============================================================
// obterMeuPerfil() — busca o documento usuarios/{uid} do usuário logado
// (role: 'admin' ou 'cliente', empresaId se for cliente). Espera a
// autenticação confirmar antes de tentar ler.
// ============================================================
export async function obterMeuPerfil() {
  const user = await esperarAuth();
  if (!user) return null;
  const snap = await getDoc(doc(db, 'usuarios', user.uid));
  if (!snap.exists()) return null;
  return { uid: user.uid, ...snap.data() };
}

// ============================================================
// registrarAuditoria() — grava "quem fez o quê e quando" na coleção
// 'auditoria'. Chama isso depois de qualquer ação sensível (editar
// certificado, mexer em funcionário, dar/tirar acesso, etc).
// Nunca trava a ação principal se der erro — só loga no console.
// ============================================================
export async function registrarAuditoria(acao, detalhes) {
  try {
    const user = auth.currentUser;
    if (!user) return;
    let nomeUsuario = user.email || 'desconhecido';
    try {
      const perfilSnap = await getDoc(doc(db, 'usuarios', user.uid));
      if (perfilSnap.exists() && perfilSnap.data().nome) nomeUsuario = perfilSnap.data().nome;
    } catch (e) { /* segue com o e-mail mesmo, sem travar */ }

    await addDoc(collection(db, 'auditoria'), {
      acao,
      detalhes: detalhes || {},
      usuarioUid: user.uid,
      usuarioEmail: user.email || '',
      usuarioNome: nomeUsuario,
      criadoEm: new Date().toISOString()
    });
  } catch (err) {
    console.error('Falha ao gravar log de auditoria (não crítico):', err);
  }
}

// Reexporta os helpers do Firestore/Auth pra não precisar importar
// a URL gigante do CDN de novo em cada página que usar este arquivo.
export {
  collection, collectionGroup, getDocs, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, or, orderBy, limit, onAuthStateChanged, signOut, runTransaction
};
// obterMeuPerfil e esperarAuth já exportados acima com 'export function'/'export async function'
