# Contributing

Thanks for considering a contribution. This is a Next.js + TypeScript site: portfolio pages, MDX content, and a Groq chat API.

## Project Structure

```text
.
├── public/                 static assets (images, fonts)
├── src/
│   ├── app/                App Router pages and /api/chat/stream
│   ├── components/         UI by area (chat, landing, journey, projects, ui)
│   ├── config/             site copy and metadata
│   ├── content/            MDX for blog, projects, journey
│   ├── hooks/
│   ├── lib/                helpers, including lib/chat
│   ├── server/             private profile used only on the server
│   └── types/
├── deploy/cpanel/          LiteSpeed / Passenger deploy files
└── server.js               Next.js production server
```

## Naming Conventions

### Files and Directories

- Use **PascalCase** for:
  - React components: `BlogCard.tsx`
  - Type definitions: `Project.ts`
  - Component directories: `BlogComponents/`

- Use **camelCase** for:
  - Utility functions: `formatDate.ts`
  - Hooks: `useMobile.ts`
  - Configuration files: `chatPrompt.ts`

### Components

- Component files should be named using PascalCase and include the `.tsx` extension
- Each component should have its own file
- Group related components in a directory named after the feature

Example:

```tsx
// Good
components / blog / BlogCard.tsx;
components / common / Navbar.tsx;

// Bad
components / blog / blogcard.tsx;
components / common / nav - bar.tsx;
```

### Hooks

- Custom hooks should start with `use` and use camelCase
- Each hook should have its own file

Example:

```tsx
// Good
hooks / useMobile.ts;
hooks / useScrollPosition.ts;

// Bad
hooks / mobile.ts;
hooks / UseScroll.ts;
```

## Styling Conventions

- Use Tailwind CSS classes for styling
- Follow mobile-first approach
- Use CSS variables for theme colors (defined in globals.css)
- Maintain consistent spacing using Tailwind's spacing scale

Example:

```tsx
// Good
<div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">

// Bad
<div style={{ marginTop: '16px', color: '#374151' }}>
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define interfaces and types in separate files under `src/types/`
- Use explicit type annotations for function parameters and returns

Example:

```tsx
// types/project.ts
interface Project {
  title: string;
  description: string;
  tags: string[];
}

// components/projects/ProjectCard.tsx
const ProjectCard = ({ project }: { project: Project }): JSX.Element => {
  // ...
};
```

### React Components

- Use functional components with hooks
- Props should be typed using interfaces
- Use destructuring for props
- Keep components focused and single-responsibility

Example:

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button = ({
  label,
  onClick,
  variant = 'primary',
}: ButtonProps): JSX.Element => {
  // ...
};
```

## Content Guidelines

### Blog Posts

- Place MDX files in `src/content/blog/`
- Use kebab-case for file names: `my-blog-post.mdx`
- Include required frontmatter:
  ```mdx
  ---
  title: 'My Blog Post'
  description: 'A brief description'
  date: '2024-03-20'
  tags: ['nextjs', 'react']
  ---
  ```

### Projects

- Place MDX files in `src/content/projects/`
- Use kebab-case for file names: `my-project.mdx`
- Include required frontmatter:
  ```mdx
  ---
  title: 'My Project'
  description: 'Project description'
  date: '2024-03-20'
  tags: ['react', 'typescript']
  github: 'https://github.com/...'
  live: 'https://...'
  ---
  ```

## Git Workflow

1. Fork the repository
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Commit using conventional commits:
   ```bash
   # Format: <type>(<scope>): <description>
   feat(blog): add new blog component
   fix(contact): resolve form submission issue
   ```
5. Push to your fork
6. Create a Pull Request

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Testing

- just run `bun run build` if build is successful only then push it.

## Documentation

- Update README.md if adding new features
- Document new components with JSDoc comments
- Update type definitions when adding/modifying interfaces
- Keep configuration examples up to date

## Questions

If you have questions about contributing, please:

1. Check existing issues
2. Create a new issue with the `question` label
3. Join our community discussions

Thank you for contributing to Sleek Portfolio! 🎉
