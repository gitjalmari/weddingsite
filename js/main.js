const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzq0pskDMetOCI9bPUecwrmie8JF_zq3EIfTNv82Xb5WYpbaP5FJZkkIpVV-JRUv-Ig/exec";
const FORM_SECRET = "80714c7c4bcd25b9ac32ba17eb8d90c4a8aa004d59aea53d"; // Senkin nörtti, riski hyväksytty.

const form = document.getElementById("rsvp-form");
const statusEl = document.getElementById("form-status");
const partyDetailsGroup = document.getElementById("party-details-group");
const partyHint = document.getElementById("party-hint");
const attendanceDetails = document.getElementById("attendance-details");

function updateAttendanceVisibility() {
  const selected = document.querySelector('input[name="attendance"]:checked');
  const isAttending = selected?.value === "Kyllä, osallistun";
  if (attendanceDetails) attendanceDetails.hidden = !isAttending;
}

function updatePartyVisibility() {
  const selected = document.querySelector('input[name="party"]:checked');
  const isSeurue = selected?.value === "seurue";
  if (partyDetailsGroup) partyDetailsGroup.hidden = !isSeurue;
  if (partyHint) partyHint.hidden = !isSeurue;
}

document.querySelectorAll('input[name="attendance"]').forEach((radio) => {
  radio.addEventListener("change", updateAttendanceVisibility);
});

document.querySelectorAll('input[name="party"]').forEach((radio) => {
  radio.addEventListener("change", updatePartyVisibility);
});

updateAttendanceVisibility();
updatePartyVisibility();

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Lähetetään...";
    statusEl.className = "form-status";
    statusEl.textContent = "";

    const formData = new FormData(form);
    const name = formData.get("name").trim();
    const attendance = formData.get("attendance");

    if (!name) {
      statusEl.className = "form-status error";
      statusEl.textContent = "Täytä nimesi ennen lähettämistä.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Lähetä ilmoittautuminen";
      return;
    }

    if (!attendance) {
      statusEl.className = "form-status error";
      statusEl.textContent = "Valitse osallistuminen ennen lähettämistä.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Lähetä ilmoittautuminen";
      return;
    }

    const data = {
      secret: FORM_SECRET,
      name,
      attendance,
      dietary: formData.get("dietary"),
      party_details: formData.get("party") === "seurue" ? formData.get("party_details") : "",
      song: formData.get("song"),
    };

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        form.reset();
        partyDetailsGroup.hidden = true;
        if (partyHint) partyHint.hidden = true;
        form.style.display = "none";
        statusEl.className = "form-status success";
        statusEl.textContent = "Kiitos ilmoittautumisestasi!";
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
