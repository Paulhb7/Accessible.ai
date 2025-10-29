// Service Worker pour l'extension Accessible
chrome.commands.onCommand.addListener((command) => {
  // Récupérer l'onglet actif
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      return;
    }
    
    const tab = tabs[0];
    
    // Vérifier l'URL si disponible (peut ne pas être accessible pour les pages système)
    if (tab.url) {
      const url = tab.url;
      // Vérifier si l'URL est accessible (exclure chrome://, about:, etc.)
      if (url.startsWith("chrome://") || 
          url.startsWith("chrome-extension://") || 
          url.startsWith("edge://") ||
          url.startsWith("about:") ||
          url.startsWith("moz-extension://") ||
          url.startsWith("opera://")) {
        // Afficher une notification pour informer l'utilisateur
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "Accessible",
          message: "Cette extension ne peut pas être utilisée sur les pages système (chrome://, about:, etc.). Veuillez naviguer sur une page web classique."
        });
        return;
      }
    }
    
    let mode = "question"; // Mode par défaut
    
    if (command === "summarize_page") {
      mode = "summarize";
    } else if (command === "voice_question_blind") {
      mode = "voice_question";
    } else if (command === "show_question_interface") {
      mode = "question";
    }
    
    // Injecter d'abord la variable de mode, puis le script
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (modeValue) => {
        window.__accessibleMode = modeValue;
      },
      args: [mode]
    }).then(() => {
      // Puis injecter le script principal
      return chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["accessible.js"]
      });
    }).catch((error) => {
      // Vérifier si l'erreur est liée à une URL non accessible
      const isRestrictedUrl = error.message && (
        error.message.includes("chrome://") ||
        error.message.includes("Cannot access") ||
        error.message.includes("chrome-extension://")
      );
      
      // Ne logger l'erreur que si ce n'est pas une URL restreinte
      if (!isRestrictedUrl) {
        console.error("Erreur lors de l'injection du script:", error);
      }
      
      // Afficher une notification dans tous les cas
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Accessible",
        message: "Cette extension ne peut pas être utilisée sur cette page. Veuillez naviguer sur une page web classique (http:// ou https://)."
      });
    });
  });
});

// Gestion de l'installation pour afficher un message d'accueil
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Accessible installée.");
  console.log("Raccourcis disponibles:");
  console.log("- Alt+Shift+H (Cmd+Shift+H sur Mac) : Résumer la page (pour les aveugles)");
  console.log("- Alt+Shift+Q (Cmd+Shift+Q sur Mac) : Question orale (pour les aveugles)");
  console.log("- Alt+Shift+A (Cmd+Shift+A sur Mac) : Interface de question (pour dyslexiques/TDAH)");
});

