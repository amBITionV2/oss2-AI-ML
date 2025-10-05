 # Setu — AI Accessibility Bridge

 Setu is a web app that helps make communication and learning accessible for people with visual and hearing impairments. It combines computer vision (MediaPipe), interactive learning modules, and Supabase for authentication and user profiles to provide features like:

 - Multilingual UI (English and Kannada)
 - User authentication (Sign up / Login) via Supabase
 - Condition-based personalization (blind, deaf, mute)
 - Dashboard with condition-specific modules and gamified points
 - Learn Braille: tactile-friendly practice with speech and vibration feedback
 - Braille Scanner: camera-based scanner (mock OCR in demo)
 - Learn Sign Language: image/video demonstrations and real-time camera-based quizzes using hand detection and a gesture classifier
 - Sign Translator: continuous, real-time sign-to-speech translation

 This repo is a Vite + React + TypeScript project scaffolded with shadcn/ui components and Tailwind CSS.

 ## Quick links

 - Source: this repository
 - Main entry: `src/main.tsx`
 - App routes: `src/App.tsx`
 - Pages: `src/pages/*` (Welcome, LanguageSelection, Login, SignUp, ConditionSelection, Dashboard, LearnBraille, BrailleScanner, LearnSignLanguage, SignTranslator)
 - Contexts: `src/contexts/*` (AuthContext, LanguageContext)
 - Integrations: `src/integrations/supabase/*`
 - Utilities: `src/utils/*` (ISL classifier, features)

 ## Requirements

 - Node.js (LTS recommended)
 - npm, pnpm or yarn (examples below use npm)
 - A Supabase project for auth and the `profiles` table used by the app
 - Browser with camera and Web Speech API support for the interactive modules

 ## Environment variables

 Create a `.env` (or `.env.local`) file in the project root and add these variables. The app expects them as Vite environment variables:

 - VITE_SUPABASE_URL - your Supabase project URL
 - VITE_SUPABASE_ANON_KEY - your Supabase anon/public key

 Example (.env):

 ```powershell
 VITE_SUPABASE_URL=https://your-project.supabase.co
 VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 ```

 Notes:
 - The repo contains a `supabase/` folder with SQL migrations and a small function (`functions/validate-sign`) used by the backend logic in some flows. Review and deploy these to your Supabase project if you want parity with the app.

 ## Install

 In PowerShell (Windows):

 ```powershell
 cd "c:\Users\Rekha Poornesh\Downloads\setu-access-aid-73503-05760-79170-58223-29048"
 npm install
 ```

 ## Development

 Start the dev server with hot reload:

 ```powershell
 npm run dev
 ```

 The app should be available at http://localhost:5173 (Vite default) unless configured otherwise.

 ## Build / Preview

 Build for production:

 ```powershell
 npm run build
 ```

 Preview a production build locally:

 ```powershell
 npm run preview
 ```

 ## Available scripts (from package.json)

 - `dev`: run the Vite dev server
 - `build`: build production assets
 - `build:dev`: build in development mode
 - `preview`: preview the production build
 - `lint`: run ESLint across the repo

 ## Key architecture notes

 - Routing: `react-router-dom` is used. Routes are declared in `src/App.tsx` with a `ProtectedRoute` wrapper for authenticated pages.
 - Authentication: `src/contexts/AuthContext.tsx` uses Supabase client (`src/integrations/supabase/client`) for sign up, sign in and session management.
 - Internationalization: `src/contexts/LanguageContext.tsx` provides a tiny translation map for English (`en`) and Kannada (`kn`) and a `t()` helper. Pages use `useLanguage()` for translations.
 - Hand detection & classification: `src/hooks/useHandDetection.tsx`, `src/utils/islGestureClassifier.ts` and `src/utils/islGestureFeatures.ts` provide MediaPipe integration and a small classifier. The `SignTranslator` and `LearnSignLanguage` pages use these to detect, smooth and classify gestures in real-time.
 - Braille learning: `src/pages/LearnBraille.tsx` implements interactive dot pressing, speech feedback (Web Speech API), and a simple points system. Points are written to Supabase via an RPC (`add_user_points`) in the demo code.
 - Braille scanning: `src/pages/BrailleScanner.tsx` contains a camera view and mock OCR. Replace the mock with an actual OCR pipeline or MediaPipe model as needed.

 ## Accessibility considerations

 - ARIA attributes and live regions are used across pages to announce dynamic content for screen readers.
 - The Welcome page contains a clear notice for deaf-blind users advising use of a refreshable Braille display.
 - Controls have large touch targets and high-contrast UI provided by Tailwind + the design system.
 - Speech synthesis and optional vibration are used to provide multimodal feedback for interactions.

 ## Database notes (Supabase)

 - The app expects a `profiles` table with at least these columns: `id`, `user_id` (auth UUID), `email`, `conditions` (string[]), `language_preference`, `points` (integer).
 - The project includes SQL migration files under `supabase/migrations/` which you can apply to your Supabase project.
 - There are serverless functions under `supabase/functions/`; review and deploy them if required by your setup.

 ## Assets

 - Sign images and videos are stored under `src/assets/signs/` and are referenced from the sign learning and translator pages.

 ## Testing & Quality

 - ESLint is configured (see `eslint.config.js`). Run `npm run lint` to check code quality.
 - The project uses TypeScript—ensure your editor runs the TS server for type checks.

 ## Contributing

 - Open an issue for feature requests or bugs.
 - Fork and create a PR with clear tests or manual verification steps.
 - Keep changes small and focused. Update migrations if you add DB changes.

 ## Troubleshooting

 - Camera access: make sure your browser has permission to use the camera. On Windows, use a modern Chromium-based browser.
 - Speech synthesis: the Web Speech API varies between browsers. Chrome/Edge have the best support.
 - Supabase errors: verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct and your CORS/auth settings allow the app origins.

 ## Next steps / improvements

 - Replace the mock OCR in `BrailleScanner` with a real OCR/ML model for Braille detection.
 - Add unit/integration tests for critical logic (Auth flows, classifier smoothing, DB RPCs).
 - Improve the ISL classifier with a larger dataset and model export.
 - Add CI to run linting and type checks on PRs.

 ## License

 This repository does not include a license file. Add a suitable open-source license (MIT, Apache-2.0, etc.) in `LICENSE` if you plan to publish the project.

 --
 
 If you'd like, I can also:
 - create a `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` template,
 - add a quick start script that verifies environment variables and Supabase connectivity,
 - or wire up a simple CI YAML to run lint and type checks on push/PR.

