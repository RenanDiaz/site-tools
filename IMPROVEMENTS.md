# Site Tools - Planned Improvements

This document tracks potential enhancements and features to add to the Site Tools application.

## 🚨 Critical Issues

### Fix Incomplete Features
- [ ] **Token Generator** - Currently shows only a stub with no implementation
  - Location: [src/components/TokenGen.tsx](src/components/TokenGen.tsx)
  - Needs: Full implementation with token generation logic
  - Priority: HIGH (it's in the navigation but doesn't work)

### Security Fixes
- [ ] **Fix XSS vulnerability in SVGToJSX**
  - Location: [src/components/SVGToJSX.tsx:124](src/components/SVGToJSX.tsx#L124)
  - Issue: Uses `dangerouslySetInnerHTML` without sanitization
  - Priority: HIGH

- [ ] **Add input sanitization for IFramer**
  - Location: [src/components/IFramer.tsx](src/components/IFramer.tsx)
  - Issue: User-provided URLs loaded without validation
  - Priority: MEDIUM

## 🔥 High-Value New Tools

### Text & Encoding Tools
- [ ] **Base64 Encoder/Decoder**
  - Convert to/from Base64 encoding
  - Copy to clipboard
  - File upload support for encoding files

- [ ] **Hash Generator**
  - Support: MD5, SHA-1, SHA-256, SHA-512
  - Hash text input or files
  - Compare hashes
  - Copy individual or all hashes

- [ ] **JWT Decoder**
  - Decode JWT tokens to view header/payload
  - Display expiration time (human-readable)
  - Validation status indicator
  - Works with Token Generator feature

- [ ] **URL Encoder/Decoder**
  - Encode/decode URL components
  - Full URL encoding or component-only mode
  - Copy to clipboard

- [ ] **HTML Entity Encoder/Decoder**
  - Convert special characters to/from HTML entities
  - Batch conversion

### Data Transformation Tools
- [ ] **CSV to JSON Converter**
  - Parse CSV with header detection
  - Preview output
  - Download as JSON file
  - Handles quoted fields and escaped commas

- [ ] **YAML to JSON Converter**
  - Parse YAML configuration files
  - Syntax highlighting
  - Error reporting

- [ ] **XML to JSON Converter**
  - Parse XML to JSON structure
  - Attribute handling options
  - Pretty print output

- [ ] **JSON Schema Validator**
  - Validate JSON against schemas
  - Error highlighting with line numbers
  - Common schema templates

- [ ] **JSON Path Query Tool**
  - Test JSON path expressions
  - Visual path builder
  - Results highlighting

### Web Development Utilities
- [ ] **Color Converter**
  - Convert between HEX, RGB, RGBA, HSL, HSLA
  - Color picker interface
  - Copy in any format
  - Color palette generator

- [ ] **Timestamp Converter**
  - Unix timestamp ↔ ISO 8601 ↔ human-readable
  - Current timestamp quick copy
  - Timezone support
  - Relative time calculation

- [ ] **Regex Tester**
  - Test patterns against text
  - Live match highlighting
  - Capture groups display
  - Common patterns library
  - Flags support (g, i, m, s, u, y)

- [ ] **UUID/GUID Generator**
  - Generate v4 UUIDs (we already have the uuid package!)
  - Bulk generation
  - NIL/Max UUID options
  - Copy to clipboard

- [ ] **QR Code Generator**
  - Generate QR codes from text/URLs
  - Adjustable size
  - Download as PNG
  - Custom colors

### Code Tools
- [ ] **Code Minifier/Beautifier**
  - Support: JavaScript, CSS, HTML
  - Configurable indentation
  - Before/after comparison
  - File upload support

- [ ] **String Case Converter**
  - camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE
  - Title Case, Sentence case
  - Copy each format individually

- [ ] **Text Diff Viewer**
  - Side-by-side or inline diff
  - Line-by-line comparison
  - Syntax highlighting
  - Ignore whitespace option

- [ ] **Lorem Ipsum Generator**
  - Paragraphs, sentences, or words
  - Configurable count
  - Copy or download

- [ ] **Markdown Preview**
  - Live preview while typing
  - GitHub-flavored markdown
  - Export to HTML

## 🎨 UX Enhancements

### Navigation & Discovery
- [ ] **Tool Search/Filter**
  - Quick search in navigation menu
  - Keyboard shortcut to open (Cmd/Ctrl + K)
  - Fuzzy search support

- [ ] **Favorites System**
  - Star frequently used tools
  - Favorites section in nav
  - Persist to LocalStorage

- [ ] **Recent Tools**
  - Track last 5-10 accessed tools
  - Quick access section
  - Clear history option

- [ ] **Keyboard Shortcuts**
  - Global shortcuts (Cmd/Ctrl + K for search)
  - Per-tool shortcuts (Cmd/Ctrl + Enter to execute)
  - Shortcuts help modal (? key)
  - Visual indicators for shortcuts

### File Operations
- [ ] **File Upload Support**
  - Drag-and-drop zones
  - File picker button
  - Apply to tools where appropriate (Base64, Hash, etc.)

- [ ] **Batch Processing**
  - Process multiple inputs at once
  - Bulk operations for applicable tools
  - Progress indicators

- [ ] **Export/Import Settings**
  - Export all LocalStorage data
  - Import saved settings
  - Reset to defaults option

### Visual Improvements
- [ ] **Light/Dark Theme Toggle**
  - Currently dark-only
  - Add light theme option
  - Persist preference
  - System preference detection

- [ ] **Loading States**
  - Add to all async operations
  - Consistent loading UI
  - Skeleton screens where appropriate

- [ ] **Toast Notifications**
  - Success/error feedback
  - Copy confirmations
  - Replace current tooltip system

## 🛠️ Existing Tool Improvements

### IFramer Enhancements
- [ ] Add device size presets (iPhone, iPad, various desktop sizes)
- [ ] Custom headers configuration
- [ ] Authentication options
- [ ] Screenshot capture
- [ ] History of loaded URLs

### SignalR Notifier Enhancements
- [ ] Message history display
- [ ] Receive and display incoming messages
- [ ] Custom method name configuration
- [ ] Connection status improvements
- [ ] Export message logs

### URL Composer Enhancements
- [ ] URL validation with visual feedback
- [ ] Decode mode (parse existing URLs)
- [ ] URL templates/presets
- [ ] Import from browser history

### JSON Tools Enhancements
- [ ] JSON path query capability
- [ ] Schema validation
- [ ] Syntax highlighting
- [ ] Collapsible tree view
- [ ] Search within JSON

### SVG to JSX Enhancements
- [ ] Component name customization
- [ ] Props interface generation
- [ ] Size optimization options
- [ ] SVG sprite sheet support

## 📱 Progressive Enhancement

### PWA Features
- [ ] Service worker implementation
- [ ] Offline support
- [ ] Install prompt
- [ ] Update notifications
- [ ] Cache management

### Performance
- [ ] Code splitting per route
- [ ] Lazy loading components
- [ ] Bundle size optimization
- [ ] Performance monitoring

## 🔒 Technical Improvements

### Error Handling
- [ ] Implement React Error Boundaries
- [ ] Consistent error UI across tools
- [ ] Error logging/reporting
- [ ] Graceful degradation

### Input Validation
- [ ] Form validation library integration
- [ ] Real-time validation feedback
- [ ] Input sanitization utilities
- [ ] XSS prevention measures

### Code Quality
- [ ] Add unit tests for utility functions
  - Test LocalStorage wrapper
  - Test useRevertableState hook
  - Test data transformation functions

- [ ] Add component tests
  - Test each tool component
  - Test navigation and routing
  - Test error states

- [ ] Add E2E tests
  - Test critical user flows
  - Test tool integrations

- [ ] JSDoc comments
  - Document all components
  - Document utility functions
  - Document props interfaces

### Accessibility
- [ ] Add ARIA labels to interactive elements
- [ ] Keyboard navigation testing
- [ ] Screen reader compatibility
- [ ] Focus management
- [ ] Color contrast compliance
- [ ] Skip links

### Developer Experience
- [ ] Contributing guidelines
- [ ] Component documentation
- [ ] Changelog
- [ ] Issue templates
- [ ] Pull request templates

## 🚀 Future Considerations

### Advanced Features
- [ ] User accounts (optional)
- [ ] Cloud sync of settings
- [ ] Collaborative features
- [ ] API for tool automation
- [ ] Browser extension version

### Analytics
- [ ] Usage analytics (privacy-focused)
- [ ] Most used tools tracking
- [ ] Error tracking
- [ ] Performance metrics

### Integrations
- [ ] GitHub integration (gist export)
- [ ] Clipboard API enhancements
- [ ] Share URLs with pre-filled data

## 📊 Priority Matrix

### Immediate (Next Sprint)
1. Implement Token Generator
2. Fix XSS vulnerability in SVGToJSX
3. Add Base64 Encoder/Decoder
4. Add JWT Decoder
5. Implement tool search/filter

### Short Term (1-2 months)
1. Add Hash Generator
2. Add Color Converter
3. Add Timestamp Converter
4. Implement favorites system
5. Add keyboard shortcuts
6. Implement error boundaries

### Medium Term (3-6 months)
1. Add remaining data transformation tools
2. Implement PWA features
3. Add comprehensive testing
4. Light theme support
5. File upload support
6. Batch processing

### Long Term (6+ months)
1. Advanced integrations
2. Cloud sync features
3. Browser extension
4. Mobile app consideration
5. Public API

---

## Notes

- Each tool should follow the existing patterns:
  - Copy to clipboard functionality
  - LocalStorage persistence where appropriate
  - Consistent dark theme styling
  - Responsive design
  - Clear error messages

- Maintain the current architecture:
  - Components in `src/components/`
  - Utilities in `src/utility/`
  - Routes in `App.tsx`
  - Bootstrap + custom SCSS theming

- Consider bundle size when adding dependencies
- Prioritize developer tools that fill common needs
- Keep the UI simple and focused on functionality
