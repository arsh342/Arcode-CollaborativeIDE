
# Arcode - Collaborative IDE

Arcode is a modern, web-based Collaborative Integrated Development Environment (IDE) designed to streamline the development workflow. It combines an intelligent code editor with AI-powered assistance and real-time collaboration features, built on a robust and scalable tech stack.

## Features

*   **Intelligent Code Editor**: Monaco-powered editor with syntax highlighting, autocompletion, and an intuitive interface, similar to VS Code.
*   **AI-Powered Assistance**: Integrated AI (using Genkit and Gemini) to help debug, refactor, and understand code.
*   **Real-time Collaboration**: Project sharing and a built-in chat panel for seamless teamwork. (Real-time collaborative editing is a future goal).
*   **Project Management**: Create, manage, and organize your coding projects in a dashboard view.
*   **File Explorer**: VS Code-like file and folder management within the IDE.
*   **Multiple Terminals**: Support for multiple terminal instances.
*   **Firebase Integration**: Secure authentication (Email/Password, Google, GitHub) and Firestore database for storing project and user data.
*   **Responsive Design**: Built with Next.js and Tailwind CSS for optimal speed and responsiveness across devices.
*   **Customizable Settings**: Options to manage user profiles and AI provider API keys.

## Technology Stack

*   **Frontend**:
    *   [Next.js](https://nextjs.org/) (with App Router)
    *   [React](https://reactjs.org/)
    *   [TypeScript](https://www.typescriptlang.org/)
*   **UI Components**:
    *   [ShadCN UI](https://ui.shadcn.com/)
    *   [Tailwind CSS](https://tailwindcss.com/)
*   **Code Editor**:
    *   [Monaco Editor](https://microsoft.github.io/monaco-editor/) (via `@monaco-editor/react`)
*   **Generative AI**:
    *   [Genkit (Firebase Genkit)](https://firebase.google.com/docs/genkit)
    *   Google AI (Gemini models)
*   **Backend & Database**:
    *   [Firebase Authentication](https://firebase.google.com/docs/auth)
    *   [Firestore](https://firebase.google.com/docs/firestore) (NoSQL Database)
*   **State Management**:
    *   React Context API
*   **Form Handling**:
    *   [React Hook Form](https://react-hook-form.com/)
    *   [Zod](https://zod.dev/) (for schema validation)
*   **Styling**:
    *   Tailwind CSS
    *   CSS Variables for theming
*   **Icons**:
    *   [Lucide React](https://lucide.dev/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   A Firebase project with Authentication (Email/Password, Google, GitHub enabled) and Firestore database set up.

### Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/arsh342/Arcode-CollaborativeIDE.git
    cd Arcode-CollaborativeIDE
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up Firebase Environment Variables**:
    *   Create a `.env` file in the root of your project.
    *   Copy the contents from `.env.example` (if provided, otherwise create it manually) or use the following template:
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
        NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id # Optional

        # For Genkit AI features
        GOOGLE_API_KEY=your_google_ai_api_key # (e.g., Gemini API key)
        ```
    *   Replace `your_firebase_...` and `your_google_ai_api_key` with your actual Firebase project configuration values and your Google AI API key. You can find Firebase credentials in your Firebase project settings. The Google AI API key can be obtained from Google AI Studio or Google Cloud Console.

4.  **Configure Firebase Authentication**:
    *   In your Firebase project console, go to **Authentication -> Sign-in method**.
    *   Enable the **Email/Password**, **Google**, and **GitHub** providers.
    *   For Google and GitHub, ensure you have correctly configured the OAuth consent screen, added authorized JavaScript origins (including your local development URL, e.g., `http://localhost:3000` or `http://localhost:9000`, and your Firebase auth domain), and authorized redirect URIs (e.g., `your_project_id.firebaseapp.com/__/auth/handler`).

5.  **Configure Firestore Database**:
    *   Ensure Firestore is enabled in your Firebase project.
    *   **Security Rules**: For development, you can start with open rules, but for production, you **must** set up proper security rules. A basic example for development:
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if true; // WARNING: Open access for development only!
            }
          }
        }
        ```
    *   **Indexes**: The application may require specific Firestore composite indexes for queries. If you encounter errors in the browser console mentioning missing indexes, Firebase usually provides a direct link to create them. Follow the link to create the required indexes in your Firebase console.

### Running the Development Server

Once the setup is complete, you can run the development server:

```bash
npm run dev
# or
# yarn dev
```

This will typically start the application on `http://localhost:9000` (as specified in `package.json` `dev` script) or `http://localhost:3000`. Open this URL in your browser to see the application.

### Genkit Development (Optional)

If you are working on AI features with Genkit:

*   To start the Genkit development server (usually for testing flows locally):
    ```bash
    npm run genkit:dev
    ```
*   To watch for changes in Genkit flows:
    ```bash
    npm run genkit:watch
    ```

## Project Structure

A brief overview of the key directories:

*   `src/app/`: Contains the Next.js App Router pages and layouts.
*   `src/components/`: Shared UI components, including ShadCN UI components (`ui/`) and application-specific components (`arcode/`, `layout/`, `effects/`).
*   `src/contexts/`: React Context providers for global state (Arcode IDE state, Authentication).
*   `src/firebase/`: Firebase configuration.
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Utility functions.
*   `src/types/`: TypeScript type definitions.
*   `src/ai/`: Genkit related code, including flows and configuration.
*   `public/`: Static assets.

## Contributing

Currently, contributions are managed by the project maintainers. If you have suggestions or find bugs, please open an issue on the GitHub repository.
