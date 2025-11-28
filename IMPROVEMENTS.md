# Site Tools - Planned Improvements

This document tracks potential enhancements and features to add to the Site Tools application.

## 🚨 Critical Issues

### Fix Incomplete Features
- [x] **Token Generator** - ~~Currently shows only a stub with no implementation~~
  - Location: [src/components/TokenGen.tsx](src/components/TokenGen.tsx)
  - COMPLETED: Implemented with multiple token types (alphanumeric, hex, base64, etc.), configurable length and count

### Security Fixes
- [x] **Fix XSS vulnerability in SVGToJSX**
  - Location: [src/components/SVGToJSX.tsx](src/components/SVGToJSX.tsx)
  - COMPLETED: Added DOMPurify sanitization with SVG profile before rendering preview
  - Priority: HIGH

- [ ] **Add input sanitization for IFramer**
  - Location: [src/components/IFramer.tsx](src/components/IFramer.tsx)
  - Issue: User-provided URLs loaded without validation
  - Priority: MEDIUM

## 🔥 High-Value New Tools

### Text & Encoding Tools
- [x] **Base64 Encoder/Decoder**
  - COMPLETED: Encode/decode with UTF-8 support, swap input/output, real-time conversion
  - Location: [src/components/Base64.tsx](src/components/Base64.tsx)

- [x] **Hash Generator**
  - COMPLETED: SHA-1, SHA-256, SHA-384, SHA-512 using Web Crypto API, real-time hashing, copy individual or all
  - Location: [src/components/HashGenerator.tsx](src/components/HashGenerator.tsx)

- [x] **JWT Decoder**
  - COMPLETED: Decode header/payload, expiration display with status badge, timestamp formatting
  - Location: [src/components/JWTDecoder.tsx](src/components/JWTDecoder.tsx)

- [x] **URL Encoder/Decoder**
  - COMPLETED: Encode/decode with real-time conversion, swap input/output
  - Location: [src/components/URLEncoder.tsx](src/components/URLEncoder.tsx)

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
- [x] **Color Converter**
  - COMPLETED: Convert between HEX, RGB, RGBA, HSL, HSLA with color picker, alpha slider, live preview
  - Location: [src/components/ColorConverter.tsx](src/components/ColorConverter.tsx)

- [x] **Timestamp Converter**
  - COMPLETED: Unix (sec/ms) ↔ ISO 8601 ↔ UTC ↔ local, live current time, relative time, "Use Now" button
  - Location: [src/components/TimestampConverter.tsx](src/components/TimestampConverter.tsx)

- [x] **Regex Tester**
  - COMPLETED: Test patterns with live match highlighting, capture groups (numbered and named), all regex flags (g, i, m, s, u)
  - Location: [src/components/RegexTester.tsx](src/components/RegexTester.tsx)

- [x] **UUID/GUID Generator**
  - COMPLETED: Generate v4 UUIDs with multiple formats (lowercase, uppercase, no hyphens, braces), bulk generation
  - Location: [src/components/UUIDGenerator.tsx](src/components/UUIDGenerator.tsx)

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

- [x] **String Case Converter**
  - COMPLETED: 12 case formats (camelCase, PascalCase, snake_case, kebab-case, etc.), real-time conversion
  - Location: [src/components/StringCaseConverter.tsx](src/components/StringCaseConverter.tsx)

- [ ] **Text Diff Viewer**
  - Side-by-side or inline diff
  - Line-by-line comparison
  - Syntax highlighting
  - Ignore whitespace option

- [ ] **Lorem Ipsum Generator**
  - Paragraphs, sentences, or words
  - Configurable count
  - Copy or download

- [x] **Markdown Preview**
  - COMPLETED: Live preview, GitHub-flavored markdown, split/edit/preview modes, copy HTML, DOMPurify sanitization
  - Location: [src/components/MarkdownPreview.tsx](src/components/MarkdownPreview.tsx)

## 🎨 UX Enhancements

### Navigation & Discovery
- [x] **Tool Search/Filter**
  - COMPLETED: Search input in navigation menu, auto-focus on open, filters tools in real-time
  - Location: [src/components/Layout.tsx](src/components/Layout.tsx)

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
