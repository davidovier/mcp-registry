# Contributing to MCP Registry

Thank you for your interest in contributing to MCP Registry! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building something together.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/mcp-registry.git`
3. Install dependencies: `pnpm install`
4. Create a branch for your changes

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

| Prefix      | Purpose           | Example              |
| ----------- | ----------------- | -------------------- |
| `feat/`     | New features      | `feat/user-profiles` |
| `fix/`      | Bug fixes         | `fix/login-redirect` |
| `docs/`     | Documentation     | `docs/api-guide`     |
| `refactor/` | Code refactoring  | `refactor/auth-flow` |
| `test/`     | Adding tests      | `test/api-routes`    |
| `chore/`    | Maintenance tasks | `chore/update-deps`  |

### Creating a Branch

```bash
# Start from main
git checkout main
git pull origin main

# Create your branch
git checkout -b feat/your-feature-name
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                                         |
| ---------- | --------------------------------------------------- |
| `feat`     | A new feature                                       |
| `fix`      | A bug fix                                           |
| `docs`     | Documentation changes                               |
| `style`    | Code style changes (formatting, semicolons, etc.)   |
| `refactor` | Code changes that neither fix bugs nor add features |
| `perf`     | Performance improvements                            |
| `test`     | Adding or updating tests                            |
| `chore`    | Maintenance tasks, dependency updates               |
| `ci`       | CI/CD configuration changes                         |

### Examples

```bash
# Good commit messages
feat(auth): add GitHub OAuth login
fix(api): handle empty search query
docs(readme): update deployment instructions
test(health): add API response tests
chore(deps): update Next.js to 15.1.6

# With body
feat(search): implement full-text search

- Add Postgres full-text search
- Create search API endpoint
- Add search results page

Closes #123
```

## Code Quality

### Before Committing

The pre-commit hook will automatically run:

1. ESLint on staged `.ts` and `.tsx` files
2. Prettier formatting
3. TypeScript type checking

### Manual Checks

```bash
# Run all checks
pnpm lint && pnpm typecheck && pnpm test

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `pnpm test`
2. Run the build: `pnpm build`
3. Test E2E if applicable: `pnpm test:e2e`
4. Update documentation if needed
5. Rebase on latest main if necessary

### PR Title

Use the same format as commit messages:

```
feat(component): add new feature
fix(api): resolve issue with endpoint
```

### PR Description

Include:

- **What**: Brief description of changes
- **Why**: Motivation and context
- **How**: Implementation approach (if complex)
- **Testing**: How you tested the changes
- **Screenshots**: For UI changes

### Template

```markdown
## Description

Brief description of what this PR does.

## Related Issue

Closes #123

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
```

## Review Process

1. All PRs require at least one approval
2. CI must pass (lint, typecheck, tests, build)
3. Resolve all review comments
4. Squash and merge to main

## File Organization

### Where to Put Code

| Type         | Location               |
| ------------ | ---------------------- |
| Pages/Routes | `app/`                 |
| API Routes   | `app/api/`             |
| Components   | `components/`          |
| Utilities    | `lib/`                 |
| Unit Tests   | `__tests__/`           |
| E2E Tests    | `e2e/`                 |
| Types        | Co-located or `types/` |

### Component Structure

```tsx
// components/my-component.tsx

import { type FC } from "react";

interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onClick }) => {
  return <div onClick={onClick}>{title}</div>;
};
```

## Styling Guidelines

- Use Tailwind CSS utility classes
- Avoid inline styles
- Keep class lists readable (use template literals for long lists)
- Follow mobile-first responsive design

## Testing Guidelines

### Unit Tests

- Test component behavior, not implementation
- Use meaningful test descriptions
- Keep tests focused and isolated

```tsx
describe("MyComponent", () => {
  it("renders the title", () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### E2E Tests

- Test critical user flows
- Use semantic locators (role, label, text)
- Keep tests independent

## Questions?

Open an issue or start a discussion. We're happy to help!
