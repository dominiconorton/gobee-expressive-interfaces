// Canvas Setup
const canvas = document.getElementById('robotCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 16;
const pixelSize = canvas.width / gridSize;
const onColor = '#00ff00';
const offColor = '#222';

// Text Input Elements
const textInput = document.getElementById('textInput');
const detectEmotionButton = document.getElementById('detectEmotionButton');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

// Drawing Functions
function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    const gap = Math.max(1, Math.floor(pixelSize * 0.05));
    ctx.fillRect(x * pixelSize + gap / 2, y * pixelSize + gap / 2, pixelSize - gap, pixelSize - gap);
    if (pixelSize > 4) {
        ctx.fillStyle = hexToRgba(color, 0.3);
        ctx.fillRect(x * pixelSize + pixelSize * 0.25, y * pixelSize + pixelSize * 0.25, pixelSize * 0.5, pixelSize * 0.5);
    }
}

function drawFace(expressionData) {
    ctx.fillStyle = offColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!expressionData) return;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (expressionData[y] && expressionData[y][x] === 1) {
                drawPixel(x, y, onColor);
            }
        }
    }
}

function hexToRgba(hex, alpha) {
    if (typeof hex !== 'string' || hex.length < 6) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${alpha})`;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Function to handle emotion change
function handleExpressionChange(emotionName) {
    const expressionData = expressions[emotionName];
    if (expressionData) {
        drawFace(expressionData);
        errorMessage.textContent = '';
    } else {
        console.error(`Expression "${emotionName}" not found.`);
    }
}

// Event Listener for Emotion Detection Button
detectEmotionButton.addEventListener('click', async () => {
    const text = textInput.value.trim();
    errorMessage.textContent = '';

    if (!text) {
        errorMessage.textContent = 'Please enter some text.';
        return;
    }

    // Show loading spinner
    loadingSpinner.style.display = 'block';
    detectEmotionButton.disabled = true;

    try {
        console.log('Sending request to:', `${API_BASE_URL}/api/detect-emotion`);
        const response = await fetch(`${API_BASE_URL}/api/detect-emotion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received response:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }

        if (data.emotion && expressions.hasOwnProperty(data.emotion)) {
            handleExpressionChange(data.emotion);
        } else {
            errorMessage.textContent = `Error: Emotion "${data.emotion}" not recognized.`;
            console.warn(`Unknown emotion returned from API: ${data.emotion}`);
        }
    } catch (error) {
        errorMessage.textContent = `Error: ${error.message || 'Failed to detect emotion'}`;
        console.error("API Error:", error);
    } finally {
        // Hide loading spinner
        loadingSpinner.style.display = 'none';
        detectEmotionButton.disabled = false;
    }
});

// Initial Drawing
if (expressions['Happy']) {
    handleExpressionChange('Happy');
} else {
    console.error("Initial 'Happy' expression not found!");
} 