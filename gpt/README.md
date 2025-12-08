# WPPConnect Gemini Integration

This project demonstrates how to authenticate with WhatsApp using `wppconnect`, persist the session, and retrieve catalog products.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

## Usage

1.  **Start the Application**:
    ```bash
    npm start
    ```

2.  **Authentication**:
    -   The first time you run the app, a QR code will be printed in the terminal.
    -   Scan this QR code with your WhatsApp mobile app (Linked Devices).
    -   Session data will be saved in `tokens` and `session-data` directories.

3.  **Subsequent Runs**:
    -   The application will use the stored credentials to auto-login.

## Features

-   **Authentication**: Handles QR code scanning and session persistence.
-   **Catalog Retrieval**: Fetches and logs products from the connected business account's catalog.

## Directory Structure

-   `src/index.ts`: Main entry point containing the logic.
-   `tokens/`: Stores WPPConnect session tokens.
-   `session-data/`: Stores Puppeteer/Browser session data (cookies, cache).

