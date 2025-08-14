/* ===========================
   CONFIGURAÇÕES RÁPIDAS
=========================== */
// Troque para o seu número do WhatsApp com DDI+DDD (somente dígitos):
const WHATSAPP_NUMBER = "5511999999999";
// Usuário de demonstração (login fake local)
const DEMO_USER = { email: "demo@site.com", password: "123456" };

/* ===========================
   PRELOADER
=========================== */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  pre.style.opacity = '0';
  setTimeout(() => pre.style.display = 'none', 300);

  // Mostrar/ocultar flutuantes após load
  const fab = document.getElementById('backToTop');
  const wa = document.getElementById('waFloat');
  const toggleFloaters = () => {
    if (window.scrollY > 600) {
      fab.classList.add('show'); wa.classList.add('show');
    } else {
      fab.classList.remove('show'); wa.classList.remove('show');
    }
  };
  toggleFloaters();
  window.addEventListener('scroll', toggleFloaters, { passive:true });
});

/* ===========================
   TEMA (light/dark)
=========================== */
const root = document.documentElement;
const THEME_KEY = "gourmet-theme";
function setTheme(t){ root.setAttribute('data-theme', t); localStorage.setItem(THEME_KEY, t); }
const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
setTheme(savedTheme);

function bindThemeToggles(){
  const toggles = [document.getElementById('themeToggle'), document.getElementById('themeToggleLogin')].filter(Boolean);
  toggles.forEach(btn => btn.addEventListener('click', () => {
    const t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(t);
  }));
}
bindThemeToggles();

/* ===========================
   LOGIN GATE (localStorage)
=========================== */
const LOGIN_KEY = "gourmet-logged";
const loginGate = document.getElementById('loginGate');
const app = document.getElementById('app');

// Se já está logado, abre o app
(function checkAuth(){
  const logged = localStorage.getItem(LOGIN_KEY) === 'true';
  if (logged) {
    loginGate.classList.add('hidden');
    app.classList.remove('hidden');
  } else {
    app.classList.add('hidden');
    loginGate.classList.remove('hidden');
  }
})();

// Lógica de login funcional
const loginForm = document.getElementById('loginForm');
if (loginForm){
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const pass = document.getElementById('password').value;
    const ok = (email === DEMO_USER.email && pass === DEMO_USER.password);

    if(ok){
      localStorage.setItem(LOGIN_KEY,'true');
      // transição suave
      loginGate.classList.add('fade-out'); // aplica transição
      setTimeout(()=>{
        loginGate.classList.add("hidden"); // remove do fluxo e cliques
        app.classList.remove('hidden');
        app.style.opacity = '0';
        requestAnimationFrame(()=>{
          app.style.transition = 'opacity .35s ease';
          app.style.opacity = '1';
        });
      }, 300);
    } else {
      alert('Credenciais inválidas. Use demo@site.com / 123456 (apenas demonstração).');
    }
  });
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem(LOGIN_KEY);
  location.reload();
});

/* ===========================
   MENU MOBILE
=========================== */
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.nav');
hamburger?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
});


/* ===========================
   PROMO CAROUSEL
=========================== */
const track = document.querySelector('.promo-track');
const dotsWrap = document.querySelector('.promo-dots');
let promoIndex = 0;
if (track && dotsWrap){
  const total = track.children.length;
  for(let i=0;i<total;i++){
    const b = document.createElement('button');
    if(i===promoIndex) b.classList.add('active');
    b.addEventListener('click', ()=> goTo(i));
    dotsWrap.appendChild(b);
  }
  function goTo(i){
    promoIndex = i;
    track.style.transform = `translateX(-${i * 100}%)`;
    dotsWrap.querySelectorAll('button').forEach((d,idx)=> d.classList.toggle('active', idx===i));
  }
  setInterval(()=> goTo((promoIndex+1)%total), 4500);
}

/* ===========================
   INTERSECTION REVEAL
=========================== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('show');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .card').forEach(el => io.observe(el));

/* ===========================
   PARALLAX DECOR
=========================== */
const parallaxEls = document.querySelectorAll('.parallax');
window.addEventListener('scroll', () => {
  const y = window.scrollY || window.pageYOffset;
  parallaxEls.forEach(el => {
    const speed = parseFloat(el.dataset.speed || '0.2');
    el.style.transform = `translate3d(0, ${y * speed * -1}px, 0)`;
  });
}, { passive: true });

/* ===========================
   FILTRO & BUSCA
=========================== */
const chips = document.querySelectorAll('.chip');
const cards = Array.from(document.querySelectorAll('.card'));

