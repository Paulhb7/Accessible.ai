(async () => {
    // Déterminer le mode d'exécution (défini par le service worker)
    const mode = window.__accessibleMode || "question"; // "summarize" ou "question"
    
    // Éviter les exécutions multiples simultanées
    if (window.__accessibleExtensionRunning) {
      console.log("Interface déjà ouverte");
      return;
    }
    window.__accessibleExtensionRunning = true;
    
    // Fonctions pour gérer le spinner
    function showSpinner() {
      let spinner = document.getElementById("lm-spinner");
      if (spinner) return spinner;
      
      spinner = document.createElement("div");
      spinner.id = "lm-spinner";
      spinner.setAttribute("role", "status");
      spinner.setAttribute("aria-label", "Traitement en cours");
      Object.assign(spinner.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2147483647,
        background: "#111",
        color: "#fff",
        padding: "20px 30px",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,.4)",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px"
      });
      
      spinner.innerHTML = `
        <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <div style="font-size: 14px">Traitement en cours...</div>
      `;
      
      // Ajouter l'animation
      const style = document.createElement("style");
      style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
      
      document.body.appendChild(spinner);
      return spinner;
    }
    
    function hideSpinner() {
      const spinner = document.getElementById("lm-spinner");
      if (spinner) spinner.remove();
    }
    
    // Fonction pour le text-to-speech
    function speak(text) {
      try {
        speechSynthesis.cancel(); // Coupe toute lecture en cours
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("TTS indisponible:", e);
        alert("La lecture vocale n'est pas disponible sur votre navigateur.");
      }
    }
    
    // Fonction pour le speech-to-text
    function startSpeechRecognition(callback) {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("La reconnaissance vocale n'est pas disponible sur votre navigateur.");
        window.__accessibleExtensionRunning = false;
        return;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR"; // Français pour l'input utilisateur
      recognition.continuous = false;
      recognition.interimResults = false;
      // Même configuration pour tous les modes
      
      recognition.onstart = () => {
        console.log("🎤 Écoute en cours...");
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("✅ Transcription:", transcript);
        callback(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error("❌ Erreur de reconnaissance:", event.error);
        alert("Erreur de reconnaissance vocale: " + event.error);
        hideSpinner();
        // Réinitialiser le flag si on est en mode voice_question
        if (window.__accessibleMode === "voice_question") {
          window.__accessibleExtensionRunning = false;
        }
      };
      
      recognition.onend = () => {
        console.log("🎤 Reconnaissance terminée");
      };
      
      recognition.start();
    }
    
    // Afficher l'interface de choix de méthode
    function showQuestionInterface() {
      return new Promise((resolve) => {
        const questionDiv = document.createElement("div");
        questionDiv.setAttribute("role", "dialog");
        questionDiv.setAttribute("aria-label", "Poser une question");
        Object.assign(questionDiv.style, {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2147483647,
          background: "#111",
          color: "#fff",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,.4)",
          fontFamily: "system-ui, sans-serif",
          minWidth: "400px"
        });
        
        questionDiv.innerHTML = `
          <h3 style="margin:0 0 16px;font-size:18px">Comment souhaitez-vous poser votre question ?</h3>
          <input id="question-input" type="text" placeholder="Tapez votre question ici..." 
            style="width:100%;padding:10px;margin-bottom:12px;border:none;border-radius:6px;font-size:14px;background:#222;color:#fff" />
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button id="question-voice" style="padding:10px 16px;background:#2196F3;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">
              🎤 Question orale
            </button>
            <button id="question-text" style="padding:10px 16px;background:#4CAF50;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">
              ✏️ Envoyer
            </button>
          </div>
        `;
        
        document.body.appendChild(questionDiv);
        
        const input = questionDiv.querySelector("#question-input");
        input.focus();
        
        // Bouton Envoyer
        questionDiv.querySelector("#question-text").addEventListener("click", () => {
          const question = input.value.trim();
          if (question) {
            questionDiv.remove();
            resolve(question);
          }
        });
        
        // Entrée pour envoyer
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter" && input.value.trim()) {
            questionDiv.remove();
            resolve(input.value.trim());
          }
        });
        
        // Bouton Question orale
        questionDiv.querySelector("#question-voice").addEventListener("click", () => {
          const spinner = showSpinner();
          startSpeechRecognition((transcript) => {
            hideSpinner();
            input.value = transcript;
            input.focus();
          });
        });
        
        // Fermer avec Échap
        const handleEscape = (e) => {
          if (e.key === "Escape" && questionDiv.isConnected) {
            questionDiv.remove();
            document.removeEventListener("keydown", handleEscape);
            window.__accessibleExtensionRunning = false;
            resolve(null); // Résoudre avec null pour indiquer l'annulation
          }
        };
        document.addEventListener("keydown", handleEscape);
      });
    }

    // Fonction pour afficher la question dictée et l'envoyer automatiquement (pour les aveugles)
    function showQuestionAndAutoSend(question) {
      return new Promise((resolve) => {
        const questionDiv = document.createElement("div");
        questionDiv.setAttribute("role", "dialog");
        questionDiv.setAttribute("aria-label", "Question dictée");
        Object.assign(questionDiv.style, {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2147483647,
          background: "#111",
          color: "#fff",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,.4)",
          fontFamily: "system-ui, sans-serif",
          minWidth: "400px",
          maxWidth: "600px"
        });
        
        questionDiv.innerHTML = `
          <h3 style="margin:0 0 16px;font-size:18px">Question dictée</h3>
          <div id="question-display" style="padding:12px;margin-bottom:16px;border-radius:6px;background:#222;color:#fff;min-height:60px;white-space:pre-wrap;line-height:1.5">${question}</div>
          <div style="display:flex;gap:8px;justify-content:center;align-items:center">
            <div style="font-size:14px;color:#4CAF50">Envoi en cours...</div>
          </div>
        `;
        
        document.body.appendChild(questionDiv);
        
        // Annoncer l'envoi et envoyer automatiquement après un court délai
        speak("Sending your question to the AI");
        
        // Attendre que le message vocal se termine, puis envoyer
        setTimeout(async () => {
          // Attendre que le message vocal soit terminé (environ 2-3 secondes pour "Sending your question to the AI")
          await new Promise(resolve => setTimeout(resolve, 2500));
          
          // Retirer l'interface après l'envoi
          questionDiv.remove();
          resolve(question);
        }, 100);
      });
    }

    // Fonction pour afficher une réponse (utilisée pour le résumé et les questions)
    function showAnswer(answer, title = "Réponse") {
      hideSpinner();
      console.log("✅ " + title + ":\n\n" + answer);
      
      // Afficher la réponse dans une boîte de dialogue
      const answerDiv = document.createElement("div");
      answerDiv.setAttribute("role", "dialog");
      answerDiv.setAttribute("aria-label", title);
      Object.assign(answerDiv.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2147483647,
        background: "#111",
        color: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,.4)",
        fontFamily: "system-ui, sans-serif",
        maxWidth: "600px",
        maxHeight: "70vh",
        overflow: "auto",
        lineHeight: "1.6"
      });
      
      answerDiv.innerHTML = `
        <h3 style="margin:0 0 12px;font-size:18px">${title}</h3>
        <div id="answer-content" style="white-space:pre-wrap;margin-bottom:12px">${answer}</div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="answer-read" style="padding:8px 16px;background:#4CAF50;color:#fff;border:none;border-radius:6px;cursor:pointer">🔊 Lire</button>
          <button id="answer-close" style="padding:8px 16px;background:#333;color:#fff;border:none;border-radius:6px;cursor:pointer">Fermer</button>
        </div>
      `;
      
      document.body.appendChild(answerDiv);
      
      // Bouton Lire
      answerDiv.querySelector("#answer-read").addEventListener("click", () => {
        const answerText = answerDiv.querySelector("#answer-content").textContent;
        speak(answerText);
      });
      
      // Bouton Fermer
      answerDiv.querySelector("#answer-close").addEventListener("click", () => {
        speechSynthesis.cancel(); // Arrêter la lecture si elle est en cours
        answerDiv.remove();
        window.__accessibleExtensionRunning = false;
      });
      
      // Fermer avec Échap
      const handleEscape = (e) => {
        if (e.key === "Escape" && answerDiv.isConnected) {
          speechSynthesis.cancel(); // Arrêter la lecture si elle est en cours
          answerDiv.remove();
          document.removeEventListener("keydown", handleEscape);
          window.__accessibleExtensionRunning = false;
        }
      };
      document.addEventListener("keydown", handleEscape);
      
      // Lecture automatique pour les aveugles (mode summarize)
      // Attendre un peu que la boîte soit rendue avant de lire
      if (mode === "summarize") {
        setTimeout(() => {
          const answerText = answerDiv.querySelector("#answer-content").textContent;
          speak(answerText);
        }, 100);
      }
    }

    // Fonction pour traiter avec l'API LanguageModel
    async function processWithLanguageModel(content, prompt, title = "Réponse") {
      // ⚠️ Langues supportées par la Prompt API (aujourd'hui) :
      const expectedInputs  = [{ type: "text", languages: ["en"] }]; // pas "fr" ici
      const expectedOutputs = [{ type: "text", languages: ["en"] }]; // sortie en anglais

      // Afficher le spinner pendant le traitement
      const spinner = showSpinner();

      // 4) availability() avec LES MÊMES OPTIONS
      const availability = await LanguageModel.availability({ expectedInputs, expectedOutputs });
      console.log("availability():", availability);
      if (availability === "unavailable") {
        hideSpinner();
        console.error("🚫 Modèle indisponible (vérifie RAM/espace disque/Chrome 138+).");
        alert("🚫 Modèle indisponible (vérifie RAM/espace disque/Chrome 138+).");
        window.__accessibleExtensionRunning = false;
        return;
      }

      // 5) create() avec LES MÊMES OPTIONS + suivi du téléchargement
      const session = await LanguageModel.create({
        expectedInputs,
        expectedOutputs,
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            console.log(`⬇️ Téléchargement du modèle : ${(e.loaded * 100).toFixed(1)}%`);
          });
        },
      });

      console.log("💡 Réponse en cours…");
      try {
        const answer = await session.prompt(prompt);
        showAnswer(answer, title);
      } catch (error) {
        hideSpinner();
        console.error("❌ Erreur lors du traitement:", error);
        alert("❌ Erreur lors du traitement: " + error.message);
        window.__accessibleExtensionRunning = false;
      }
    }

    // 1) Détection de l'API
    if (!('LanguageModel' in self)) {
      console.error("❌ Prompt API non disponible (Chrome 138+ requis, desktop).");
      alert("❌ Prompt API non disponible (Chrome 138+ requis, desktop).");
      window.__accessibleExtensionRunning = false;
      return;
    }

    // 2) Récupération du contenu (priorité à la sélection)
    const selected = (window.getSelection && window.getSelection().toString()) || "";
    const pageText = selected.trim() || document.body.innerText || "";
    if (!pageText) {
      console.warn("ℹ️ Aucun texte détecté sur cette page.");
      alert("ℹ️ Aucun texte détecté sur cette page.");
      window.__accessibleExtensionRunning = false;
      return;
    }

    const MAX_CHARS = 60_000;
    const content = pageText.slice(0, MAX_CHARS);

    // 3) Exécution selon le mode
    if (mode === "summarize") {
      // Mode résumé direct pour les aveugles
      // Annoncer le début de l'analyse
      speak("Launching Page Analysis");
      
      // Attendre un peu pour que le message vocal se termine
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const systemInstr = `
Tu es un assistant qui résume le contenu fourni de manière concise et claire.
Crée un résumé structuré qui capture les points principaux.
Réponds en anglais (output language).
      `.trim();

      const promptText = `
[System]
${systemInstr}

[Page content]
${content}

[Instruction]
Provide a clear and structured summary of this page content.
      `.trim();

      await processWithLanguageModel(content, promptText, "Résumé de la page");
      // Nettoyer le mode après exécution
      window.__accessibleMode = undefined;
    } else if (mode === "voice_question") {
      // Mode question orale pour les aveugles
      // S'assurer qu'aucune lecture vocale n'est en cours avant de commencer
      speechSynthesis.cancel();
      
      // Petite pause pour s'assurer que le TTS est complètement arrêté
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const spinner = showSpinner();
      
      // Démarrer la reconnaissance vocale (identique à l'interface dys)
      startSpeechRecognition(async (transcript) => {
        hideSpinner();
        
        if (!transcript || !transcript.trim()) {
          window.__accessibleExtensionRunning = false;
          return;
        }
        
        const question = transcript.trim();
        
        // Afficher la question dictée et envoyer automatiquement
        const confirmedQuestion = await showQuestionAndAutoSend(question);
        
        const systemInstr = `
Tu es un assistant qui répond STRICTEMENT à partir du contenu fourni.
Si l'information n'est pas présente, réponds "I don't know from this page."
Cite 1–2 courtes citations entre " … " quand c'est possible.
Réponds en anglais (output language).
        `.trim();

        const promptText = `
[System]
${systemInstr}

[Page content]
${content}

[User question]
${confirmedQuestion}

[Instruction]
Answer ONLY using the page content above.
        `.trim();

        await processWithLanguageModel(content, promptText, "Réponse");
        // Nettoyer le mode après exécution
        window.__accessibleMode = undefined;
      });
    } else {
      // Mode interface de question (pour dyslexiques/TDAH)
      const question = await showQuestionInterface();
      if (!question) { 
        console.log("Opération annulée."); 
        window.__accessibleExtensionRunning = false;
        return; 
      }

      const systemInstr = `
Tu es un assistant qui répond STRICTEMENT à partir du contenu fourni.
Si l'information n'est pas présente, réponds "I don't know from this page."
Cite 1–2 courtes citations entre " … " quand c'est possible.
Réponds en anglais (output language).
      `.trim();

      const promptText = `
[System]
${systemInstr}

[Page content]
${content}

[User question]
${question}

[Instruction]
Answer ONLY using the page content above.
      `.trim();

      await processWithLanguageModel(content, promptText, "Réponse");
      // Nettoyer le mode après exécution
      window.__accessibleMode = undefined;
    }
  })();
