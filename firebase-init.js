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
  limit
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
    overlay.style.cssText = 'position:fixed;inset:0;background:#14171B;display:flex;align-items:center;justify-content:center;z-index:99999;font-family:Inter,Arial,sans-serif;padding:16px;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:32px 28px;max-width:360px;width:100%;box-shadow:0 8px 30px rgba(0,0,0,0.4);">
        <div style="font-family:'Bebas Neue',Arial,sans-serif;font-size:26px;letter-spacing:.03em;color:#14171B;margin-bottom:2px;">SAFESEG</div>
        <p style="font-size:13px;color:#667085;margin:0 0 20px;">Entre com sua conta pra continuar</p>
        <label style="font-size:11px;font-weight:700;text-transform:uppercase;color:#667085;display:block;margin-bottom:4px;">E-mail</label>
        <input id="authEmail" type="email" placeholder="seuemail@exemplo.com" autocomplete="username"
          style="width:100%;padding:10px 12px;border:1px solid #E7E2D4;border-radius:8px;margin-bottom:12px;font-size:14px;box-sizing:border-box;">
        <label style="font-size:11px;font-weight:700;text-transform:uppercase;color:#667085;display:block;margin-bottom:4px;">Senha</label>
        <input id="authSenha" type="password" placeholder="••••••••" autocomplete="current-password"
          style="width:100%;padding:10px 12px;border:1px solid #E7E2D4;border-radius:8px;margin-bottom:14px;font-size:14px;box-sizing:border-box;">
        <div id="authErro" style="color:#C6423A;font-size:12.5px;margin-bottom:12px;display:none;"></div>
        <button id="authBtnEntrar" style="width:100%;padding:12px;background:linear-gradient(135deg,#F8CC3E,#C6900A);color:#14171B;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;">Entrar</button>
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
        btn.disabled = false;
        btn.textContent = 'Entrar';
      }
    }

    btn.addEventListener('click', tentarLogin);
    senhaInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tentarLogin(); });
    emailInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') senhaInput.focus(); });
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
  query, where, or, orderBy, limit, onAuthStateChanged, signOut
};
// obterMeuPerfil e esperarAuth já exportados acima com 'export function'/'export async function'
