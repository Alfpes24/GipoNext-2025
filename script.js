document.addEventListener("DOMContentLoaded", function () {
  const calcolaBtn = document.getElementById("calcola");
  const scontoPanel = document.getElementById("sconto-panel");
  const listinoFinale = document.getElementById("listino-finale");
  const promoFinale = document.getElementById("promo-finale");

  calcolaBtn.addEventListener("click", function () {
    const rooms = parseInt(document.getElementById("rooms").value) || 0;
    const doctors = parseInt(document.getElementById("doctors").value) || 0;
    const bundle = document.getElementById("bundle").value;
    const crm = document.getElementById("crm").checked;
    const tablet = document.getElementById("tablet").checked;
    const ts = document.getElementById("ts").checked;

    let listino = 0;
    if (bundle === "start") listino = 149;
    if (bundle === "plus") listino = 189;
    if (bundle === "top") listino = 219;

    if (doctors > 5) listino += (doctors - 5) * 10;
    if (crm) listino += 20;

    const promo = (listino * 0.85).toFixed(2);

    listinoFinale.textContent = "€" + listino;
    promoFinale.textContent = "€" + promo;

    scontoPanel.style.display = "block";
  });
});