function isFav(id){ return (JSON.parse(localStorage.getItem("gourmet-favs")||"[]")).includes(id); }

function filterCards(category){
  const q = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  cards.forEach(card => {
    const inCategory = category === 'all' 
      || card.dataset.category === category
      || (category === 'favoritos' && isFav(card.dataset.id));
    const title = (card.dataset.title || '').toLowerCase();
    const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
    const matchesText = title.includes(q) || desc.includes(q);
    card.classList.toggle('hidden', !(inCategory && matchesText));
  });
}

let currentCategory = 'all';
chips.forEach(ch => ch.addEventListener('click', () => {
  chips.forEach(c => c.classList.remove('active'));
  ch.classList.add('active');
  currentCategory = ch.dataset.filter;
  filterCards(currentCategory);
}));

const searchInput = document.getElementById('searchInput');
searchInput?.addEventListener('input', () => filterCards(currentCategory));

/* ===========================
   FAVORITOS (localStorage)
=========================== */
const FAV_KEY = "gourmet-favs";
function getFavs(){ try{ return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch{ return []; } }
function saveFavs(list){ localStorage.setItem(FAV_KEY, JSON.stringify(list)); }

function refreshFavButtons(){
  document.querySelectorAll('.card').forEach(card=>{
    const btn = card.querySelector('.fav-btn');
    if(!btn) return;
    const active = isFav(card.dataset.id);
    btn.classList.toggle('active', active);
    btn.querySelector('i').className = active ? 'bx bxs-heart' : 'bx bx-heart';
  });
}
refreshFavButtons();

document.querySelectorAll('.fav-btn').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const card = btn.closest('.card');
    const id = card.dataset.id;
    let favs = getFavs();
    if (isFav(id)) favs = favs.filter(x=>x!==id);
    else favs.push(id);
    saveFavs(favs);
    refreshFavButtons();
    if (currentCategory === 'favoritos') filterCards(currentCategory);
  });
});

/* ===========================
   MODAL DETALHES
=========================== */
const modal = document.getElementById('itemModal');
const modalImg = modal?.querySelector('.modal-img');
const modalTitle = modal?.querySelector('.modal-title');
const modalDesc = modal?.querySelector('.modal-desc');
const modalPrice = modal?.querySelector('.modal-price');
const modalWA = modal?.querySelector('.modal-wa');

function openModalFromCard(card){
  modalImg.src = card.dataset.img;
  modalImg.alt = card.dataset.title;
  modalTitle.textContent = card.dataset.title;
  modalDesc.textContent = card.dataset.desc;
  modalPrice.textContent = `R$ ${card.dataset.price}`;
  modal.showModal();
  modalWA.dataset.item = card.dataset.title;
  modalWA.dataset.price = card.dataset.price;
}
document.querySelector('.modal-close')?.addEventListener('click', ()=> modal.close());
modal?.addEventListener('click', (e)=>{ if(e.target === modal) modal.close(); });

document.querySelectorAll('.open-modal').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const card = e.currentTarget.closest('.card');
    openModalFromCard(card);
  });
});

/* ===========================
   WHATSAPP (itens + geral)
=========================== */
function makeWALink(text){
  const msg = encodeURIComponent(text);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}
function openWA(item, price){
  const text = `Olá! Quero pedir: *${item}* — R$ ${price}\n\nEnviado pelo Cardápio Online 🍽️`;
  window.open(makeWALink(text), '_blank', 'noopener');
}

document.querySelectorAll('.open-whatsapp').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const item = btn.dataset.item;
    const price = btn.dataset.price;
    openWA(item, price);
  });
});
modalWA?.addEventListener('click', ()=>{
  const item = modalWA.dataset.item;
  const price = modalWA.dataset.price;
  openWA(item, price);
});

// Botão flutuante abre conversa genérica
const waFloat = document.getElementById('waFloat');
if (waFloat){
  const defaultText = `Olá! Vim pelo Cardápio Online e gostaria de tirar uma dúvida.`;
  waFloat.href = makeWALink(defaultText);
}

/* ===========================
   VOLTAR AO TOPO
=========================== */
const fab = document.getElementById('backToTop');
fab?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===========================
   ACESSO RÁPIDO FAVORITOS LINK
=========================== */
document.querySelector('.fav-link')?.addEventListener('click', ()=>{
  const favChip = Array.from(document.querySelectorAll('.chip')).find(c => c.dataset.filter === 'favoritos');
  favChip?.click();
});