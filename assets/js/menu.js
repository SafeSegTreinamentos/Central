/* ============================================================
   SafeSeg — menu lateral único do Portal
   Um só lugar para o menu de todas as páginas.
   Uso na página:  <nav class="sidebar" data-menu="admin"></nav>
                   <script src="../assets/js/menu.js" defer></script>
   data-menu="cliente" mostra o menu do cliente.
   O botão Sair chama window.fazerLogout(), que cada página já define.
   ============================================================ */
(function () {
  const I = {
    casa: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    painel: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    funil: '<path d="M3 4h18l-7 8v6l-4 2v-8z"/>',
    proposta: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
    livro: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zM4 20a2 2 0 0 0 2 2h13v-4"/>',
    msg: '<path d="M4 5h16v11H9l-5 4z"/>',
    predio: '<path d="M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M19 21V10a1 1 0 0 0-1-1h-3M8 7h2M8 11h2M8 15h2M2 21h20"/>',
    sync: '<path d="M20 11a8 8 0 0 0-14.7-4M4 4v4h4M4 13a8 8 0 0 0 14.7 4M20 20v-4h-4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    pasta: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    agenda: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    turma: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.5 6 5.5"/>',
    gerar: '<path d="M12 3v18M3 12h18"/>',
    notas: '<path d="M9 4h6v3H9zM7 5H5v16h14V5h-2M8 12h8M8 16h5"/>',
    instrutor: '<circle cx="12" cy="7" r="4"/><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    prova: '<path d="M7 3h10v18H7z"/><path d="M10 8h4M10 12h4M10 16h2"/>',
    alerta: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>',
    certificado: '<rect x="3" y="4" width="18" height="13" rx="2"/><circle cx="12" cy="11" r="3"/><path d="M10 14l-1 6 3-2 3 2-1-6"/>',
    cartao: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M13 10h5M13 14h4M6 16h5"/>',
    escudo: '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    dinheiro: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    drive: '<path d="M8 3h8l6 10-4 7H6l-4-7z"/>',
    lupa: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    chave: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3"/>',
    sair: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    fechar: '<path d="M6 6l12 12M18 6 6 18"/>'
  };

  const ADMIN = [
    { itens: [
      ['../index.html', 'QG SafeSeg', 'casa'],
      ['dashboard.html', 'Painel', 'painel']
    ]},
    { titulo: 'Vender', itens: [
      ['leads.html', 'Leads', 'funil'],
      ['propostas.html', 'Propostas', 'proposta'],
      ['catalogo-cursos.html', 'Catálogo de cursos', 'livro'],
      ['mensagens.html', 'Mensagens', 'msg']
    ]},
    { titulo: 'Clientes', itens: [
      ['empresas.html', 'Empresas', 'predio'],
      ['sincronizar-funcionarios.html', 'Sincronizar funcionários', 'sync'],
      ['informativo-acesso.html', 'Informativo eSocial', 'info'],
      ['documentos.html', 'Documentos', 'pasta']
    ]},
    { titulo: 'Turmas', itens: [
      ['agenda-turmas.html', 'Agenda de turmas', 'agenda'],
      ['gerador-turmas.html', 'Gerador de turmas', 'gerar'],
      ['turmas.html', 'Turmas e notas', 'turma'],
      ['instrutores.html', 'Instrutores', 'instrutor'],
      ['checklist-treinamentos.html', 'Checklist dos cursos', 'check'],
      ['gerador-provas.html', 'Gerador de provas', 'prova']
    ]},
    { titulo: 'Certificados', itens: [
      ['certificados-pendentes.html', 'Pendentes', 'alerta'],
      ['certificados.html', 'Certificados', 'certificado'],
      ['impressao-carteirinhas.html', 'Carteirinhas', 'cartao'],
      ['../validador/', 'Validador público', 'escudo']
    ]},
    { titulo: 'Gestão', itens: [
      ['financeiro.html', 'Financeiro', 'dinheiro'],
      ['arquivos.html', 'Arquivos (Drive)', 'drive'],
      ['auditoria.html', 'Log de auditoria', 'lupa'],
      ['tecnica.html', 'Central técnica', 'chave']
    ]}
  ];

  const CLIENTE = [
    { itens: [
      ['dashboard-cliente.html', 'Painel', 'painel'],
      ['certificados-cliente.html', 'Certificados', 'certificado'],
      ['funcionarios-cliente.html', 'Funcionários', 'turma'],
      ['agenda-cliente.html', 'Agenda de turmas', 'agenda']
    ]},
    { titulo: 'Precisa de algo?', itens: [
      ['https://wa.me/5546999203945?text=' + encodeURIComponent('Olá, sou cliente do Portal SafeSeg e preciso de ajuda'), 'Falar com a SafeSeg', 'msg'],
      ['../validador/', 'Validar um certificado', 'escudo']
    ]}
  ];

  // Páginas internas que não estão no menu acendem o item "pai"
  const PAI = {
    'empresa-detalhe.html': 'empresas.html',
    'dossie.html': 'turmas.html',
    'carteirinha.html': 'impressao-carteirinhas.html',
    'etiqueta-capacete.html': 'impressao-carteirinhas.html',
    'relatorio-conformidade.html': 'empresas.html'
  };

  const svg = (n) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[n] || '') + '</svg>';

  function montar(nav) {
    const tipo = nav.dataset.menu === 'cliente' ? 'cliente' : 'admin';
    const grupos = tipo === 'cliente' ? CLIENTE : ADMIN;
    let atual = location.pathname.split('/').pop() || 'index.html';
    atual = PAI[atual] || atual;

    let html = '<div class="sidebar__topo">' +
      '<a class="sidebar__logo" href="' + (tipo === 'cliente' ? 'dashboard-cliente.html' : '../index.html') + '">' +
      '<img src="../assets/img/logo-safeseg.webp" alt="SafeSeg Segurança do Trabalho" width="160" height="124"></a>' +
      '<button type="button" class="sidebar__abrir" aria-expanded="false" aria-controls="sidebar-lista">' + svg('menu') + '<span>Menu</span></button>' +
      '</div><div class="sidebar__lista" id="sidebar-lista">';

    grupos.forEach((g) => {
      if (g.titulo) html += '<div class="nav-section-label">' + g.titulo + '</div>';
      g.itens.forEach(([href, nome, ic]) => {
        const ativo = href === atual;
        html += '<a class="nav-item' + (ativo ? ' active' : '') + '" href="' + href + '"' + (ativo ? ' aria-current="page"' : '') + '>' + svg(ic) + '<span>' + nome + '</span></a>';
      });
    });

    html += '<button type="button" class="nav-item nav-item--sair">' + svg('sair') + '<span>Sair</span></button></div>';

    nav.classList.add('sidebar--js');
    nav.setAttribute('aria-label', 'Menu do portal');
    nav.innerHTML = html;

    nav.querySelector('.nav-item--sair').addEventListener('click', () => {
      if (typeof window.fazerLogout === 'function') window.fazerLogout();
    });
    const botao = nav.querySelector('.sidebar__abrir');
    botao.addEventListener('click', () => {
      const aberto = nav.classList.toggle('sidebar--aberto');
      botao.setAttribute('aria-expanded', aberto);
      botao.innerHTML = svg(aberto ? 'fechar' : 'menu') + '<span>' + (aberto ? 'Fechar' : 'Menu') + '</span>';
    });
    const ativo = nav.querySelector('.nav-item.active');
    if (ativo && window.matchMedia('(min-width: 901px)').matches) ativo.scrollIntoView({ block: 'nearest' });
  }

  function iniciar() { document.querySelectorAll('nav.sidebar[data-menu]').forEach(montar); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
