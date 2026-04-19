# Testing the Get Release Notes Action

## Testing Methods

### 1. **Quick Local Test**

```bash
npm test
# or with custom values:
npm run test:local
```

### 2. **Manual Environment Test**

```bash
export INPUT_FORGEJO_URL="https://git.dmz.thomassauter.com"
export INPUT_FORGEJO_ORGANIZATION="thstr"
export INPUT_FORGEJO_REPOSITORY="your-repo"
export INPUT_RELEASE_TAG="v1.0.0"
export INPUT_FORGEJO_TOKEN="your-token"
export GITHUB_OUTPUT="./output.txt"

node index.js
cat output.txt  # Check outputs
```

### 3. **Using `act` (Local GitHub Actions)**

```bash
# Install act (https://github.com/nektos/act)
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash

# Create test workflow
act -j test --secret FORGEJO_TOKEN="your-token"
```

### 4. **Real Repository Test**

1. Push this action to a GitHub repository
2. Create a workflow in `.github/workflows/` that uses your action
3. Test with a real Forgejo instance and release

## Test Checklist

- [ ] Action installs dependencies successfully
- [ ] Handles valid release tags correctly
- [ ] Returns proper error messages for invalid tags
- [ ] Handles authentication failures gracefully
- [ ] All outputs (json, body, title, url) are set correctly
- [ ] Works in real GitHub Actions environment

## Example Test Values

- **URL**: `https://git.dmz.thomassauter.com`
- **Organization**: `thstr`
- **Repository**: `your-test-repo`
- **Tag**: `v1.0.0`
- **Token**: Your Forgejo personal access token
