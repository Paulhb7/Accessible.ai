console.log("[hello-world] content.js chargé");

// --- Panneau (dialog) pour afficher Hello World + TTS ---
function ensurePanel() {
  let el = document.getElementById("hw-popup");
  if (el) return el;

  el = document.createElement("div");
  el.id = "hw-popup";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-label", "Hello World");
  el.tabIndex = -1;

  Object.assign(el.style, {
    position: "fixed",
    right: "16px",
    bottom: "16px",
    zIndex: 2147483647,
    background: "#111",
    color: "#fff",
    padding: "12px 14px",
    borderRadius: "10px",
    boxShadow: "0 6px 20px rgba(0,0,0,.3)",
    fontFamily: "system-ui, sans-serif",
    maxWidth: "420px",
    maxHeight: "50vh",
    overflow: "auto",
    lineHeight: "1.4"
  });

  el.innerHTML = `
    <h2 id="pc-title" style="margin:0 0 8px;font-size:16px">Hello World</h2>
    <div id="pc-summary" style="white-space:pre-wrap">Hello World</div>
    <div style="margin-top:8px;display:flex;gap:8px">
      <button id="pc-read" style="padding:6px 10px">Lire</button>
      <button id="pc-close" style="padding:6px 10px">Fermer</button>
    </div>
  `;

  document.documentElement.appendChild(el);

  const summaryNode = el.querySelector("#pc-summary");
  const btnRead = el.querySelector("#pc-read");
  const btnClose = el.querySelector("#pc-close");

  btnRead.addEventListener("click", () => {
    speak(summaryNode.innerText || "Hello World");
  });

  btnClose.addEventListener("click", () => {
    speechSynthesis.cancel();
    el.remove();
  });

  // Échap pour fermer + stopper TTS
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && el.isConnected) {
      speechSynthesis.cancel();
      el.remove();
    }
  });

  return el;
}

function speak(text) {
  try {
    speechSynthesis.cancel(); // coupe toute lecture en cours
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 1.0;
    speechSynthesis.speak(u);
  } catch (e) {
    console.warn("TTS indisponible:", e);
  }
}

// --- Messages SW <-> content ---
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  // Mode Hello World
  if (msg?.type === "SHOW_HELLO") {
    const el = ensurePanel();
    el.querySelector("#pc-summary").textContent = "Hello World";
    el.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 150 });
    speak("Hello World");
  }
});