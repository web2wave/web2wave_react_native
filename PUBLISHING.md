# Publishing Web2Wave React Native Package

This guide explains how to make the Web2Wave React Native SDK publicly available on npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/) if you don't have one
2. **Login**: Run `npm login` in your terminal to authenticate
3. **GitHub Repository**: Set up a GitHub repository for the package (if publishing for the first time)

## Step-by-Step Publishing Process

### 1. Prepare the Package

```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

This will compile TypeScript files to JavaScript in the `lib/` directory.

### 2. Version Management

The package uses semantic versioning (major.minor.patch):

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes, backward compatible

To bump the version automatically:

```bash
make version
```

Or manually edit `package.json`:

```json
{
  "version": "1.1.2"
}
```

### 3. Test Before Publishing

```bash
# Test the build
npm run build

# Verify the package structure
npm pack

# This creates a .tgz file - you can inspect it or test it locally
```

### 4. Publish to npm

#### Option A: Using Makefile (Recommended)

```bash
make publish
```

This will:
1. Install dependencies
2. Build the package
3. Increment version number
4. Publish to npm

#### Option B: Manual Publishing

```bash
# Build the package
npm run build

# Publish to npm
npm publish
```

#### Option C: Publish with Specific Scope (if using scoped package)

If you want to publish as `@web2wave/react-native`:

1. Update `package.json`:
   ```json
   {
     "name": "@web2wave/react-native"
   }
   ```

2. Publish:
   ```bash
   npm publish --access public
   ```

### 5. Verify Publication

After publishing, verify it's available:

```bash
npm view web2wave
```

Or visit: https://www.npmjs.com/package/web2wave

## Automated Publishing (Optional)

### Using GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

### Using npm Version Command

```bash
# Bump patch version (1.1.1 → 1.1.2)
npm version patch

# Bump minor version (1.1.1 → 1.2.0)
npm version minor

# Bump major version (1.1.1 → 2.0.0)
npm version major

# Then publish
npm publish
```

## Updating the Package

1. Make your changes
2. Update `CHANGELOG.md`
3. Bump version: `make version` or `npm version patch/minor/major`
4. Build: `npm run build`
5. Publish: `npm publish`

## Troubleshooting

### Error: "You do not have permission to publish"

- Ensure you're logged in: `npm login`
- Check if the package name is already taken
- If it's a scoped package, ensure you have the correct organization permissions

### Error: "Package name must be lowercase"

- Package names must be lowercase, no uppercase letters

### Error: "Version already exists"

- Increment the version number before publishing

### Publishing Pre-release Versions

```bash
npm version 1.2.0-beta.1
npm publish --tag beta
```

Users can install with: `npm install web2wave@beta`

## Package Structure

The published package includes:
- `lib/` - Compiled JavaScript and TypeScript definitions
- `README.md` - Documentation
- `LICENSE` - License file
- `package.json` - Package metadata

Files excluded (via `.npmignore`):
- `src/` - TypeScript source files
- `example/` - Example files
- Development configuration files

## After Publishing

1. **Update Repository**: Push all changes to GitHub
2. **Create Release Tag**: 
   ```bash
   git tag v1.1.1
   git push origin v1.1.1
   ```
3. **Documentation**: Update any external documentation pointing to the package
4. **Announcement**: Announce the release to users

## Unpublishing (Emergency Only)

⚠️ **Warning**: Only unpublish within 72 hours of publishing, and only if absolutely necessary.

```bash
npm unpublish web2wave@1.1.1
```

For scoped packages:
```bash
npm unpublish @web2wave/react-native@1.1.1
```

## Best Practices

1. **Test thoroughly** before publishing
2. **Use semantic versioning** correctly
3. **Keep CHANGELOG.md** up to date
4. **Tag releases** in Git
5. **Don't unpublish** unless critical security issue
6. **Use pre-release versions** for testing (alpha, beta, rc)
