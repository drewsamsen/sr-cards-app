# Active Context: Flashcard Review App

## Current Focus
The project is currently in active development with a focus on core functionality and user experience. The primary goal is to build a complete, functional flashcard application with spaced repetition capabilities.

## Recent Changes
- Improved phone simulator with realistic aspect ratio and scrollable content
- Moved header inside phone simulator for complete app simulation
- Made phone simulation mode the default on desktop screens
- Added phone simulation mode with toggle button for better mobile testing on desktop
- Redesigned login/register UI to use text links instead of tabs for a cleaner interface
- Simplified register form by removing title and description
- Simplified login form by removing welcome text and description
- Enhanced login/register UI with improved spacing, larger inputs, and better dark theme colors
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
- **Phone Emulator Styling System**:
  - Implemented a custom Tailwind variant called `phone:` for phone emulator styling
  - Created a plugin that recognizes the `.phone-emulator-mode` class context
  - Added the class to the phone emulator's content area
  - Updated core UI components (Table, Card, Button, Dialog) to use the phone variant
  - Ensures consistent mobile styling when using the phone emulator
  - Allows component styles to respect the phone emulator context automatically
  - Eliminates the need for manual style adjustments for phone emulator mode
- **Phone Simulation Mode**:
  - Set fixed height (860px) and width (430px) for realistic phone aspect ratio
  - Made content area scrollable to handle overflow content
  - Added flex layout to properly organize header, content, and home indicator
  - Included the app header inside the phone simulator for complete mobile experience
  - Only the mode toggle button remains outside the simulator frame
  - Made phone view the default for desktop and larger screens
  - Used responsive design to only show phone frame on larger screens
  - Small screen devices (actual phones) see the native layout without simulation
  - Added screen width detection to determine when to apply the phone frame
  - Added a toggle button in the top-right corner to switch between phone and desktop views
  - Created a phone-like frame that simulates the app appearance on mobile devices
  - Added subtle status bar and home indicator for realistic phone appearance
  - Stored user preference in localStorage to persist between sessions
- **Login/Register UI**: 
  - Replaced tabbed interface with a simpler single form design
  - Added "Already have an account?" and "Don't have an account?" text links to switch forms
  - Removed all titles and descriptions for a minimal appearance
  - Added more space between elements for better readability
  - Increased input field size for better usability
  - Improved dark theme colors with better contrast
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