import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
from chatbot_setup import SamimChatbot
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get port from environment variable - Render sets this automatically
port = int(os.environ.get("PORT", 5000))

# Initialize the chatbot
try:
    chatbot = SamimChatbot()
    logger.info("Chatbot initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize chatbot: {e}")
    chatbot = None

@app.route('/')
def index():
    """Serve a simple HTML page to test the chatbot."""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Samim's Chatbot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Poppins', Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
                color: #333;
                line-height: 1.6;
            }
            .container {
                background-color: #fff;
                border-radius: 12px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                padding: 25px;
                margin-bottom: 30px;
            }
            h1 {
                color: #2c3e50;
                text-align: center;
                margin-bottom: 25px;
                font-weight: 600;
            }
            #chatbox {
                height: 450px;
                border: 1px solid #e0e0e0;
                padding: 15px;
                overflow-y: auto;
                margin-bottom: 20px;
                border-radius: 8px;
                background-color: #f9f9f9;
            }
            .input-container {
                display: flex;
                margin-bottom: 20px;
            }
            #user-input {
                flex-grow: 1;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 8px 0 0 8px;
                font-size: 16px;
                font-family: inherit;
            }
            #send-button {
                padding: 12px 20px;
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 0 8px 8px 0;
                cursor: pointer;
                font-weight: 500;
                transition: background-color 0.3s;
                font-family: inherit;
            }
            #send-button:hover {
                background-color: #2980b9;
            }
            .user-message {
                background-color: #3498db;
                color: white;
                padding: 10px 15px;
                margin: 10px 0;
                border-radius: 18px 18px 0 18px;
                max-width: 80%;
                margin-left: auto;
                word-break: break-word;
            }
            .bot-message {
                background-color: #f0f0f0;
                color: #333;
                padding: 10px 15px;
                margin: 10px 0;
                border-radius: 18px 18px 18px 0;
                max-width: 80%;
                word-break: break-word;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                color: #7f8c8d;
                font-size: 14px;
            }
            .footer a {
                color: #3498db;
                text-decoration: none;
                font-weight: 500;
            }
            .footer a:hover {
                text-decoration: underline;
            }
            @media (max-width: 600px) {
                body {
                    padding: 10px;
                }
                .container {
                    padding: 15px;
                }
                #chatbox {
                    height: 350px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Chat with Samim's AI</h1>
            <div id="chatbox"></div>
            <div class="input-container">
                <input type="text" id="user-input" placeholder="Type your message here...">
                <button id="send-button">Send</button>
            </div>
            <div class="footer">
                <p>This AI chatbot represents Samim Reza when he's unavailable.</p>
                <p>Visit <a href="https://samim-reza.github.io/" target="_blank">Samim's Portfolio</a> to learn more about him.</p>
                <p>&copy; 2025 Samim Reza</p>
            </div>
        </div>
        
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const chatbox = document.getElementById('chatbox');
                const userInput = document.getElementById('user-input');
                const sendButton = document.getElementById('send-button');
                
                // Add a welcome message
                addBotMessage("হ্যালো! আমি শামীমের AI অ্যাসিস্ট্যান্ট। আমি কীভাবে সাহায্য করতে পারি?");
                
                // Focus on input field
                userInput.focus();
                
                // Send message when button is clicked
                sendButton.addEventListener('click', sendMessage);
                
                // Send message when Enter key is pressed
                userInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                });
                
                function sendMessage() {
                    const message = userInput.value.trim();
                    if (message) {
                        // Display user message
                        addUserMessage(message);
                        
                        // Clear input field
                        userInput.value = '';
                        userInput.focus();
                        
                        // Show typing indicator
                        const typingIndicator = addBotMessage("Thinking...");
                        
                        // Send request to server
                        fetch('/api/chat', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ query: message })
                        })
                        .then(response => response.json())
                        .then(data => {
                            // Remove typing indicator
                            chatbox.removeChild(typingIndicator);
                            
                            // Display bot response
                            addBotMessage(data.response);
                        })
                        .catch(error => {
                            // Remove typing indicator
                            chatbox.removeChild(typingIndicator);
                            
                            // Display error message
                            addBotMessage("Sorry, I encountered an error. Please try again later.");
                            console.error('Error:', error);
                        });
                    }
                }
                
                function addUserMessage(message) {
                    const div = document.createElement('div');
                    div.className = 'user-message';
                    div.textContent = message;
                    chatbox.appendChild(div);
                    chatbox.scrollTop = chatbox.scrollHeight;
                    return div;
                }
                
                function addBotMessage(message) {
                    const div = document.createElement('div');
                    div.className = 'bot-message';
                    div.textContent = message;
                    chatbox.appendChild(div);
                    chatbox.scrollTop = chatbox.scrollHeight;
                    return div;
                }
            });
        </script>
    </body>
    </html>
    """

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat API requests."""
    if chatbot is None:
        return jsonify({"error": "Chatbot not initialized"}), 503
    
    data = request.json
    if not data or 'query' not in data:
        return jsonify({"error": "Missing query parameter"}), 400
    
    user_query = data['query']
    logger.info(f"Received query: {user_query}")
    
    try:
        response = chatbot.get_response(user_query)
        return jsonify({"response": response})
    except Exception as e:
        logger.error(f"Error getting response: {e}")
        return jsonify({"error": "Failed to get response from chatbot"}), 500

@app.route('/chat')
def chat_page():
    """Redirect to the index page."""
    return index()

if __name__ == '__main__':
    if chatbot is None:
        logger.error("Cannot start server: Chatbot not initialized")
    else:
        # Use Flask's built-in server instead of uvicorn
        app.run(host='0.0.0.0', port=port, debug=False)