# Contributing to Lnky

Thank you for your interest in contributing to Lnky! This guide will help you get started with development, reporting issues, and submitting pull requests.

## Table of Contents
- [Getting Started](#getting-started)
- [Reporting Issues](#reporting-issues)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Development Guidelines](#development-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)
- [Security](#security)
- [License](#license)

## Getting Started
The best way to contribute to Lnky is by **forking** the repository and submitting a pull request.

1. **Fork the Repository**: Click the "Fork" button on the [Lnky GitHub repo](https://github.com/StanleyMasinde/Lnky/).
2. **Clone Your Fork**:
   ```sh
   git clone https://github.com/your-username/Lnky.git
   cd Lnky
   ```
3. **Install Dependencies**:
   ```sh
   pnpm install
   ```
4. **Run the Development Server**:
   ```sh
   pnpm run dev
   ```
   This will start the local development server.

## Reporting Issues
- Use [GitHub Issues](https://github.com/StanleyMasinde/Lnky/issues) to report bugs or request features.
- Provide clear steps to reproduce the issue.
- Include relevant logs, screenshots, or error messages.

## Submitting a Pull Request
1. **Fork the repository** (if you haven't already).
2. **Create a Feature Branch**:
   ```sh
   git checkout -b feature/your-feature-name
   ```
3. **Make Your Changes** and commit them with a meaningful message.
4. **Push to Your Fork**:
   ```sh
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request**: Go to the original repository and submit a PR.

## Development Guidelines
- Keep changes focused and modular.
- Write tests where applicable.
- Ensure the code builds and runs correctly before submitting.

## Code Style
- Follow the existing coding conventions.
- Use meaningful variable names and comments.
- Lint the code using ESLint:
   ```sh
   pnpm run lint
   ```

## Testing
Lnky uses **Cypress** for end-to-end (E2E) testing and **Vitest** for unit tests.

- **Run Unit Tests**:
  ```sh
  pnpm run test:unit
  ```
- **Run E2E Tests**:
  ```sh
  pnpm run test:e2e
  ```
- Ensure tests pass before submitting a pull request.

## Security
If you find a security vulnerability, do not open a public issue. Instead, email <hello@stanleymasinde.com>.

## License
By contributing, you agree that your code will be licensed under the [MIT License](LICENSE).

Happy coding! 🚀
