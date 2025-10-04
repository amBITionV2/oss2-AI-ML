import { speak } from '../utils/tts.js';

export default class LearnBraille {
    constructor(userProfile, onBack) {
        this.container = null;
        this.userProfile = userProfile;
        this.onBack = onBack; // Callback function to go back to the dashboard

        this.strings = {
            'en-US': {
                title: 'Learn Braille',
                back: 'Back to Dashboard',
                lesson1: 'Lesson 1: Letter A',
                dot: 'Dot',
            },
            'kn-IN': {
                title: 'ಬ್ರೈಲ್ ಕಲಿಯಿರಿ',
                back: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ',
                lesson1: 'ಪಾಠ 1: ಅಕ್ಷರ A',
                dot: 'ಡಾಟ್',
            },
        };
    }

    render(container) {
        this.container = container;
        const s = this.strings[this.userProfile.language];

        const content = `
            <div class="screen">
                <div class="screen__header">
                    <button class="button button--back" data-action="back">
                        <span class="button__icon">←</span>
                        <span class="button__text">${s.back}</span>
                    </button>
                </div>
                <div class="screen__content">
                    <h1 class="screen__title">${s.title}</h1>
                    <p class="screen__subtitle">${s.lesson1}</p>
                    <div class="braille-cell">
                        <div class="braille-dot" data-dot="1"></div>
                        <div class="braille-dot" data-dot="4"></div>
                        <div class="braille-dot" data-dot="2"></div>
                        <div class="braille-dot" data-dot="5"></div>
                        <div class="braille-dot" data-dot="3"></div>
                        <div class="braille-dot" data-dot="6"></div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = content;
        this.addEventListeners();
        this.startLesson();
    }

    addEventListeners() {
        // Handle the back button click
        this.container.querySelector('[data-action="back"]').addEventListener('click', () => {
            const backButtonText = this.strings[this.userProfile.language].back;
            speak(backButtonText, this.userProfile.language);
            this.onBack();
        });

        // Add listeners for haptic feedback (simulation for now)
        this.container.querySelectorAll('.braille-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const dotNumber = e.currentTarget.dataset.dot;
                const s = this.strings[this.userProfile.language];
                speak(`${s.dot} ${dotNumber}`, this.userProfile.language);
                console.log(`Vibrating for dot ${dotNumber}`);
                // In a real mobile app, we would trigger the haptic engine here.
            });
        });
    }

    // Starts the current lesson
    startLesson() {
        const s = this.strings[this.userProfile.language];
        speak(s.lesson1, this.userProfile.language);

        // For "A" (Dot 1), highlight the first dot
        const dot1 = this.container.querySelector('[data-dot="1"]');
        dot1.classList.add('braille-dot--active');
    }
}