# Eyes on Web - Extension Chrome d'Accessibilité

Une extension Chrome simple qui permet d'afficher un message "Hello World" et de le lire à voix haute via un raccourci clavier, conçue pour améliorer l'accessibilité web.

## Fonctionnalités

- **Raccourci clavier** : `Alt+Shift+H` pour déclencher l'action
- **Affichage visuel** : Panneau flottant avec le message "Hello World"
- **Synthèse vocale** : Lecture automatique du texte en français
- **Interface accessible** : Compatible avec les lecteurs d'écran
- **Contrôles intuitifs** : Boutons pour lire et fermer le panneau

## Installation

### Installation manuelle

1. Téléchargez ou clonez ce repository
2. Ouvrez Chrome et allez dans `chrome://extensions/`
3. Activez le "Mode développeur" (en haut à droite)
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier contenant les fichiers de l'extension

### Structure des fichiers

```
eyes_on_web/
├── manifest.json    # Configuration de l'extension
├── content.js       # Script de contenu (interface utilisateur)
├── sw.js           # Service Worker (gestion des raccourcis)
└── README.md       # Ce fichier
```

## Utilisation

1. Une fois l'extension installée, naviguez sur n'importe quelle page web
2. Appuyez sur `Alt+Shift+H` pour déclencher l'action
3. Un panneau "Hello World" apparaîtra en bas à droite de la page
4. Le texte sera automatiquement lu à voix haute
5. Utilisez les boutons "Lire" ou "Fermer" pour contrôler le panneau
6. Appuyez sur `Échap` pour fermer le panneau et arrêter la lecture

## Développement

### Permissions requises

- `activeTab` : Accès à l'onglet actif
- `scripting` : Injection de scripts dans les pages

### Architecture

- **Service Worker** (`sw.js`) : Gère les raccourcis clavier et la communication avec les onglets
- **Content Script** (`content.js`) : Crée l'interface utilisateur et gère la synthèse vocale
- **Manifest V3** : Configuration moderne de l'extension

## Personnalisation

Pour modifier le message affiché, éditez la ligne 84 dans `content.js` :

```javascript
el.querySelector("#pc-summary").textContent = "Votre message personnalisé";
```

Pour changer le raccourci clavier, modifiez le fichier `manifest.json` :

```json
"commands": {
  "show_hello": {
    "suggested_key": { "default": "Ctrl+Shift+H" },
    "description": "Votre description"
  }
}
```

## Compatibilité

- Chrome (Manifest V3)
- Navigateurs basés sur Chromium (Edge, Brave, etc.)
- Fonctionne sur toutes les pages web

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Signaler des bugs
2. Proposer de nouvelles fonctionnalités
3. Améliorer l'accessibilité
4. Optimiser les performances

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Version

Version actuelle : 0.1.0

---

*Développé pour améliorer l'accessibilité web et faciliter l'interaction avec le contenu en ligne.*
