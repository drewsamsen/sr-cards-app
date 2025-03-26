# System Patterns: Flashcard Review App

## Architecture Overview
The Flashcard Review App follows a modern React application architecture using Next.js with the App Router pattern:

```
├── src/
│   ├── app/               # Next.js App Router pages/routes
│   ├── components/        # Reusable React components
│   └── lib/               # Utilities, hooks, and services
│       ├── api/           # API client and services
│       ├── hooks/         # Custom React hooks
│       └── utils/         # Helper functions
```

## Key Design Patterns

### Component Architecture
- **Component Hierarchy**: UI components are organized with clear parent-child relationships
- **Composition Pattern**: Complex UIs are built by composing smaller, focused components
- **Container/Presentation Pattern**: Logic separated from presentation where appropriate
- **Modal Pattern**: UI dialogs (add card, edit card) implemented as modal dialogs

### Data Flow
- **Hooks Pattern**: Custom hooks encapsulate and provide data and functionality
- **Client-Side API**: API client for backend communication
- **Service Pattern**: Data access abstracted through service layers
- **State Management**: Local React state for UI state, custom hooks for domain data

### UI Patterns
- **Table Pattern**: DataTable component for displaying tabular data with sorting and filtering
- **Form Pattern**: Structured forms for data entry with validation
- **Modal Dialog Pattern**: Overlay windows for focused tasks
- **Responsive Design**: Adapts to different screen sizes
- **Dark/Light Mode**: Theme switching capability

## Key Technical Decisions

### Framework Selection
- **Next.js**: Chosen for its SSR capabilities, routing, and performance optimizations
- **React**: For component-based UI development
- **TypeScript**: For type safety and better developer experience

### UI Component Strategy
- **Shadcn UI**: Used for core UI components with consistent design
- **Tailwind CSS**: For styling with utility classes
- **Custom Components**: Built on top of base components for specialized functionality

### State Management
- **React Hooks**: useState and useEffect for component state
- **Custom Hooks**: Domain-specific hooks (useAuth, useCards, etc.)
- **Context API**: For global state like authentication

### Data Access
- **API Client**: Custom API client for backend communication
- **Services**: Domain-specific services (cardService, deckService)

## Component Relationships
- **Layout Components**: Provide structure (PageLayout)
- **Feature Components**: Implement specific features (CardAddModal, DataTable)
- **UI Components**: Basic building blocks (Button, Alert, Dialog)

## Algorithm Integration
- FSRS (Free Spaced Repetition Scheduler) algorithm drives the card scheduling
- Card states track review timing and performance metrics 