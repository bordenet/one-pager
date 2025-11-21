# Scripts Directory

Automation scripts for setup, validation, testing, and development workflows.

---

## 📋 Quick Reference

| Script | Purpose | Platform |
|--------|---------|----------|
| [`setup-macos.sh`](#setup-macossh) | Development environment setup | macOS |
| [`setup-linux.sh`](#setup-linuxsh) | Development environment setup | Linux |
| [`setup-windows-wsl.sh`](#setup-windows-wslsh) | Development environment setup | Windows (WSL) |
| [`setup-windows.ps1`](#setup-windowsps1) | Development environment setup | Windows (PowerShell) |
| [`check-secrets.sh`](#check-secretssh) | Security validation and secret scanning | All Unix |
| [`integration-test.sh`](#integration-testsh) | Comprehensive integration testing | All Unix |
| [`install-hooks.sh`](#install-hookssh) | Git hooks installation and management | All Unix |
| [`validate-project.sh`](#validate-projectsh) | Project structure and configuration validation | All Unix |

---

## 🚀 Setup Scripts

### `setup-macos.sh`

**Purpose:** One-command development environment setup for macOS

**Usage:**
```bash
./scripts/setup-macos.sh [OPTIONS]
```

**Options:**
- `-y, --yes` - Auto-accept all prompts
- `-v, --verbose` - Show detailed output
- `-f, --force` - Force reinstall dependencies

**What it does:**
1. Installs Homebrew (if needed)
2. Installs Node.js and Python
3. Installs project dependencies
4. Sets up pre-commit hooks
5. Runs tests to validate setup
6. Opens application in browser

**Features:**
- ✅ Smart caching (5-10 second subsequent runs)
- ✅ Compact output with running timer
- ✅ Validates setup with quick test run

---

### `setup-linux.sh`

**Purpose:** One-command development environment setup for Linux

**Usage:**
```bash
./scripts/setup-linux.sh [OPTIONS]
```

**Options:** Same as `setup-macos.sh`

**Package Manager:** Uses `apt` (Debian/Ubuntu)

---

### `setup-windows-wsl.sh`

**Purpose:** One-command development environment setup for Windows Subsystem for Linux

**Usage:**
```bash
./scripts/setup-windows-wsl.sh [OPTIONS]
```

**Options:** Same as `setup-macos.sh`

**Requirements:** WSL with Ubuntu/Debian

---

### `setup-windows.ps1`

**Purpose:** Native Windows setup (no WSL required)

**Usage:**
```powershell
.\scripts\setup-windows.ps1 [-AutoYes] [-Verbose] [-Force]
```

**What it does:**
1. Installs Chocolatey (if needed)
2. Installs Node.js and Python via Chocolatey
3. Installs dependencies
4. Sets up pre-commit hooks
5. Runs tests
6. Opens application in browser

**Requirements:** PowerShell 5.1+ with Administrator privileges

---

## 🔒 Security & Validation Scripts

### `check-secrets.sh`

**Purpose:** Scan codebase for potential secrets and sensitive information

**Usage:**

```bash
./scripts/check-secrets.sh
```

**What it does:**
1. Scans for hardcoded passwords, API keys, tokens
2. Checks for private key files
3. Validates .gitignore patterns
4. Reports security issues with recommendations

**Features:**
- ✅ Pattern-based secret detection
- ✅ File-based secret detection
- ✅ .gitignore validation
- ✅ Security recommendations

---

### `integration-test.sh`

**Purpose:** Run comprehensive integration tests

**Usage:**

```bash
./scripts/integration-test.sh [OPTIONS]
```

**Options:**
- `--headless` - Run tests without browser UI
- `-v, --verbose` - Show detailed test output

**What it does:**
1. Runs unit tests
2. Runs linting
3. Runs E2E tests (if configured)
4. Performs application smoke tests
5. Runs security checks

---

### `install-hooks.sh`

**Purpose:** Install and configure git hooks

**Usage:**

```bash
./scripts/install-hooks.sh [OPTIONS]
```

**Options:**
- `-f, --force` - Force reinstall hooks

**Hooks installed:**
- **pre-commit** - Runs linting and tests before commit
- **pre-push** - Runs integration tests before push
- **commit-msg** - Validates commit message format

---

### `validate-project.sh`

**Purpose:** Validate project structure and configuration

**Usage:**

```bash
./scripts/validate-project.sh [OPTIONS]
```

**Options:**
- `--fix` - Attempt to fix issues automatically
- `-v, --verbose` - Show detailed output

**Validations:**
- Project structure (required files/directories)
- Package.json configuration
- Dependencies and security
- Git configuration

---

## 📁 Library Scripts

### `lib/compact.sh`

**Purpose:** Shared library for compact output formatting

**Used by:** All setup scripts

**Features:**
- Running timer in top-right corner
- In-place status updates (minimal vertical space)
- Symbols: ✓ (success), ✗ (fail), ⚠ (warn), ○ (cached)
- Verbose mode support

---

## 🔧 Development Scripts

### Python Scripts

- `evolutionary_tuner.py` - Evolutionary prompt optimization
- `llm_client.py` - LLM API client wrapper
- `prompt_simulator.py` - Prompt simulation and testing
- `quality_evaluator.py` - Quality scoring and evaluation

### Deployment

- `deploy-web.sh` - Web deployment automation

---

## 🔗 Related Documentation

- **[Development Guide](../README.md)** - Main project documentation
- **[Contributing](../CONTRIBUTING.md)** - Contribution guidelines (if exists)

---

## 💡 Usage Examples

**Quick setup (macOS):**
```bash
./scripts/setup-macos.sh
```

**Verbose setup with force reinstall:**
```bash
./scripts/setup-macos.sh -v -f
```

**Windows PowerShell setup:**
```powershell
.\scripts\setup-windows.ps1 -Verbose
```

**Performance:**
- First run: ~2-3 minutes (installs everything)
- Subsequent runs: ~5-10 seconds (checks only, skips installed)
