(async () => {
    // Déterminer le mode d'exécution (défini par le service worker)
    const mode = window.__accessibleMode || "question"; // "summarize" ou "question"
    
    // Éviter les exécutions multiples simultanées
    if (window.__accessibleExtensionRunning) {
      console.log("Interface already open");
      return;
    }
    window.__accessibleExtensionRunning = true;
    
    // Fonction pour créer un overlay avec flou et voile blanc
    function createOverlay() {
      let overlay = document.getElementById("accessible-overlay");
      if (overlay) return overlay;
      
      overlay = document.createElement("div");
      overlay.id = "accessible-overlay";
      Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)", // Pour Safari
        zIndex: 2147483646, // Juste en dessous des interfaces
        pointerEvents: "none"
      });
      
      document.body.appendChild(overlay);
      return overlay;
    }
    
    function removeOverlay() {
      const overlay = document.getElementById("accessible-overlay");
      if (overlay) overlay.remove();
    }
    
    // Fonctions pour gérer le spinner
    function showSpinner() {
      let spinner = document.getElementById("lm-spinner");
      if (spinner) return spinner;
      
      spinner = document.createElement("div");
      spinner.id = "lm-spinner";
      spinner.setAttribute("role", "status");
      spinner.setAttribute("aria-label", "Processing");
      Object.assign(spinner.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2147483647,
        background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
        color: "#1E3A5F",
        padding: "20px 30px",
        borderRadius: "12px",
        border: "2px solid rgba(30, 58, 95, 0.3)",
        boxShadow: "0 8px 32px rgba(91, 155, 213, 0.3)",
        fontFamily: "Arial, Helvetica, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px"
      });
      
      spinner.innerHTML = `
        <div style="margin-bottom:8px;text-align:center">
          <div style="font-size:20px;font-weight:600;color:#1E3A5F;margin-bottom:4px">Accessible 🧠🌍</div>
          <div style="font-size:11px;color:#4A90E2;font-style:italic">Making the web inclusive and accessible with ai agents</div>
        </div>
        <div style="width: 40px; height: 40px; border: 3px solid rgba(75, 144, 226, 0.2); border-top-color: #4A90E2; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <div style="font-size: 14px; color: #1E3A5F">Processing...</div>
      `;
      
      // Ajouter l'animation
      const style = document.createElement("style");
      style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
      
      // Ajouter l'overlay avec flou
      createOverlay();
      
      document.body.appendChild(spinner);
      return spinner;
    }
    
    function hideSpinner() {
      const spinner = document.getElementById("lm-spinner");
      if (spinner) spinner.remove();
      // Retirer l'overlay seulement si aucune autre interface n'est ouverte
      const hasOtherInterface = document.getElementById("question-dialog") || 
                                 document.getElementById("answer-dialog") ||
                                 document.getElementById("question-confirmation-dialog");
      if (!hasOtherInterface) {
        removeOverlay();
      }
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
        console.warn("TTS unavailable:", e);
        alert("Text-to-speech is not available in your browser.");
      }
    }
    
    // Fonction pour le speech-to-text
    function startSpeechRecognition(callback) {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech recognition is not available in your browser.");
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
        console.log("🎤 Listening...");
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("✅ Transcription:", transcript);
        callback(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error("❌ Recognition error:", event.error);
        alert("Speech recognition error: " + event.error);
        hideSpinner();
        // Réinitialiser le flag si on est en mode voice_question
        if (window.__accessibleMode === "voice_question") {
          window.__accessibleExtensionRunning = false;
        }
      };
      
      recognition.onend = () => {
        console.log("🎤 Recognition completed");
      };
      
      recognition.start();
    }
    
    // Afficher l'interface de choix de méthode
    function showQuestionInterface() {
      return new Promise((resolve) => {
        const questionDiv = document.createElement("div");
        questionDiv.setAttribute("role", "dialog");
        questionDiv.setAttribute("aria-label", "Ask a question");
        questionDiv.id = "question-dialog";
        Object.assign(questionDiv.style, {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2147483647,
          background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
          color: "#1E3A5F",
          padding: "24px",
          borderRadius: "12px",
          border: "2px solid rgba(30, 58, 95, 0.3)",
          boxShadow: "0 8px 32px rgba(91, 155, 213, 0.3)",
          fontFamily: "Arial, Helvetica, sans-serif",
          minWidth: "550px",
          maxWidth: "800px"
        });
        
        questionDiv.innerHTML = `
          <div style="margin-bottom:16px;text-align:center;border-bottom:1px solid rgba(74, 144, 226, 0.2);padding-bottom:12px">
            <div style="font-size:22px;font-weight:600;color:#1E3A5F;margin-bottom:4px">Accessible 🧠🌍</div>
            <div style="font-size:11px;color:#4A90E2;font-style:italic">Making the web inclusive and accessible with ai agents</div>
          </div>
          <div style="margin:0 0 16px;font-size:18px;color:#1E3A5F;font-weight:600">How would you like to ask your question?</div>
          <input id="question-input" type="text" placeholder="Type your question here..." 
            style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #90C4E8;border-radius:6px;font-size:14px;background:#FFFFFF;color:#1E3A5F;font-family:Arial, Helvetica, sans-serif" />
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button id="question-voice" style="padding:10px 16px;background:#4A90E2;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-family:Arial, Helvetica, sans-serif;transition:background 0.2s">
              🎤 Voice Question
            </button>
            <button id="question-text" style="padding:10px 16px;background:#5B9BD5;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-family:Arial, Helvetica, sans-serif;transition:background 0.2s">
              ✏️ Send
            </button>
          </div>
        `;
        
        // Ajouter l'overlay avec flou
        createOverlay();
        
        document.body.appendChild(questionDiv);
        
        const input = questionDiv.querySelector("#question-input");
        input.focus();
        
        // Bouton Envoyer
        questionDiv.querySelector("#question-text").addEventListener("click", () => {
          const question = input.value.trim();
          if (question) {
            questionDiv.remove();
            removeOverlay();
            resolve(question);
          }
        });
        
        // Entrée pour envoyer
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter" && input.value.trim()) {
            questionDiv.remove();
            removeOverlay();
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
            removeOverlay();
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
        questionDiv.setAttribute("aria-label", "Dictated question");
        questionDiv.id = "question-confirmation-dialog";
        Object.assign(questionDiv.style, {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2147483647,
          background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
          color: "#1E3A5F",
          padding: "24px",
          borderRadius: "12px",
          border: "2px solid rgba(30, 58, 95, 0.3)",
          boxShadow: "0 8px 32px rgba(91, 155, 213, 0.3)",
          fontFamily: "Arial, Helvetica, sans-serif",
          minWidth: "550px",
          maxWidth: "800px"
        });
        
        questionDiv.innerHTML = `
          <div style="margin-bottom:16px;text-align:center;border-bottom:1px solid rgba(74, 144, 226, 0.2);padding-bottom:12px">
            <div style="font-size:22px;font-weight:600;color:#1E3A5F;margin-bottom:4px">Accessible 🧠🌍</div>
            <div style="font-size:11px;color:#4A90E2;font-style:italic">Making the web inclusive and accessible with ai agents</div>
          </div>
          <div style="margin:0 0 16px;font-size:18px;color:#1E3A5F;font-weight:600">Dictated Question</div>
          <div id="question-display" style="padding:12px;margin-bottom:16px;border-radius:6px;background:#FFFFFF;border:1px solid #90C4E8;color:#1E3A5F;min-height:60px;white-space:pre-wrap;line-height:1.5;font-family:Arial, Helvetica, sans-serif">${question}</div>
          <div style="display:flex;gap:8px;justify-content:center;align-items:center">
            <div style="font-size:14px;color:#4A90E2;font-family:Arial, Helvetica, sans-serif">Sending...</div>
          </div>
        `;
        
        // Ajouter l'overlay avec flou
        createOverlay();
        
        document.body.appendChild(questionDiv);
        
        // Annoncer l'envoi et envoyer automatiquement après un court délai
        speak("Sending your question to the AI");
        
        // Attendre que le message vocal se termine, puis envoyer
        setTimeout(async () => {
          // Attendre que le message vocal soit terminé (environ 2-3 secondes pour "Sending your question to the AI")
          await new Promise(resolve => setTimeout(resolve, 2500));
          
          // Retirer l'interface après l'envoi
          questionDiv.remove();
          removeOverlay();
          resolve(question);
        }, 100);
      });
    }

    // Function to display an answer (used for summary and questions)
    function showAnswer(answer, title = "Answer") {
      hideSpinner();
      console.log("✅ " + title + ":\n\n" + answer);
      
      // Afficher la réponse dans une boîte de dialogue
      const answerDiv = document.createElement("div");
      answerDiv.setAttribute("role", "dialog");
      answerDiv.setAttribute("aria-label", title);
      answerDiv.id = "answer-dialog";
      Object.assign(answerDiv.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2147483647,
        background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
        color: "#1E3A5F",
        padding: "20px",
        borderRadius: "12px",
        border: "2px solid rgba(30, 58, 95, 0.3)",
        boxShadow: "0 8px 32px rgba(91, 155, 213, 0.3)",
        fontFamily: "Arial, Helvetica, sans-serif",
        minWidth: "550px",
        maxWidth: "800px",
        maxHeight: "70vh",
        overflow: "auto",
        lineHeight: "1.6"
      });
      
      // Title is already in English
      const englishTitle = title;
      
      answerDiv.innerHTML = `
        <div style="margin-bottom:16px;text-align:center;border-bottom:1px solid rgba(74, 144, 226, 0.2);padding-bottom:12px">
          <div style="font-size:22px;font-weight:600;color:#1E3A5F;margin-bottom:4px">Accessible 🧠🌍</div>
          <div style="font-size:11px;color:#4A90E2;font-style:italic">Making the web inclusive and accessible with ai agents</div>
        </div>
        <div style="margin:0 0 12px;font-size:18px;color:#1E3A5F;font-weight:600">${englishTitle}</div>
        <div id="answer-content" style="white-space:pre-wrap;margin-bottom:12px;color:#1E3A5F;font-family:Arial, Helvetica, sans-serif;background:#FFFFFF;padding:12px;border-radius:6px;border:1px solid #90C4E8">${answer}</div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="answer-read" style="padding:8px 16px;background:#4A90E2;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:Arial, Helvetica, sans-serif;transition:background 0.2s">🔊 Read</button>
          <button id="answer-close" style="padding:8px 16px;background:#6BA3D6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:Arial, Helvetica, sans-serif;transition:background 0.2s">Close</button>
        </div>
      `;
      
      // Ajouter l'overlay avec flou
      createOverlay();
      
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
        removeOverlay();
        window.__accessibleExtensionRunning = false;
      });
      
      // Fermer avec Échap
      const handleEscape = (e) => {
        if (e.key === "Escape" && answerDiv.isConnected) {
          speechSynthesis.cancel(); // Arrêter la lecture si elle est en cours
          answerDiv.remove();
          removeOverlay();
          document.removeEventListener("keydown", handleEscape);
          window.__accessibleExtensionRunning = false;
        }
      };
      document.addEventListener("keydown", handleEscape);
      
      // Lecture automatique pour les aveugles (mode summarize et voice_question)
      // Attendre un peu que la boîte soit rendue avant de lire
      if (mode === "summarize" || mode === "voice_question") {
        setTimeout(() => {
          const answerText = answerDiv.querySelector("#answer-content").textContent;
          speak(answerText);
        }, 100);
      }
    }

    // Fonction pour traiter avec l'API LanguageModel
    async function processWithLanguageModel(content, prompt, title = "Answer") {
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
        console.error("🚫 Model unavailable (check RAM/disk space/Chrome 138+).");
        alert("🚫 Model unavailable (check RAM/disk space/Chrome 138+).");
        window.__accessibleExtensionRunning = false;
        return;
      }

      // 5) create() avec LES MÊMES OPTIONS + suivi du téléchargement
      const session = await LanguageModel.create({
        expectedInputs,
        expectedOutputs,
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            console.log(`⬇️ Model download: ${(e.loaded * 100).toFixed(1)}%`);
          });
        },
      });

      console.log("💡 Processing response...");
      try {
        const answer = await session.prompt(prompt);
        showAnswer(answer, title);
    } catch (error) {
      hideSpinner();
      console.error("❌ Error during processing:", error);
      alert("❌ Error during processing: " + error.message);
        window.__accessibleExtensionRunning = false;
      }
    }

    // 1) Détection de l'API
    if (!('LanguageModel' in self)) {
      console.error("❌ Prompt API not available (Chrome 138+ required, desktop).");
      alert("❌ Prompt API not available (Chrome 138+ required, desktop).");
      window.__accessibleExtensionRunning = false;
      return;
    }

    // 2) Récupération du contenu (priorité à la sélection)
    const selected = (window.getSelection && window.getSelection().toString()) || "";
    const pageText = selected.trim() || document.body.innerText || "";
    if (!pageText) {
      console.warn("ℹ️ No text detected on this page.");
      alert("ℹ️ No text detected on this page.");
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
You are an assistant that summarizes the provided content in a concise and clear manner.
Create a structured summary that captures the main points.
IMPORTANT: Do not use markdown formatting in your response. Respond only with plain text, without using markdown symbols (**, *, #, etc.).
      `.trim();

      const promptText = `
[System]
${systemInstr}

[Page content]
${content}

[Instruction]
Provide a clear and structured summary of this page content.
      `.trim();

      await processWithLanguageModel(content, promptText, "Page Summary");
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
You are an assistant that responds STRICTLY from the provided content.
If the information is not present, respond "I don't know from this page."
When citing, use the format 'here is a quote from the page' instead of quotation marks. Include 1-2 short citations when possible.
IMPORTANT: Do not use markdown formatting in your response. Respond only with plain text, without using markdown symbols (**, *, #, etc.).
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

        await processWithLanguageModel(content, promptText, "Answer");
        // Nettoyer le mode après exécution
        window.__accessibleMode = undefined;
      });
    } else {
      // Mode interface de question (pour dyslexiques/TDAH)
      const question = await showQuestionInterface();
      if (!question) { 
        console.log("Operation cancelled."); 
        window.__accessibleExtensionRunning = false;
        return; 
      }

      const systemInstr = `
You are an assistant that responds STRICTLY from the provided content.
If the information is not present, respond "I don't know from this page."
When citing, use the format 'here is a quote from the page' instead of quotation marks. Include 1-2 short citations when possible.
IMPORTANT: Do not use markdown formatting in your response. Respond only with plain text, without using markdown symbols (**, *, #, etc.).
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
