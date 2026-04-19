# Forgejo Release Notes Action

A GitHub Action that fetches comprehensive release information from a Forgejo git repository via its API. This action retrieves detailed release notes, metadata, and author information for a specified tag/release.

## Usage

### Example with Organization Repository

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
        uses: aloxlamm/forgejo-release-notes@v1
        with:
          forgejo-url: 'https://git.example.com'
          forgejo-owner: 'my-org'      # Organization name or user name
          forgejo-repository: 'my-project'
          forgejo-token: ${{ secrets.FORGEJO_TOKEN }}
          release-tag: ${{ github.ref_name }}
      
      - name: Display Results
        run: |
          echo "=== Core Release Information ==="
          echo "Title: ${{ steps.test-action.outputs.title }}"
          echo "Body: ${{ steps.test-action.outputs.body }}"
          echo "ID: ${{ steps.test-action.outputs.id }}"
          echo "Tag Name: ${{ steps.test-action.outputs.tag_name }}"
          echo "Target Commitish: ${{ steps.test-action.outputs.target_commitish }}"
          echo "URL: ${{ steps.test-action.outputs.url }}"
          echo ""
          echo "=== API URLs ==="
          echo "API URL: ${{ steps.test-action.outputs.api_url }}"
          echo "Upload URL: ${{ steps.test-action.outputs.upload_url }}"
          echo "Tarball URL: ${{ steps.test-action.outputs.tarball_url }}"
          echo "Zipball URL: ${{ steps.test-action.outputs.zipball_url }}"
          echo ""
          echo "=== Author Information ==="
          echo "Author: ${{ steps.test-action.outputs.author }}"
          echo "Author ID: ${{ steps.test-action.outputs.author_id }}"
          echo "Author Email: ${{ steps.test-action.outputs.author_email }}"
          echo "Author Full Name: ${{ steps.test-action.outputs.author_full_name }}"
          echo "Author Avatar URL: ${{ steps.test-action.outputs.author_avatar_url }}"
          echo "Author HTML URL: ${{ steps.test-action.outputs.author_html_url }}"
          echo ""
          echo "=== Timestamps ==="
          echo "Created At: ${{ steps.test-action.outputs.created_at }}"
          echo "Published At: ${{ steps.test-action.outputs.published_at }}"
          echo ""
          echo "=== Release Properties ==="
          echo "Draft: ${{ steps.test-action.outputs.draft }}"
          echo "Prerelease: ${{ steps.test-action.outputs.prerelease }}"
          echo "Hide Archive Links: ${{ steps.test-action.outputs.hide_archive_links }}"
          echo ""
          echo "=== Assets & Downloads ==="
          echo "Assets Count: ${{ steps.test-action.outputs.assets_count }}"
          echo "Zip Download Count: ${{ steps.test-action.outputs.zip_download_count }}"
          echo "Tarball Download Count: ${{ steps.test-action.outputs.tarball_download_count }}"
          echo ""
          echo "=== Complete JSON Response ==="
          echo '${{ steps.test-action.outputs.json }}'

```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `forgejo-url` | The URL of the Forgejo instance | No | `https://git.dmz.thomassauter.com` |
| `forgejo-owner` | The owner (organization or username) that owns the repository | No | `thstr` |
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

## Requirements

- Forgejo instance with API access
- Personal access token with repository read permissions
- Valid repository and tag/release

## License

This project is licensed under the MIT License - see the LICENSE file for details.
