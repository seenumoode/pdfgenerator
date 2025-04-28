Webpage to PDF Generator

A Next.js application that generates a PDF from a given webpage URL using Browserless and Puppeteer. The application includes an API route to process URLs and a minimal frontend for user interaction.

Prerequisites

Node.js: Version 18 or higher.

Browserless Token: Obtain a token from Browserless to connect to their WebSocket endpoint.

Setup

Clone the Repository:

git clone git@github.com:seenumoode/pdfgenerator.git
cd pdfgenerator

Install Dependencies:

npm install

Configure Environment Variables:

Create a .env.local file in the root directory and add your Browserless token:
env

BROWSERLESS_TOKEN=your-browserless-token

Replace your-browserless-token with your actual Browserless token.

Running the Application

Start the Development Server:

npm run dev

The application will be available at http://localhost:3000.
