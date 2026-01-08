# Contributing to SA-DASH

Thank you for your interest in contributing to the Situation Awareness Dashboard! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Reporting Bugs

Before creating a bug report:
- **Check existing issues** to avoid duplicates
- **Use the latest version** to ensure the bug still exists
- **Gather information** about your environment (browser, OS, version)

When creating a bug report, include:
- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Browser console errors** if any
- **Environment details** (browser version, OS)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:
- **Check existing issues** to see if already suggested
- **Provide clear use case** for the enhancement
- **Describe the expected behavior** in detail
- **Explain why this would be useful** to most users

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the code style guidelines
3. **Test your changes** using the provided test files
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

## 💻 Development Setup

### Prerequisites
- Node.js 18+ (for testing and development tools)
- Modern web browser
- Git

### Setup Steps

1. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/sa-dash.git
   cd sa-dash
   ```

2. **Install dependencies (optional):**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   # or
   python3 -m http.server 8000
   ```

4. **Open in browser:**
   ```
   http://localhost:8000
   ```

### Running Tests

**Node.js validation:**
```bash
npm run test
```

**Browser tests:**
```bash
npm run test:browser
```

## 📝 Code Style Guidelines

### JavaScript

- **Use ES6 modules** with explicit imports/exports
- **Follow existing patterns** for consistency
- **Use meaningful variable names** (no single letters except loops)
- **Add comments** for complex logic or non-obvious code
- **Avoid global variables** - use module scope
- **Handle errors gracefully** with try-catch blocks
- **Use async/await** for asynchronous operations
- **Keep functions focused** - single responsibility principle

#### Example:
```javascript
// Good
export async function fetchMarketData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch market data:', error);
        return [];
    }
}

// Avoid
export function getData() {
    fetch(url).then(r => r.json()).then(d => window.data = d);
}
```

### HTML

- **Use semantic HTML5 elements**
- **Include ARIA labels** for accessibility
- **Keep structure clean** and well-indented
- **Avoid inline styles** - use CSS classes

### CSS

- **Follow existing naming conventions**
- **Use CSS variables** for colors and common values
- **Keep selectors specific** but not overly nested
- **Group related styles** together
- **Add comments** for complex layouts or animations

## 🏗️ Architecture Guidelines

### Module Organization

Each module should have a clear, single responsibility:

- **constants.js** - Static configuration and data arrays
- **utils.js** - Pure utility functions, no side effects
- **data.js** - Data fetching and transformation
- **map.js** - Core map rendering logic
- **layers.js** - Map layer management
- **panels.js** - Panel visibility and settings
- **renderers.js** - UI rendering functions
- **intelligence.js** - Analysis and correlation algorithms
- **monitors.js** - Custom monitor system
- **popups.js** - Popup management and display
- **main.js** - Application orchestration

### Adding a New Feature

1. **Identify the appropriate module** for your feature
2. **Export new functions** with clear names
3. **Import in main.js** if needed for orchestration
4. **Update constants.js** if adding configuration
5. **Add UI elements** in index.html if needed
6. **Style in styles.css** following existing patterns
7. **Test thoroughly** with test files
8. **Update README.md** to document the feature

### Adding a New Data Source

1. **Add to data.js** as a new fetch function
2. **Handle errors** with try-catch
3. **Transform data** to consistent format
4. **Add to main.js** refresh cycle
5. **Create renderer** in renderers.js
6. **Add panel** to index.html
7. **Update constants.js** with panel config

## 🧪 Testing Requirements

Before submitting a PR:

- ✅ Run `npm run test` - all tests pass
- ✅ Open `test-modules.html` - browser tests pass
- ✅ Manual testing in browser - feature works as expected
- ✅ Check console - no errors or warnings
- ✅ Test in multiple browsers - Chrome, Firefox, Safari
- ✅ Check mobile responsiveness - if UI changes made

## 📚 Documentation

When adding features:
- Update **README.md** with usage information
- Add **inline comments** for complex code
- Update **JSDoc comments** if applicable
- Create **examples** in code comments

## 🔀 Git Workflow

### Branching Strategy

- `main` - Stable, production-ready code
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/topic` - Documentation updates
- `refactor/area` - Code refactoring

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, etc.)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Maintenance tasks

Examples:
```
feat(map): add satellite imagery layer
fix(data): handle RSS feed timeout errors
docs(readme): add deployment instructions
refactor(intelligence): optimize correlation algorithm
```

## 🚫 What NOT to Submit

- Changes to `.gitignore` for personal tools
- Dependencies without clear justification
- Breaking changes without discussion
- Code that doesn't pass tests
- Large formatting changes mixed with features
- Binary files (images, etc.) without issue discussion
- Credentials, API keys, or sensitive data

## 📞 Getting Help

- **GitHub Issues** - Ask questions or report problems
- **GitHub Discussions** - General questions and ideas
- **Code Comments** - Leave questions in PR comments

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in commit messages

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SA-DASH! 🚀
