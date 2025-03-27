# Flashcard Review App

A modern spaced repetition flashcard application built with Next.js, React, and TypeScript. This app helps users efficiently learn and retain information using the FSRS (Free Spaced Repetition Scheduler) algorithm.

**Live App**: [echo.cards](https://echo.cards)

## Features

- **User Authentication**: Secure login and registration system
- **Deck Management**: Create, edit, and organize flashcard decks
- **Card Management**: 
  - Create and edit flashcards with front and back content
  - Inline editing via modal dialogs for a seamless experience
- **Spaced Repetition**: 
  - Study cards using the FSRS algorithm for optimal retention
  - Smart scheduling of reviews based on your performance
  - Daily review limits to prevent overlearning
- **Progress Tracking**: 
  - View your learning progress for each deck
  - See remaining reviews and backlog counts at a glance
- **User Settings**: Customize your learning experience

## Tech Stack

- **Frontend**:
  - Next.js 15 (App Router)
  - React 19
  - TypeScript
  - Tailwind CSS
  - Shadcn UI Components
  - Tanstack React Table

- **UI/UX**:
  - Responsive design for all devices
  - Dark/light mode support
  - Accessible components

## Getting Started

First, run the development server:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the application.

## Project Structure

- `/src/app`: Next.js app router pages
  - `/cards`: Card management pages
  - `/deck`: Deck detail and study pages
  - `/decks`: Deck listing page
  - `/login`: Authentication pages
  - `/settings`: User settings pages
- `/src/components`: Reusable React components
- `/src/lib`: Utility functions and hooks
  - `/api`: API client and services
  - `/hooks`: Custom React hooks
  - `/utils`: Helper functions

## Recent Updates

- Added modal dialogs for card creation and editing
- Implemented daily review limits with user-friendly messaging
- Updated deck listing to show both remaining reviews and backlog counts
- Improved user interface for better usability
- Added progress tracking for daily review limits

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

The application is deployed and publicly available at [echo.cards](https://echo.cards).
