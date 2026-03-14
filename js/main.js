// RSVP form handler
// Replace FORMSPREE_ENDPOINT with your actual Formspree form ID
// e.g. "https://formspree.io/f/abcdefgh"
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

const form = document.getElementById("rsvp-form");
const statusEl = document.getElementById("form-status");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Lähetetään...";
    statusEl.className = "form-status";
    statusEl.textContent = "";

    const data = new FormData(form);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        form.style.display = "none";
        statusEl.className = "form-status success";
        statusEl.textContent =
          "Kiitos ilmoittautumisestasi! Nähdään häissä.";
      } else {
        throw new Error("Palvelinvirhe");
      }
    } catch {
      statusEl.className = "form-status error";
      statusEl.textContent =
        "Ilmoittautuminen epäonnistui. Yritä uudelleen tai ota yhteyttä sähköpostitse.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Lähetä ilmoittautuminen";
    }
  });
}
