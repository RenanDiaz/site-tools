# Site Tools

A collection of useful web development utilities built with React, TypeScript, and Vite.

## Overview

Site Tools is a comprehensive toolkit designed to simplify common web development tasks. The application provides various utilities including:

- **Cookie to JSON Converter**: Convert browser cookies to JSON format
- **JSON Parser and Formatter**: Parse and pretty print JSON data
- **SVG to JSX Converter**: Convert SVG files to React JSX components
- **URL Composer**: Build and analyze URLs with parameters
- **Token Generator**: Create secure tokens for development and testing
- **IFramer**: Test and preview embedded content
- **Image Utilities**: Image processing and optimization tools

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RenanDiaz/site-tools.git
cd site-tools
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Technology Stack

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server
- **Bootstrap**: UI components and styling (customized)
- **Styled Components**: Component-scoped CSS
- **React Router**: Navigation and routing
- **LocalForage**: Client-side storage
- **UUID**: Unique identifier generation

## Project Structure

```
site-tools/
├── src/
│   ├── components/       # React components for each utility
│   ├── utility/          # Shared utility functions and hooks
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── ...
├── public/               # Static assets
├── build/                # Build output
└── ...
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Bootstrap](https://getbootstrap.com/)
