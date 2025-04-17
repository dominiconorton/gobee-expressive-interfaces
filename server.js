const express = require('express');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for emotion detection
app.post('/api/detect-emotion', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('Received text for emotion detection:', text);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Your goal is to translate the user text into an emotion for a humanoid robot. The emotion is an expressive response to the users input. \n\nAn example is as follows:\n{\n    \"emotion\": \"Happy\"\n  }\n\nThe emotion options are:\n1. Happy\n2. Sad\n3. Angry\n4. Sleep\n5. Surprised\n6. Wink\n7. Loving"
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1
    });

    // Extract the emotion from the response
    const responseText = completion.choices[0].message.content;
    console.log('OpenAI response:', responseText);
    
    let emotionData;
    
    try {
      // Try to parse the response as JSON
      emotionData = JSON.parse(responseText);
    } catch (error) {
      // If parsing fails, try to extract the emotion using regex
      const emotionMatch = responseText.match(/"emotion"\s*:\s*"([^"]+)"/);
      if (emotionMatch && emotionMatch[1]) {
        emotionData = { emotion: emotionMatch[1] };
      } else {
        throw new Error('Could not extract emotion from response');
      }
    }

    console.log('Extracted emotion data:', emotionData);
    res.json(emotionData);
  } catch (error) {
    console.error('Error detecting emotion:', error);
    res.status(500).json({ error: 'Failed to detect emotion' });
  }
});

// Function to find an available port
async function findAvailablePort(startPort) {
    let port = startPort;
    while (port < startPort + 10) { // Try up to 10 ports
        try {
            await new Promise((resolve, reject) => {
                const server = app.listen(port)
                    .once('error', (err) => {
                        if (err.code === 'EADDRINUSE') {
                            server.close();
                            resolve(false);
                        } else {
                            reject(err);
                        }
                    })
                    .once('listening', () => {
                        server.close();
                        resolve(true);
                    });
            });
            return port;
        } catch (err) {
            console.error('Error checking port:', err);
            port++;
        }
    }
    throw new Error('No available ports found');
}

// Start server with port finding
findAvailablePort(PORT)
    .then(availablePort => {
        app.listen(availablePort, () => {
            console.log(`Server is running on http://localhost:${availablePort}`);
        });
    })
    .catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    }); 