# Active Context: Flashcard Review App

## Current Focus
The project is currently in active development with a focus on core functionality and user experience. The primary goal is to build a complete, functional flashcard application with spaced repetition capabilities.

## Recent Changes
- Further simplified AI explanation modal by removing all labels
- Simplified AI explanation modal by removing card content and renaming to "More from AI"
- Removed mobile menu hamburger icon for non-logged in users
- Removed Login button from header and made Try Demo button visible at all screen widths
- Moved the "Try Demo" button to the header for increased visibility
- Simplified demo login to use standard authentication flow with pre-filled credentials
- Changed default theme to dark mode for better user experience
- Added modal dialogs for card creation and editing
- Implemented card management features
- Added deck listing with review counts
- Created user authentication flows
- Implemented basic UI components and layouts

## In-Progress Work
- Implementing spaced repetition algorithm (FSRS)
- Building study session interface
- Creating progress tracking and analytics
- Improving user onboarding experience
- Enhancing mobile responsiveness

## Next Steps
1. Complete the core study session interface
2. Implement daily review limits
3. Add detailed progress tracking
4. Create comprehensive settings page
5. Improve UI/UX based on initial feedback
6. Add import/export functionality

## Active Decisions
- **AI Explanation Modal**: Maximally simplified to show only the explanation content without labels
- **Header Design**: 
  - Removed Login button and made Try Demo the primary call-to-action in header at all screen widths
  - Hamburger menu only shows for logged in users (who have navigation items)
  - Try Demo button is the only action for non-logged in users
- **Demo Button Placement**: Moved "Try Demo" button to the header for increased visibility and easier access
- **Simplified Demo Login**: Changed the demo login to pre-fill standard credentials and use existing authentication flow
- **Theme Default**: Dark mode set as default theme for improved user experience
- **UI Framework**: Using Shadcn UI components with Tailwind CSS for styling
- **Data Management**: Custom hooks for data fetching and state management
- **Routing**: Using Next.js App Router for page routing
- **Authentication**: Implementing user account-based authentication
- **API Structure**: RESTful service pattern for backend communication

## Current Challenges
- Ensuring optimal implementation of the FSRS algorithm
- Creating an intuitive study interface that supports various learning styles
- Balancing feature richness with simplicity of use
- Managing state across complex user flows
- Ensuring responsive design works well on all devices

## User Feedback Priorities
- Easy onboarding with demo option
- Intuitive card creation and editing experience
- Clear visualization of study progress
- Responsive and accessible interface
- Reliable scheduling of cards for review
- Fast and reliable performance

## Development Focus
The primary development focus is on creating a solid foundation with core functionality before adding more advanced features. The immediate priority is delivering a functional, user-friendly flashcard application that effectively implements spaced repetition learning. 