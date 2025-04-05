document.addEventListener("DOMContentLoaded", function () {
  const calcolaBtn = document.getElementById("calcola");
  const scontoPanel = document.getElementById("sconto-panel");
  const listinoFinale = document.getElementById("listino-finale");
  const promoFinale = document.getElementById("promo-finale");
  const promoLoader = document.querySelector(".promo-loader");

  calcolaBtn.addEventListener("click", function () {
    // Leggi i valori
    const rooms = parseInt(document.getElementById("rooms").value) || 0;
    const doctors = parseInt(document.getElementById("doctors").value) || 0;
    const bundle = document.getElementById("bundle").value;
    const crm = document.getElementById("crm").checked;
    const tablet = document.getElementById("tablet").checked;
    const ts = document.getElementById("ts").checked;

    // Calcolo base listino
    let listino = 0;
    if (bundle === "start") listino = 149;
    if (bundle === "plus") listino = 189;
    if (bundle === "top") listino = 219;

    // Extra
    if (doctors > 5) listino += (doctors - 5) * 10;
    if (crm) listino += 20;

    // Simula verifica con delay
    scontoPanel.style.display = "block";
    promoLoader.style.display = "flex";
    listinoFinale.textContent = "€" + listino;
    promoFinale.textContent = "—";

    setTimeout(() => {
      // Calcolo promozione
      const promo = (listino * 0.85).toFixed(2);
      promoFinale.textContent = "€" + promo;
      promoLoader.style.display = "none";
    }, 2000);
  });

  // Firma
  const firmaBtn = document.querySelector(".firma-btn");
  firmaBtn.addEventListener("click", function () {
    alert("Apertura DocuSign per firma contratto...");
    // window.open("https://docusign.com/tuo-contratto", "_blank");
  });
});
