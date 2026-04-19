# Forgejo Release Notes Action

A GitHub Action that fetches comprehensive release information from a Forgejo git repository via its API. This action retrieves detailed release notes, metadata, and author information for a specified tag/release.

## Usage

### Basic Example

```yaml
name: Get Release Notes
on:
  workflow_dispatch:
    inputs:
      tag:
        description: 'Release tag to fetch'
        required: true

jobs:
  fetch-release:
    runs-on: ubuntu-latest
    steps:
      - name: Get Release Notes
        id: release
        uses: your-org/forgejo-release-notes@v1
        with:
          forgejo-repository: 'my-awesome-app'
          forgejo-token: ${{ secrets.FORGEJO_TOKEN }}
          release-tag: ${{ github.event.inputs.tag }}
      
      - name: Display Release Info
        run: |
          echo "Release Title: ${{ steps.release.outputs.title }}"
          echo "Release Notes:"
          echo "${{ steps.release.outputs.body }}"
```

### Advanced Example with Custom Forgejo Instance

```yaml
name: Deploy Release
on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Get Release Notes
        id: release
        uses: your-org/forgejo-release-notes@v1
        with:
          forgejo-url: 'https://git.example.com'
          forgejo-organization: 'my-org'
          forgejo-repository: 'my-project'
          forgejo-token: ${{ secrets.FORGEJO_TOKEN }}
          release-tag: ${{ github.ref_name }}
      
      - name: Create Deployment Notification
        run: |
          echo "Deploying ${{ steps.release.outputs.title }}"
          echo "Released: ${{ steps.release.outputs.published_at }}"
          echo "Author: ${{ steps.release.outputs.author_full_name }}"
          echo "Release URL: ${{ steps.release.outputs.url }}"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `forgejo-url` | The URL of the Forgejo instance | No | `https://git.dmz.thomassauter.com` |
| `forgejo-organization` | The organization in Forgejo where the repository is located | No | `thstr` |
| `forgejo-repository` | The repository in Forgejo where the application is located | **Yes** | - |
| `forgejo-token` | A personal access token for authenticating with the Forgejo API | **Yes** | - |
| `release-tag` | The tag or release for which to fetch the release notes | **Yes** | - |

### Setting up Forgejo Token

1. Go to your Forgejo instance
2. Navigate to Settings → Applications → Generate New Token
3. Create a token with `repo` permissions
4. Add it as a secret in your GitHub repository: `FORGEJO_TOKEN`

## Outputs

### Core Release Information
| Output | Description |
|--------|-------------|
| `json` | Complete JSON response from the Forgejo API |
| `body` | Release notes body/description |
| `title` | Release title/name |
| `url` | HTML URL to the release page |
| `id` | Release ID number |
| `tag_name` | Git tag name |
| `target_commitish` | Target branch or commit |

### API and Download URLs
| Output | Description |
|--------|-------------|
| `api_url` | API URL for the release |
| `upload_url` | URL for uploading release assets |
| `tarball_url` | URL to download source as tarball |
| `zipball_url` | URL to download source as zip |

### Author Information
| Output | Description |
|--------|-------------|
| `author` | Release author username |
| `author_email` | Release author email address |
| `author_id` | Release author ID number |
| `author_full_name` | Release author full name |
| `author_avatar_url` | Release author avatar image URL |
| `author_html_url` | Release author profile URL |

### Metadata and Statistics
| Output | Description |
|--------|-------------|
| `created_at` | Release creation timestamp |
| `published_at` | Release publication timestamp |
| `draft` | Whether the release is a draft (`true`/`false`) |
| `prerelease` | Whether the release is a prerelease (`true`/`false`) |
| `hide_archive_links` | Whether archive links are hidden (`true`/`false`) |
| `assets_count` | Number of release assets |
| `zip_download_count` | Number of zip downloads |
| `tarball_download_count` | Number of tarball downloads |

## Error Handling

The action provides detailed error messages for common issues:

- **Invalid credentials**: Check your `forgejo-token`
- **Repository not found**: Verify `forgejo-organization` and `forgejo-repository`
- **Tag not found**: Ensure the `release-tag` exists in the repository
- **Network issues**: Check `forgejo-url` and network connectivity

## Requirements

- Forgejo instance with API access
- Personal access token with repository read permissions
- Valid repository and tag/release

## License

This project is licensed under the MIT License - see the LICENSE file for details.
