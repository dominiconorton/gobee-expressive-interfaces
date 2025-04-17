# Expressive Interfaces

A Node.js application that displays expressive robot faces with different emotions. The application uses OpenAI's GPT-4o model to translate robot response to emotion.

## Features

- Interactive robot face display with 7 different emotions
- Text-to-emotion detection using OpenAI's GPT-4o model
- Responsive design with Tailwind CSS
- Pixel art style interface

## Emotions

The application supports the following emotions:

1. Happy
2. Sad
3. Angry
4. Sleep
5. Surprised
6. Wink
7. Loving

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
4. For development with auto-reload:
   ```
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3001`
2. Type any text in the input field (e.g., "I love you", "I am so angry!")
3. Click "Send" to analyze the text and display the corresponding emotion

## API

The application exposes a single API endpoint:

- `POST /api/detect-emotion`: Analyzes text and returns an emotion
  - Request body: `{ "text": "Your text here" }`
  - Response: `{ "emotion": "EmotionName" }`

## Technologies Used

- Node.js
- Express.js
- OpenAI API
- HTML5 Canvas
- Tailwind CSS
- JavaScript (ES6+) 
