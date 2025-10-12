# Contributing to Summer Camp Manager

Thank you for your interest in contributing to the Summer Camp Manager project!

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/camp-manager.git
   cd camp-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Make your changes**
   - Create a new branch for your feature
   - Follow the existing code style
   - Test your changes thoroughly

5. **Submit a pull request**
   - Describe your changes clearly
   - Reference any related issues
   - Ensure all tests pass

## Project Structure

```
src/
├── components/     # Reusable Vue components
├── views/          # Page components (routes)
├── stores/         # Pinia state management
├── services/       # Business logic and API calls
├── types/          # TypeScript type definitions
├── utils/          # Helper functions
├── data/           # Mock data
└── router/         # Vue Router configuration
```

## Coding Standards

### TypeScript
- Use strict type checking
- Define interfaces for all data structures
- Avoid `any` types when possible
- Use meaningful variable names

### Vue Components
- Use `<script setup>` syntax
- Extract reusable logic into composables
- Keep components focused and single-purpose
- Use TypeScript for props and emits

### Styling
- Use CSS custom properties for theming
- Follow mobile-first responsive design
- Keep styles scoped to components
- Use semantic class names

### Git Commits
- Write clear, descriptive commit messages
- Use conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

## Areas for Contribution

### High Priority
- [ ] Add unit tests with Vitest
- [ ] Implement accessibility improvements
- [ ] Add keyboard navigation
- [ ] Improve mobile responsiveness
- [ ] Add search/filter functionality

### Features
- [ ] Multi-day/week calendar view
- [ ] Event templates
- [ ] Bulk operations
- [ ] Export to PDF/Excel
- [ ] Print-friendly views
- [ ] Undo/redo functionality

### Backend (Future)
- [ ] REST API implementation
- [ ] Database schema
- [ ] Authentication system
- [ ] WebSocket for real-time updates
- [ ] File upload for photos

### UI/UX
- [ ] Dark mode
- [ ] Color scheme customization
- [ ] Animations and transitions
- [ ] Loading states
- [ ] Empty states
- [ ] Error boundaries

## Testing

Currently, the project doesn't have tests set up. If you'd like to contribute:

1. Set up Vitest for unit testing
2. Add tests for utility functions
3. Add component tests
4. Add E2E tests with Playwright or Cypress

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for functions
- Update USAGE_GUIDE.md for new features
- Keep OpenAPI schema in sync with changes

## Code Review Process

1. All changes must be reviewed by at least one maintainer
2. CI checks must pass
3. No merge conflicts
4. Follow the established patterns and conventions

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to making summer camp management easier! 🏕️

