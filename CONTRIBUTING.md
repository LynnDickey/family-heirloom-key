# Contributing to Family Heirloom Key

Thank you for your interest in contributing to Family Heirloom Key! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## 🤝 Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Hardhat
- A Web3 wallet (MetaMask recommended)

### Local Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/family-heirloom-key.git
   cd family-heirloom-key
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start local development**
   ```bash
   # Terminal 1: Start Hardhat network
   npx hardhat node

   # Terminal 2: Deploy contracts
   npx hardhat run scripts/deploy.ts --network localhost

   # Terminal 3: Start frontend
   npm run dev
   ```

## 🔄 Development Workflow

### Branch Naming Convention

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

Example: `feature/fhe-optimization`, `bugfix/inheritance-validation`

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Testing
- `chore` - Maintenance

Examples:
```
feat: add multi-chain support for Polygon
fix: resolve inheritance deadline validation bug
docs: update API documentation for v1.1.0
```

## 💻 Coding Standards

### Solidity

- Use Solidity ^0.8.24
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use NatSpec comments for all public functions
- Implement comprehensive error handling
- Gas optimization best practices

### TypeScript/React

- Use TypeScript for all new code
- Follow [React best practices](https://react.dev/learn)
- Use functional components with hooks
- Implement proper error boundaries
- Follow [TypeScript best practices](https://www.typescriptlang.org/docs/)

### General

- Write self-documenting code
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Follow security best practices

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/FamilyHeirloomKey.test.ts

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run integration tests
npx hardhat test test/FamilyHeirloomKey.integration.test.ts
```

### Test Coverage

- Unit tests for all smart contract functions
- Integration tests for complete workflows
- Frontend component tests
- Security and edge case testing

### Writing Tests

```solidity
// Example contract test
describe("FamilyHeirloomKey", function () {
  it("Should create heirloom with valid parameters", async function () {
    // Test implementation
  });
});
```

## 📝 Submitting Changes

### Pull Request Process

1. **Create a branch** from `main`
2. **Make your changes** following coding standards
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Run the test suite** to ensure everything passes
6. **Submit a pull request** with a clear description

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced
```

## 🐛 Reporting Issues

### Bug Reports

Use the [GitHub issue tracker](https://github.com/LynnDickey/family-heirloom-key/issues) to report bugs.

**Bug report template:**
- **Title**: Clear, descriptive title
- **Description**: Detailed description of the issue
- **Steps to reproduce**: Step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, wallet, network, etc.
- **Screenshots**: If applicable

### Feature Requests

For feature requests, please:
- Use a clear, descriptive title
- Provide detailed description of the proposed feature
- Explain the use case and benefits
- Consider implementation complexity

## 🔒 Security

### Reporting Security Issues

If you discover a security vulnerability, please report it privately to security@family-heirloom-key.com instead of creating a public issue.

### Security Best Practices

- Never commit private keys or sensitive data
- Use environment variables for configuration
- Follow the principle of least privilege
- Keep dependencies updated
- Run security audits before major releases

## 📚 Additional Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [React Documentation](https://react.dev)
- [Solidity Documentation](https://docs.soliditylang.org)

## 🙏 Recognition

Contributors will be recognized in:
- Repository contributors list
- Release notes
- Project documentation

Thank you for contributing to Family Heirloom Key! 🎉
