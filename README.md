# Nerdle

Nerdle is a word-guessing game inspired by Wordle, with a focus on technology-related words. The project includes both a React frontend and an Express.js backend.

Project Structure

	•	Client: React application hosted as a static site on Render.
	•	Server: Express.js API hosted on Render for fetching and validating words.

Tech Stack

	•	Frontend: React, Axios
	•	Backend: Node.js, Express
	•	Hosting: Render

## Getting Started

### Prerequisites

Make sure you have the following installed:
Node.js, npm

### Development Setup

1. Clone the repository:

   - `git clone https://github.com/your-username/nerdle.git`

    - `cd nerdle`

2. Install dependencies:

    - For the server:
    
      - `cd server`
      - `npm install`

    - For the client:

      - `cd client`
      - `npm install`

3. Start development servers:

    - In the server directory:

      - `npm start`

   - In the client directory:

     - `npm start`

The client will be available at http://localhost:3000, and the server at http://localhost:4000.

### Environment Variables

In the client, create a .env file with:

- REACT_APP_API_URL=http://localhost:4000

In production, set REACT_APP_API_URL to:

- REACT_APP_API_URL=https://nerdle-server.onrender.com

### Build and Deploy

#### Client:

The client is built for production using:

`npm run build`
This generates a build folder with static assets.

#### Server:

No additional build step is required for the server.

#### Deployment

The project is hosted on Render. Here’s how the configuration is set up: <br />
•	Client: Deployed as a static site. <br />
•	Build Command: `npm run build` <br />
•	Publish Directory: build <br />
•	Server: Deployed as a web service. <br />
•	Start Command: `npm start` <br />
•	Root Directory: server

### API Endpoints

    •GET /api/words/random
        Returns a random word from the tech word list.
    •POST /api/words/validate
        Validates a user-submitted word.
    
    Request body: { "word": "yourword" }
    Response: { "valid": true/false }
