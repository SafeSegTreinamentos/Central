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
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
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
// esperarAuth() — resolve a corrida entre o Firestore tentar ler
// dado e o Firebase ainda estar carregando a sessão salva do
// usuário. Sem isso, uma leitura disparada rápido demais no
// carregamento da página é recusada mesmo com o usuário já logado.
// Todo módulo que lê dado do Firestore deve chamar isso PRIMEIRO.
// ============================================================
export function esperarAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user); // user = objeto do usuário logado, ou null se ninguém logado
    });
  });
}

// Reexporta os helpers do Firestore/Auth pra não precisar importar
// a URL gigante do CDN de novo em cada página que usar este arquivo.
export {
  collection, getDocs, doc, getDoc, query, where, orderBy, limit,
  onAuthStateChanged
};
