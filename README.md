# Get Release Notes Action

Retrieves release notes via forgejo api for a specific tag.

## Usage

```yaml
steps:
  - name: Checkout actions
    uses: https://github.com/actions/checkout@v6
    with:
      github-server-url: https://git.dmz.thomassauter.com
      repository: thstr/forgejo-actions
      token: ${{ secrets.REPO_READER_TOKEN }}
      ref: v0.0.1 # Always specify the version tag, not a branch name
      path: ./.actions

  - name: Get relese notes
    uses: ./.actions/resolve-version
    with:
      ref-branch: "refs/heads/main" # default
```

## Inputs and Outputs

For detailed information about available inputs and outputs, refer to the [`action.yml`](action.yml) file in this directory.
