# Tech Context: Flashcard Review App

## Technology Stack

### Frontend Framework
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: UI component collection
- **Framer Motion**: Animation library
- **clsx/tailwind-merge**: Utility for conditional CSS

### Data Management & Utilities
- **Tanstack React Table**: Table management library
- **Radix UI**: Low-level UI primitives
- **Lucide React**: Icon library

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Static type checking

## Development Environment

### Development Server
```bash
npm run dev
```
- Runs on port 3001 (configured in package.json)
- Uses Next.js development server

### Build Process
```bash
npm run build
npm start
```
- Builds optimized production version
- Starts production server

### Environment Configuration
- `.env.development`: Development environment variables
- `.env.production`: Production environment variables

## Key Dependencies

### Core Dependencies
```json
{
  "next": "15.2.1",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5"
}
```

### UI Dependencies
```json
{
  "@radix-ui/react-*": "Various UI primitives",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "framer-motion": "^12.5.0",
  "lucide-react": "^0.477.0",
  "tailwind-merge": "^3.0.2",
  "tailwindcss-animate": "^1.0.7"
}
```

### Data Management
```json
{
  "@tanstack/react-table": "^8.21.2"
}
```

## Architecture Constraints

### Browser Compatibility
- Modern browsers supported (Chrome, Firefox, Safari, Edge)
- No explicit IE support

### Responsive Design
- Mobile-first approach
- Support for various screen sizes (mobile, tablet, desktop)

### Authentication
- User account-based system
- Login required for most features

### API Integration
- Custom API client for backend communication
- RESTful service pattern

## Technical Debt & Considerations
- Ensuring accessibility compliance (WCAG standards)
- Optimizing bundle size for performance
- Implementing proper error handling throughout the application
- Managing state across complex user flows
- Ensuring data synchronization with backend 