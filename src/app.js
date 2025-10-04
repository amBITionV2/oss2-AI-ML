import Onboarding from './components/Onboarding.js';
import Dashboard from './components/Dashboard.js';
import LearnBraille from './components/LearnBraille.js';
import LearnSignLanguage from './components/LearnSignLanguage.js'; // <-- 1. Import the new component

export default class App {
    constructor(appElement) {
        this.appElement = appElement;
        this.userProfile = null; // Will be set after onboarding
        this.currentPage = 'onboarding'; // onboarding, dashboard, learn_braille, learn_sign_language
        this.currentComponent = null;
        this.render();
    }

    render() {
        this.appElement.innerHTML = ''; // Clear the screen before rendering a new component

        switch (this.currentPage) {
            case 'onboarding':
                this.currentComponent = new Onboarding(this.handleOnboardingComplete.bind(this));
                break;
            case 'dashboard':
                this.currentComponent = new Dashboard(this.userProfile, this.handleCardClick.bind(this));
                break;
            case 'learn_braille':
                this.currentComponent = new LearnBraille(this.userProfile, () => this.navigateTo('dashboard'));
                break;
            // 2. Add a case for the new screen
            case 'learn_sign_language':
                this.currentComponent = new LearnSignLanguage(this.userProfile, () => this.navigateTo('dashboard'));
                break;
        }

        if (this.currentComponent) {
            this.currentComponent.render(this.appElement);
        }
    }

    handleOnboardingComplete(profile) {
        console.log('Onboarding complete. User profile:', profile);
        this.userProfile = profile;
        this.navigateTo('dashboard');
    }

    handleCardClick(cardId) {
        console.log('Card clicked:', cardId);
        // 3. Handle the click for the sign language card
        if (cardId === 'learn_braille') {
            this.navigateTo('learn_braille');
        } else if (cardId === 'learn_sign_language') {
            this.navigateTo('learn_sign_language');
        }
    }

    navigateTo(page) {
        this.currentPage = page;
        this.render();
    }
}
