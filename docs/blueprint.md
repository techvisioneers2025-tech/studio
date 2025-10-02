# **App Name**: SnapTranslate

## Core Features:

- Image Capture: Capture images containing text using the device's camera or select them from the device's gallery.
- Text Recognition: Utilize Google ML Kit to recognize text within the captured image.
- Language Selection: Allow users to select the source and target languages for translation.
- Text Translation: Translate the recognized text into the selected target language. Uses an external translation API as a tool.
- Firestore Integration: Store translation history of the user in the Firestore database.
- User Authentication: Enable user authentication via Google Sign-In, and email and password, managed by Firebase Authentication.

## Style Guidelines:

- Primary color: Saturated blue (#2979FF), evokes confidence and precision in translations.
- Background color: Light blue (#E3F2FD), provides a calming backdrop that's easy on the eyes.
- Accent color: Vibrant purple (#7C4DFF), for a modern touch that complements the blue tones.
- Body and headline font: 'PT Sans', a versatile sans-serif font, offers a balance of readability and modern design, making it suitable for both headers and body text.
- Use clear, modern icons to represent actions like capturing images, selecting languages, and copying text. Ensure they are easily understandable.
- Maintain a clean, intuitive layout with a prominent area for displaying the original and translated text.
- Incorporate subtle animations when transitioning between states, such as loading the translation or confirming that it's saved, enhancing user engagement without distraction.