import { speak } from '../utils/tts.js';

export default class Onboarding {
    constructor(onComplete) {
        this.container = null;
        this.onComplete = onComplete; // Callback function for when onboarding finishes
        this.currentStep = 'language'; // 'language', 'userType', 'needs'
        
        // State for user selections
        this.state = {
            language: 'en-US',
            userType: null,
            needs: [],
        };

        // All user-facing strings for easy translation
        this.strings = {
            'en-US': {
                chooseLanguage: 'Choose your Language',
                english: 'English',
                kannada: 'Kannada',
                whoAreYou: 'Who are you learning for?',
                forYourself: 'For myself',
                forLovedOne: 'For a loved one',
                selectNeeds: 'Select your accessibility needs',
                blind: 'Blind',
                blindDesc: 'Voice & Braille learning support',
                mute: 'Mute',
                muteDesc: 'Speech assistance and sign language',
                deaf: 'Deaf',
                deafDesc: 'Sign language and visual support',
                continue: 'Continue',
            },
            'kn-IN': {
                chooseLanguage: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆರಿಸಿ',
                english: 'ಆಂಗ್ಲ',
                kannada: 'ಕನ್ನಡ',
                whoAreYou: 'ನೀವು ಯಾರಿಗಾಗಿ ಕಲಿಯುತ್ತಿದ್ದೀರಿ?',
                forYourself: 'ನನಗಾಗಿ',
                forLovedOne: 'ಪ್ರೀತಿಪಾತ್ರರಿಗಾಗಿ',
                selectNeeds: 'ನಿಮ್ಮ ಪ್ರವೇಶದ ಅಗತ್ಯಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ',
                blind: 'ಕುರುಡು',
                blindDesc: 'ಧ್ವನಿ ಮತ್ತು ಬ್ರೈಲ್ ಕಲಿಕೆಯ ಬೆಂಬಲ',
                mute: 'ಮೂಕ',
                muteDesc: 'ಭಾಷಣ ಸಹಾಯ ಮತ್ತು ಸಂಕೇತ ಭಾಷೆ',
                deaf: 'ಕಿವುಡ',
                deafDesc: 'ಸಂಕೇತ ಭಾಷೆ ಮತ್ತು ದೃಶ್ಯ ಬೆಂಬಲ',
                continue: 'ಮುಂದುವರಿಸಿ',
            },
        };
    }

    // Renders the current step of the onboarding flow
    render(container) {
        this.container = container;
        this.container.innerHTML = ''; // Clear previous screen

        let content = '';
        switch (this.currentStep) {
            case 'language':
                content = this.renderLanguageScreen();
                break;
            case 'userType':
                content = this.renderUserTypeScreen();
                break;
            case 'needs':
                content = this.renderNeedsScreen();
                break;
        }

        this.container.innerHTML = content;
        this.addEventListeners();
        
        // Speak the title of the new screen
        const titleElement = this.container.querySelector('.screen__title');
        if (titleElement) {
            speak(titleElement.textContent, this.state.language);
        }
    }

    // HTML for the language selection screen
    renderLanguageScreen() {
        const s = this.strings[this.state.language]; // Use default lang for initial prompt
        const kn_s = this.strings['kn-IN'];
        return `
            <div class="screen">
                <div class="screen__content">
                    <h1 class="screen__title">${s.chooseLanguage} / ${kn_s.chooseLanguage}</h1>
                    <div class="screen__actions">
                        <button class="button button--primary" data-action="selectLanguage" data-value="en-US">
                            <span class="button__icon">🇬🇧</span>
                            <span class="button__text">${s.english}</span>
                        </button>
                        <button class="button button--primary" data-action="selectLanguage" data-value="kn-IN">
                            <span class="button__icon">🇮🇳</span>
                            <span class="button__text">${s.kannada}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // HTML for the user type selection screen
    renderUserTypeScreen() {
        const s = this.strings[this.state.language];
        return `
            <div class="screen">
                <div class="screen__content">
                    <h1 class="screen__title">${s.whoAreYou}</h1>
                    <div class="screen__actions">
                        <button class="button button--secondary" data-action="selectUserType" data-value="self">
                            <span class="button__icon">👤</span>
                            <span class="button__text">${s.forYourself}</span>
                        </button>
                        <button class="button button--secondary" data-action="selectUserType" data-value="other">
                            <span class="button__icon">❤️</span>
                            <span class="button__text">${s.forLovedOne}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // HTML for the accessibility needs selection screen
    renderNeedsScreen() {
        const s = this.strings[this.state.language];
        return `
            <div class="screen">
                <div class="screen__content">
                    <h1 class="screen__title">${s.selectNeeds}</h1>
                    <div class="screen__actions">
                        <button class="button button--option" data-action="toggleNeed" data-value="blind">
                            <span class="button__icon">👁️</span>
                            <span class="button__text-stack">
                                <span class="button__title">${s.blind}</span>
                                <span class="button__subtitle">${s.blindDesc}</span>
                            </span>
                        </button>
                        <button class="button button--option" data-action="toggleNeed" data-value="mute">
                            <span class="button__icon">🔇</span>
                             <span class="button__text-stack">
                                <span class="button__title">${s.mute}</span>
                                <span class="button__subtitle">${s.muteDesc}</span>
                            </span>
                        </button>
                        <button class="button button--option" data-action="toggleNeed" data-value="deaf">
                             <span class="button__icon">🧏</span>
                             <span class="button__text-stack">
                                <span class="button__title">${s.deaf}</span>
                                <span class="button__subtitle">${s.deafDesc}</span>
                            </span>
                        </button>
                    </div>
                </div>
                <div class="screen__footer">
                    <button class="button button--primary" data-action="finishOnboarding">${s.continue}</button>
                </div>
            </div>
        `;
    }

    // Adds event listeners to the buttons on the current screen
    addEventListeners() {
        this.container.querySelectorAll('[data-action]').forEach(element => {
            element.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const value = e.currentTarget.dataset.value;
                this.handleAction(action, value, e.currentTarget);
            });
        });
    }

    // Central action handler for all clicks
    handleAction(action, value, element) {
        // Speak the text content of the button that was clicked
        const buttonText = element.querySelector('.button__text, .button__title')?.textContent || element.textContent;
        speak(buttonText.trim(), this.state.language);

        switch (action) {
            case 'selectLanguage':
                this.state.language = value;
                this.currentStep = 'userType';
                this.render(this.container);
                break;
            
            case 'selectUserType':
                this.state.userType = value;
                if (value === 'self') {
                    this.currentStep = 'needs';
                } else {
                    // If learning for someone else, skip the 'needs' step.
                    this.onComplete(this.state.needs);
                    return;
                }
                this.render(this.container);
                break;
            
            case 'toggleNeed':
                element.classList.toggle('active');
                if (this.state.needs.includes(value)) {
                    this.state.needs = this.state.needs.filter(need => need !== value);
                } else {
                    this.state.needs.push(value);
                }
                break;

            case 'finishOnboarding':
                this.onComplete(this.state.needs);
                break;
        }
    }
}