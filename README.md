# Setu - AI-Powered Accessibility Hub

Setu is a comprehensive web application designed to serve as an educational and assistive tool for individuals who are blind, deaf, or mute. Using AI technology, Setu breaks down communication barriers and provides accessible learning resources.

## Features

### For Blind Users
- **Learn Braille**: Interactive Braille cell with haptic feedback and Text-to-Speech
- **Braille to Speech Scanner**: Use your camera to scan Braille text and hear it spoken aloud

### For Deaf Users
- **Learn Sign Language**: Video tutorials teaching Indian Sign Language (ISL)

### For Mute Users
- **Sign Language to Speech Translator**: Real-time translation of sign language to spoken words

## Technology Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Lovable Cloud (Supabase-based)
- **Authentication**: Email/Password authentication
- **Database**: PostgreSQL with Row Level Security
- **UI**: Shadcn/ui components with high-contrast black/white theme

## Accessibility Features

- 100% screen reader compatible (VoiceOver/TalkBack)
- High-contrast black and white design
- Large tap targets (minimum 44x44px)
- Comprehensive ARIA labels
- Haptic feedback support
- Text-to-Speech integration
- Bilingual support (English and Kannada)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Backend Configuration**
   The backend is automatically configured through Lovable Cloud. Authentication and database are pre-configured.

## User Flow

1. **Welcome Screen**: Alternating greeting in English and Kannada
2. **Language Selection**: Choose between English and Kannada
3. **Authentication**: Sign up or login with email/password
4. **Condition Selection**: Select applicable conditions (Blind, Deaf, Mute)
5. **Dashboard**: Access personalized modules based on selected conditions

## Database Schema

### profiles
- `id`: UUID (Primary Key)
- `user_id`: UUID (References auth.users)
- `email`: TEXT
- `language_preference`: TEXT ('en' or 'kn')
- `conditions`: TEXT[] (Array of selected conditions)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Email confirmation is auto-enabled for testing
- Secure password authentication

## Mobile Deployment

This app is built as a responsive web application and can be deployed to iOS and Android using Capacitor.

## Future Enhancements

- Integration with real AI models for Braille OCR
- Live sign language translation using computer vision
- Expanded Braille learning curriculum
- Video library for ISL tutorials
- Offline mode support

---

## Project info

**URL**: https://lovable.dev/projects/6f08c3dc-e34b-4bf9-8af6-0e8b03c0212a
