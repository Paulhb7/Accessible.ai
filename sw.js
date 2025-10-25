console.log("[SW] Service Worker chargé");

// Raccourci clavier pour Hello World
chrome.commands.onCommand.addListener(async (command) => {
  console.log("[SW] Commande reçue:", command);
  if (command !== "show_hello") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log("[SW] Onglet actif:", tab?.url);
  if (!tab?.id) return;

  try {
    // Envoyer le message Hello World au content script
    await chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_HELLO"
    });
  } catch (e) {
    console.error("Erreur:", e);
    
    // Si le content script n'est pas chargé, l'injecter
    if (String(e?.message).includes("Could not establish connection")) {
      try {
        await chrome.scripting.executeScript({ 
          target: { tabId: tab.id }, 
          files: ["content.js"] 
        });
        await new Promise(r => setTimeout(r, 200));
        
        // Réessayer après injection
        await chrome.tabs.sendMessage(tab.id, {
          type: "SHOW_HELLO"
        });
      } catch (injectionError) {
        console.error("Impossible d'injecter le script:", injectionError);
      }
    }
  }
});