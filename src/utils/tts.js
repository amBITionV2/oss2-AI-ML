/**
 * A simple Text-to-Speech (TTS) utility to provide audio feedback.
 * This is crucial for accessibility.
 */

// Centralized speech synthesis instance
const synth = window.speechSynthesis;

/**
 * Speaks a given text string.
 * @param {string} text - The text to be spoken.
 * @param {string} [lang='en-US'] - The language code (e.g., 'en-US', 'kn-IN').
 */
export function speak(text, lang = 'en-US') {
    if (synth.speaking) {
        console.warn('SpeechSynthesis is already speaking. Cancelling previous utterance.');
        synth.cancel();
    }

    if (text !== '') {
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.lang = lang;
        utterance.pitch = 1;
        utterance.rate = 1;

        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
        };

        synth.speak(utterance);
    }
}