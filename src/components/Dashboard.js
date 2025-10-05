import { speak } from '../utils/tts.js';

export default class Dashboard {
    constructor(userProfile) {
        this.container = null;
        this.userProfile = userProfile; // { language, userType, needs }

        // All user-facing strings for the dashboard
        this.strings = {
            'en-US': {
                welcome: 'Welcome',
                learnBraille: 'Learn Braille',
                learnSignLanguage: 'Learn Sign Language',
                brailleScanner: 'Braille to Speech Scanner',
                signTranslator: 'Sign Language to Speech',
            },
            'kn-IN': {
                welcome: 'ಸ್ವಾಗತ',
                learnBraille: 'ಬ್ರೈಲ್ ಕಲಿಯಿರಿ',
                learnSignLanguage: 'ಸಂಜ್ಞಾ ಭಾಷೆ ಕಲಿಯಿರಿ',
                brailleScanner: 'ಬ್ರೈಲ್ ಟು ಸ್ಪೀಚ್ ಸ್ಕ್ಯಾನರ್',
                signTranslator: 'ಸಂಜ್ಞಾ ಭಾಷಾ ಅನುವಾದಕ',
            },
        };
    }

    // Renders the dashboard based on user needs
    render(container) {
        this.container = container;
        const s = this.strings[this.userProfile.language];
        
        let cards = '';
        
        // Dynamically create cards based on the user's selected needs
        if (this.userProfile.needs.includes('blind')) {
            cards += this.createCard('learn-braille', s.learnBraille, '📖');
            cards += this.createCard('braille-scanner', s.brailleScanner, '📷');
        }
        if (this.userProfile.needs.includes('deaf') || this.userProfile.needs.includes('mute')) {
            cards += this.createCard('learn-sign', s.learnSignLanguage, '👋');
            cards += this.createCard('sign-translator', s.signTranslator, '🗣️');
        }
        // Handle the case for a loved one, who gets sign language tools
        if (this.userProfile.userType === 'other') {
             cards += this.createCard('learn-sign', s.learnSignLanguage, '👋');
             cards += this.createCard('sign-translator', s.signTranslator, '🗣️');
        }

        const content = `
            <div class="screen">
                <div class="screen__content">
                    <h1 class="screen__title">${s.welcome}</h1>
                    <div class="dashboard__grid">
                        ${cards}
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = content;
        this.addEventListeners();

        // Speak the welcome message
        speak(s.welcome, this.userProfile.language);
    }

    // Helper function to create the HTML for a dashboard card
    createCard(id, title, icon) {
        return `
            <button class="button button--card" data-action="navigate" data-target="${id}">
                <span class="button__icon">${icon}</span>
                <span class="button__text">${title}</span>
            </button>
        `;
    }

    // Adds event listeners for the dashboard cards
    addEventListeners() {
        this.container.querySelectorAll('[data-action="navigate"]').forEach(element => {
            element.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.target;
                const buttonText = e.currentTarget.querySelector('.button__text').textContent;
                
                // Speak the card title on click
                speak(buttonText, this.userProfile.language);
                
                console.log(`Maps to: ${target}`);
                // In a real app, this would trigger a navigation to the specific tool/module
            });
        });
    }
}