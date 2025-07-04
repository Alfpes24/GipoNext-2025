js_code = """
// script.js — QPWON Preventivatore GipoNext

// —————————————————————————————————————————————
// CONFIGURAZIONE BASE
// —————————————————————————————————————————————
const prezzi = {
  starter: { solo: [109, 99, 89, 69, 59, 49, 29, 19], crm: [119, 109, 99, 79, 69, 59, 39, 29] },
  plus:    { solo: [144, 134, 124, 104, 84, 74, 64, 54], crm: [154, 144, 134, 114, 94, 84, 74, 64] },
  vip:     { solo: [154, 144, 134, 114, 94, 84, 74, 64], crm: [164, 154, 144, 124, 104, 94, 84, 74] }
};
const setupFees = [500,500,500,500,750,750,750,1000];
const soglie = [1,2,4,6,8,10,15,20];

// —————————————————————————————————————————————
// UTILITY
// —————————————————————————————————————————————
function getIndiceStanze(n) {
  for (let i = 0; i < soglie.length; i++) {
    if (n <= soglie[i]) return i;
  }
  return soglie.length - 1;
}
function toggleModal(id, show) {
  document.getElementById(id).classList[show ? 'remove' : 'add']('hidden');
}
function mostraErrore(msg) {
  const form = document.getElementById('calculator-form');
  const div = document.createElement('div');
  div.textContent = msg;
  div.style.cssText = 'color:red;font-weight:bold;text-align:center;margin:12px 0';
  form.prepend(div);
  setTimeout(() => div.remove(), 3000);
}

// —————————————————————————————————————————————
// CALCOLO PREVENTIVO
// —————————————————————————————————————————————
function calcolaPreventivo() {
  const stanze  = parseInt(document.getElementById('rooms').value) || 0;
  const medici  = parseInt(document.getElementById('doctors').value) || 0;
  const bundle  = document.getElementById('bundle').value;
  const crm     = document.getElementById('crm').checked;
  const tablet  = document.getElementById('tabletFirma').checked;
  const lettore = document.getElementById('lettoreTessera').checked;

  if (!stanze || !medici) return mostraErrore("Inserisci ambulatori e medici");

  const idx = getIndiceStanze(stanze);
  let unit = prezzi[bundle][crm ? 'crm' : 'solo'][idx];
  if (medici / stanze <= 1.3) unit /= 1.5;

  const canoneBase = unit * stanze;
  const setupBase = setupFees[idx];
  const tabletFee = tablet ? 429 : 0;
  const lettoreFee = lettore ? 79 : 0;

  // Addon
  const addons = Array.from(document.querySelectorAll('.addon:checked')).map(el => {
  const name = el.dataset.name;
  const price = parseFloat(el.dataset.price) || 0;
  const setup = parseFloat(el.dataset.setup) || 0;
  const qtyInput = document.querySelector(`.qty[data-name="${name}"]`);
  const qty = qtyInput ? parseInt(qtyInput.value || 1) : 1;
  return { name, price, setup, qty };
});


  const addonMens = addons.reduce((sum, a) => sum + a.price * a.qty, 0);
  const addonSetup = addons.reduce((sum, a) => sum + a.setup * a.qty, 0);

  const canoneListino = (canoneBase + addonMens) * 1.25;
  const setupListino = (setupBase + addonSetup) * 2;
  const totaleListino = setupListino + tabletFee + lettoreFee;
  const totaleReale = setupBase + addonSetup + tabletFee + lettoreFee;

  window._preventivo = {
    nomeStruttura: '', referente: '', email: '', telefono: '',
    rooms: stanze, doctors: medici, bundle, crm, tablet, lettore,
    addons, canoneBase, setupBase, addonMens, addonSetup,
    canoneListino, setupListino, totaleListino, totaleReale,
    promoInclusa: false
  };

  document.getElementById('monthly-list-price').textContent = canoneListino.toFixed(2) + ' €';
  document.getElementById('setup-list-price').textContent = setupListino.toFixed(2) + ' €';
  document.getElementById('setup-total').textContent = totaleListino.toFixed(2) + ' €';
  document.getElementById('listino-panel').classList.remove('hidden');
  document.getElementById('generate-pdf-btn').classList.remove('hidden');
  document.getElementById('listino-panel').scrollIntoView({ behavior: 'smooth' });
  toggleModal('addon-modal', false);
}

// —————————————————————————————————————————————
// PROMOZIONE
// —————————————————————————————————————————————
function avviaVerifica() {
  const spinner = document.getElementById('loading-spinner');
  const countdownEl = document.getElementById('countdown');
  const bar = document.getElementById('progressBar');

  spinner.classList.remove('hidden');
  document.getElementById('dettaglio-panel').classList.add('hidden');
  bar.style.width = '0%';

  let progress = 0;
  const anim = setInterval(() => {
    progress += 100 / 150;
    bar.style.width = progress + '%';
    if (progress >= 100) clearInterval(anim);
  }, 100);

  let secs = 15;
  countdownEl.textContent = 'Attendere 15s...';
  const timer = setInterval(() => {
    secs--;
    countdownEl.textContent = `Attendere ${secs}s...`;
    if (secs <= 0) {
      clearInterval(timer);
      spinner.classList.add('hidden');
      mostraOffertaRiservata();
    }
  }, 1000);
}

function mostraOffertaRiservata() {
  const d = window._preventivo;
  document.getElementById('default-monthly-price').textContent = d.canoneBase.toFixed(2) + ' €';
  document.getElementById('list-monthly-crossed').textContent = d.canoneListino.toFixed(2) + ' €';
  document.getElementById('setup-fee').textContent = d.setupBase.toFixed(2) + ' €';
  document.getElementById('list-setup-crossed').textContent = d.setupListino.toFixed(2) + ' €';

  document.getElementById('dettaglio-panel').classList.remove('hidden');
  document.getElementById('dettaglio-panel').scrollIntoView({ behavior: 'smooth' });
}

// —————————————————————————————————————————————
// PDF
// —————————————————————————————————————————————
async function confermaGenerazionePDF() {
  const nomeS = document.getElementById('nomeStruttura').value.trim();
  const ref = document.getElementById('nomeReferente').value.trim();
  const email = document.getElementById('email').value.trim();
  const tel = document.getElementById('telefono').value.trim();
  const promo = document.getElementById('includiPromo')?.checked || false;

  if (!nomeS || !ref || !email || !tel) return mostraErrore("Completa tutti i dati");

  Object.assign(window._preventivo, {
    nomeStruttura: nomeS, referente: ref, email, telefono: tel, promoInclusa: promo
  });

  toggleModal('pdf-modal', false);
  await generaPDF(window._preventivo);
}

async function generaPDF(d) {
  const url = 'https://alfpes24.github.io/gipotest25/preventivo.pdf';
  const existingBytes = await fetch(url).then(r => r.arrayBuffer());
  const pdfDoc = await PDFLib.PDFDocument.load(existingBytes);
  const form = pdfDoc.getForm();

  form.getTextField('nome_struttura').setText(d.nomeStruttura);
  form.getTextField('referente').setText(d.referente);
  form.getTextField('email').setText(d.email);
  form.getTextField('telefono').setText(d.telefono);
  form.getTextField('n_ambulatori').setText(d.rooms.toString());
  form.getTextField('n_medici').setText(d.doctors.toString());
  form.getTextField('versione_gipo').setText(d.bundle.toUpperCase());
  form.getTextField('crm_incluso').setText(d.crm ? 'Sì' : 'No');
  form.getTextField('tablet_firma').setText(d.tablet ? 'Sì' : 'No');
  form.getTextField('lettore_ts').setText(d.lettore ? 'Sì' : 'No');
  form.getTextField('moduli_aggiuntivi').setText(d.addons.map(a => `${a.name} (${a.qty})`).join(', '));

  form.getTextField('canone_listino').setText(d.canoneListino.toFixed(2));
  form.getTextField('setup_listino').setText(d.setupListino.toFixed(2));
  form.getTextField('totale_setup_listino').setText(d.totaleListino.toFixed(2));
  form.getTextField('canone_promozionale').setText(d.promoInclusa ? d.canoneBase.toFixed(2) : '-');
  form.getTextField('setup_scontato').setText(d.promoInclusa ? d.setupBase.toFixed(2) : '-');
  form.getTextField('totale_setup_reale').setText(d.promoInclusa ? d.totaleReale.toFixed(2) : '-');

  form.getTextField('sconti_attivi').setText(d.promoInclusa ? 'Promo attiva' : '–');
  form.getTextField('scadenza_offerta').setText(new Date(Date.now()+7*86400000).toLocaleDateString('it-IT'));
  form.getTextField('totale_preventivo_mensile').setText(d.canoneBase.toFixed(2));
  form.getTextField('note_aggiuntive').setText('-');
  form.getTextField('luogo').setText('Firma in sede');
  form.getTextField('data').setText(new Date().toLocaleDateString('it-IT'));
  form.getTextField('firma_referente').setText(d.referente);

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Preventivo_${d.nomeStruttura}.pdf`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// —————————————————————————————————————————————
// INIZIALIZZAZIONE
// —————————————————————————————————————————————
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('calculate-btn').addEventListener('click', calcolaPreventivo);
  document.getElementById('addon-btn').addEventListener('click', () => toggleModal('addon-modal', true));
  document.getElementById('close-addon').addEventListener('click', () => toggleModal('addon-modal', false));
  document.getElementById('check-btn').addEventListener('click', avviaVerifica);
  document.getElementById('generate-pdf-btn').addEventListener('click', () => toggleModal('pdf-modal', true));
  document.getElementById('annulla-pdf').addEventListener('click', () => toggleModal('pdf-modal', false));
  document.getElementById('conferma-pdf').addEventListener('click', confermaGenerazionePDF);
});
"""

with open("/mnt/data/script_nuovo.js", "w") as f:
    f.write(js_code)

"/mnt/data/script_nuovo.js"
