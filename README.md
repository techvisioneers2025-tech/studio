# App Translate

This is a Next.js application built with Firebase Studio that allows users to translate text from images.

## Getting Started

To get started, take a look at `src/app/page.tsx`. The application uses Next.js for the frontend, Firebase for authentication and database, and Genkit for AI-powered text recognition and translation.

## Privacy Policy

This application uses cloud-based services to provide text recognition and translation.

- **Image Data**: When you upload an image or use the camera, the image data is sent to a secure cloud service powered by Google's AI models to perform Optical Character Recognition (OCR). The image is processed to extract text and is not stored or used for any other purpose.
- **Text Data**: The text extracted from the image, or the text you type manually, is sent to a cloud translation service to be translated into your desired language.
- **User Data**: Your user profile information (email, name) and translation history are stored securely in Firebase Firestore. Only you can access your translation history.

We are committed to protecting your privacy. Your data is only used to provide the core functionality of this application.
