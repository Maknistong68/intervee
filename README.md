# INTERVEE - Philippine OSH Practitioner Interview Assistant

A mobile-first, AI-powered application that passively assists during OSH (Occupational Safety and Health) Practitioner interviews by listening to conversations and providing real-time suggested answers based on Philippine DOLE regulations.

## Features

- **Real-time Speech Recognition**: Supports English, Tagalog, and Taglish (code-switching)
- **AI-Powered Answers**: Uses GPT-4o for fast, accurate responses based on Philippine OSH standards
- **Passive Operation**: Zero human intervention during interviews
- **Knowledge Base**: Comprehensive coverage of OSHS Rules 1020-1960, Department Orders, and RA 11058
- **Response Caching**: Redis-based caching for faster responses to common questions
- **Dark Mode UI**: Optimized for discreet use during interviews

## Tech Stack

### Mobile App (React Native + Expo)
- React Native 0.73+
- Expo SDK 50
- expo-av for audio recording
- Socket.io-client for real-time communication
- Zustand for state management

### Backend (Node.js)
- Express.js server
- Socket.io for WebSocket communication
- OpenAI API (Whisper + GPT-4o)
- PostgreSQL with Prisma ORM
- Redis for caching

## Project Structure

```
INTERVEE/
├── mobile/                 # React Native Expo App
│   ├── app/               # Expo Router screens
│   ├── components/        # UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and Socket services
│   ├── stores/            # Zustand state management
│   └── constants/         # Theme and constants
│
├── backend/               # Node.js Server
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── services/     # Business logic
│   │   ├── prompts/      # AI system prompts
│   │   ├── knowledge/    # OSH knowledge base
│   │   ├── websocket/    # Real-time handlers
│   │   └── utils/        # Utilities
│   └── prisma/           # Database schema
│
├── shared/                # Shared TypeScript types
└── docker-compose.yml     # PostgreSQL + Redis
```

## Getting Started

### Prerequisites

- Node.js 20 LTS
- Docker and Docker Compose
- OpenAI API Key
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone and Setup

```bash
cd INTERVEE

# Copy environment file
cp .env.example backend/.env

# Edit .env and add your OpenAI API key
```

### 2. Start Database Services

```bash
docker-compose up -d
```

### 3. Setup Backend

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev
```

### 4. Setup Mobile App

```bash
cd mobile
npm install
npx expo start
```

### 5. Run on Device/Simulator

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app for physical device

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=sk-your-openai-api-key
DATABASE_URL=postgresql://intervee:intervee_password@localhost:5432/intervee_db
REDIS_URL=redis://localhost:6379
CACHE_ENABLED=true
```

## Knowledge Base Coverage

### OSHS Rules
- Rule 1020: Registration
- Rule 1030: Training of Personnel
- Rule 1040: Health and Safety Committee
- Rule 1050: Notification and Recordkeeping
- Rule 1070: Occupational Health
- Rule 1080: Personal Protective Equipment
- Rule 1090: Hazardous Materials
- Rule 1960: Occupational Health Services

### Department Orders
- DO 252/2025: Comprehensive OSH Amendments
- DO 253/2025: Safety Officer Qualifications
- DO 198/2018: Construction Safety
- DO 178/2017: Drug-Free Workplace
- And many more...

### Labor Advisories
- LA 07/2022: Zero Accident Reporting
- LA 08/2022: Heat Stress Management
- LA 19/2022: Mental Health Programs
- And more...

### Laws
- RA 11058: OSH Standards Act

## API Endpoints

### REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/rules/:number` | GET | Get specific OSHS rule |
| `/api/search` | GET | Search knowledge base |
| `/api/sessions` | GET | List past sessions |
| `/api/sessions/:id` | GET | Get session details |

### WebSocket Events

**Client → Server:**
- `session:start` - Begin interview session
- `audio:chunk` - Send audio data
- `session:end` - End interview session

**Server → Client:**
- `transcript:partial` - Live transcription
- `transcript:final` - Finalized transcription
- `answer:generating` - AI processing indicator
- `answer:stream` - Streamed answer chunks
- `answer:ready` - Complete answer with confidence

## Mobile App Screens

1. **Interview Screen** (Main)
   - Large answer display (75% of screen)
   - Transcript preview
   - Start/Stop controls
   - Recording indicator

2. **History Screen**
   - Past session list
   - Expandable Q&A details
   - Delete functionality

3. **Settings Screen**
   - Server URL configuration
   - Behavior settings
   - Data management

## Response Time Targets

- Audio to Transcription: ~800ms
- Question Detection: ~200ms
- GPT-4o Response Start: ~1000ms
- **Total Time to First Token: < 2 seconds**
- Complete Answer: < 4 seconds

## License

This project is for educational and professional development purposes.

## Disclaimer

This application is designed to assist OSH practitioners during interviews. Always verify answers with official DOLE publications and regulations. The AI-generated responses are suggestions and should not be considered as legal advice.
