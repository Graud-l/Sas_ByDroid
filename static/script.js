class BackgroundManager {
    constructor() {
        this.bgOptions = document.querySelectorAll('.bg-option');
        this.init();
    }

    init() {
        this.loadSavedBackground();
        this.setupEventListeners();
    }

    loadSavedBackground() {
        const savedBg = localStorage.getItem('background') || 'default';
        this.setBackground(savedBg);
        this.setActiveButton(savedBg);
    }

    setupEventListeners() {
        this.bgOptions.forEach(option => {
            option.addEventListener('click', () => {
                const bgType = option.dataset.bg;
                this.setBackground(bgType);
                this.setActiveButton(bgType);
            });
        });
    }

    setBackground(type) {
        let bgValue;
        switch(type) {
            case 'tech': bgValue = 'var(--bg-tech)'; break;
            case 'nature': bgValue = 'var(--bg-nature)'; break;
            case 'abstract': bgValue = 'var(--bg-abstract)'; break;
            case 'space': bgValue = 'var(--bg-space)'; break;
            default: bgValue = 'var(--bg-default)';
        }
        
        document.documentElement.style.setProperty('--current-bg', bgValue);
        localStorage.setItem('background', type);
    }

    setActiveButton(bgType) {
        this.bgOptions.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.bg === bgType);
        });
    }
}

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.init();
    }

    init() {
        this.loadSavedTheme();
        this.setupEventListeners();
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 
                         (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    setupEventListeners() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
}

class ChatUI {
    constructor() {
        this.bgManager = new BackgroundManager();
        this.themeManager = new ThemeManager();
        this.chatContainer = document.getElementById('chat-container');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.addBotMessage("Bonjour ! Je suis Sas_Bydroid. Posez-moi une question technique ou pratique.");
    }

    setupEventListeners() {
        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
    }

    handleSend() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addUserMessage(message);
        this.userInput.value = '';
        this.showTypingIndicator();

        fetch("/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: message })
        })
        .then(response => response.json())
        .then(data => {
            this.removeTypingIndicator();
            this.addBotMessage(data.response);
        })
        .catch(error => {
            this.removeTypingIndicator();
            this.addBotMessage("Désolé, une erreur est survenue. Veuillez réessayer.");
            console.error("Error:", error);
        });
    }

    addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                ${text}
            </div>
        `;
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                ${text}
            </div>
        `;
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.chatContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatUI();
});

document.getElementById("send-btn").addEventListener("click", async () => {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) {
        alert("Veuillez entrer une question !");
        return;
    }

    const responseContainer = document.getElementById("chat-container");

    // Affiche la question de l'utilisateur
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = userInput;
    responseContainer.appendChild(userMessage);

    // Envoie la requête au serveur
    try {
        const response = await fetch("/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: userInput, lang: "fr" })
        });

        const data = await response.json();

        // Affiche la réponse du bot
        const botMessage = document.createElement("div");
        botMessage.className = "bot-message";
        botMessage.textContent = data.response || "Une erreur est survenue.";
        responseContainer.appendChild(botMessage);

    } catch (error) {
        console.error("Erreur lors de la communication avec le serveur :", error);
        const errorMessage = document.createElement("div");
        errorMessage.className = "bot-message";
        errorMessage.textContent = "Une erreur est survenue. Veuillez réessayer.";
        responseContainer.appendChild(errorMessage);
    }

    // Efface le champ de saisie
    document.getElementById("user-input").value = "";
});