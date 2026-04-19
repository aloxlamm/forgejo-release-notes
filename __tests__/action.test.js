const mockCore = {
  getInput: jest.fn(),
  setOutput: jest.fn(),
  info: jest.fn(), 
  startGroup: jest.fn(),
  endGroup: jest.fn(),
  setFailed: jest.fn()
};

// Mock @actions/core before any requires
jest.mock('@actions/core', () => mockCore);

// Mock fetch globally
global.fetch = jest.fn();

describe('Forgejo Release Notes Action - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    // Clear module cache to ensure fresh requires
    jest.resetModules();
  });

  afterEach(() => {
    jest.resetModules();
  });

  const validReleaseData = {
    id: 123,
    tag_name: 'v1.0.0',
    name: 'Test Release',
    body: 'Release notes',
    html_url: 'https://git.example.com/releases/123',
    target_commitish: 'main',
    url: 'https://example.com/api/release',
    upload_url: 'https://example.com/upload',
    tarball_url: 'https://example.com/tarball',
    zipball_url: 'https://example.com/zipball', 
    draft: false,
    prerelease: false,
    hide_archive_links: false,
    created_at: '2026-04-18T12:00:00Z',
    published_at: '2026-04-18T12:00:00Z',
    author: {
      id: 456,
      login: 'testuser',
      email: 'test@example.com', 
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      html_url: 'https://example.com/testuser'
    },
    assets: [],
    archive_download_count: { zip: 5, tar_gz: 3 }
  };

  function waitForAction() {
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  test('successfully executes with valid inputs', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-owner': 'owner',
        'forgejo-repository': 'repo', 
        'release-tag': 'v1.0.0',
        'forgejo-token': 'token123'
      };
      return inputs[key] || '';
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validReleaseData),
      clone: () => ({ json: () => Promise.resolve(validReleaseData) })
    });

    // Require the action after setting up mocks
    require('../index.js');
    await waitForAction();

    expect(fetch).toHaveBeenCalledWith(
      'https://git.example.com/api/v1/repos/owner/repo/releases/tags/v1.0.0',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'token token123'
        })
      })
    );
    expect(mockCore.setFailed).not.toHaveBeenCalled();
    expect(mockCore.setOutput).toHaveBeenCalledWith('json', expect.any(String));
  });

  test('handles missing forgejo-url input', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-owner': 'owner',
        'forgejo-repository': 'repo', 
        'release-tag': 'v1.0.0',
        'forgejo-token': 'token123'
        // Missing 'forgejo-url'
      };
      return inputs[key] || '';
    });

    require('../index.js');
    await waitForAction();

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("Input 'forgejo-url' is required")
    );
  });

  test('handles missing forgejo-owner input', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-repository': 'repo', 
        'release-tag': 'v1.0.0',
        'forgejo-token': 'token123'
        // Missing 'forgejo-owner'
      };
      return inputs[key] || '';
    });

    require('../index.js');
    await waitForAction();

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("Input 'forgejo-owner' is required")
    );
  });

  test('handles missing forgejo-repository input', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-owner': 'owner',
        'release-tag': 'v1.0.0',
        'forgejo-token': 'token123'
        // Missing 'forgejo-repository'
      };
      return inputs[key] || '';
    });

    require('../index.js');
    await waitForAction();

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("Input 'forgejo-repository' is required")
    );
  });

  test('handles missing release-tag input', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-owner': 'owner',
        'forgejo-repository': 'repo',
        'forgejo-token': 'token123'
        // Missing 'release-tag'
      };
      return inputs[key] || '';
    });

    require('../index.js');
    await waitForAction();

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("Input 'release-tag' is required")
    );
  });

  test('handles missing forgejo-token input', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-owner': 'owner',
        'forgejo-repository': 'repo',
        'release-tag': 'v1.0.0'
        // Missing 'forgejo-token'
      };
      return inputs[key] || '';
    });

    require('../index.js');
    await waitForAction();

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("Input 'forgejo-token' is required")
    );
  });

  test('handles 401 Unauthorized error', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-owner': 'owner',
        'forgejo-repository': 'repo', 
        'release-tag': 'v1.0.0',
        'forgejo-token': 'invalid-token'
      };
      return inputs[key] || '';
    });

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve('{"message": "Invalid token"}')
    });

    require('../index.js');
    await waitForAction();

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("Failed to fetch release information for tag 'v1.0.0'. HTTP 401: Unauthorized")
    );
  });

  test('handles 404 Not Found error', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-owner': 'owner',
        'forgejo-repository': 'repo', 
        'release-tag': 'nonexistent-tag',
        'forgejo-token': 'token123'
      };
      return inputs[key] || '';
    });

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve('{"message": "Release not found"}')
    });

    require('../index.js');
    await waitForAction();

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("Failed to fetch release information for tag 'nonexistent-tag'. HTTP 404: Not Found")
    );
  });

  test('handles network fetch failure', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-owner': 'owner',
        'forgejo-repository': 'repo', 
        'release-tag': 'v1.0.0',
        'forgejo-token': 'token123'
      };
      return inputs[key] || '';
    });

    fetch.mockRejectedValueOnce(new Error('Network request failed'));

    require('../index.js');
    await waitForAction();

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch release notes')
    );
    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Network request failed')
    );
  });

  test('handles invalid JSON response', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-owner': 'owner',
        'forgejo-repository': 'repo', 
        'release-tag': 'v1.0.0',
        'forgejo-token': 'token123'
      };
      return inputs[key] || '';
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      clone: () => ({
        json: () => Promise.reject(new Error('Unexpected token in JSON'))
      }),
      text: () => Promise.resolve('Invalid JSON response'),
      json: () => Promise.reject(new Error('Unexpected token in JSON'))
    });

    require('../index.js');
    await waitForAction();

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Failed to parse JSON response')
    );
  });

  test('successfully extracts all output values from complete release data', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-owner': 'owner',
        'forgejo-repository': 'repo', 
        'release-tag': 'v1.0.0',
        'forgejo-token': 'token123'
      };
      return inputs[key] || '';
    });

    const completeReleaseData = {
      id: 123,
      tag_name: 'v1.0.0',
      name: 'Test Release',
      body: 'Release notes content',
      html_url: 'https://git.example.com/releases/123',
      target_commitish: 'main',
      url: 'https://example.com/api/release',
      upload_url: 'https://example.com/upload',
      tarball_url: 'https://example.com/tarball',
      zipball_url: 'https://example.com/zipball',
      draft: true,
      prerelease: false,
      hide_archive_links: true,
      created_at: '2026-04-18T12:00:00Z',
      published_at: '2026-04-18T12:00:00Z',
      author: {
        id: 456,
        login: 'testuser',
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        html_url: 'https://example.com/testuser'
      },
      assets: [
        { name: 'asset1.zip' },
        { name: 'asset2.tar.gz' }
      ],
      archive_download_count: {
        zip: 10,
        tar_gz: 5
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(completeReleaseData),
      clone: () => ({ json: () => Promise.resolve(completeReleaseData) })
    });

    require('../index.js');
    await waitForAction();

    // Verify all outputs are set correctly
    expect(mockCore.setOutput).toHaveBeenCalledWith('json', JSON.stringify(completeReleaseData));
    expect(mockCore.setOutput).toHaveBeenCalledWith('body', 'Release notes content');
    expect(mockCore.setOutput).toHaveBeenCalledWith('title', 'Test Release');
    expect(mockCore.setOutput).toHaveBeenCalledWith('url', 'https://git.example.com/releases/123');
    expect(mockCore.setOutput).toHaveBeenCalledWith('id', '123');
    expect(mockCore.setOutput).toHaveBeenCalledWith('tag_name', 'v1.0.0');
    expect(mockCore.setOutput).toHaveBeenCalledWith('target_commitish', 'main');
    expect(mockCore.setOutput).toHaveBeenCalledWith('api_url', 'https://example.com/api/release');
    expect(mockCore.setOutput).toHaveBeenCalledWith('upload_url', 'https://example.com/upload');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author', 'testuser');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_email', 'test@example.com');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_id', '456');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_full_name', 'Test User');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_avatar_url', 'https://example.com/avatar.jpg');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_html_url', 'https://example.com/testuser');
    expect(mockCore.setOutput).toHaveBeenCalledWith('created_at', '2026-04-18T12:00:00Z');
    expect(mockCore.setOutput).toHaveBeenCalledWith('published_at', '2026-04-18T12:00:00Z');
    expect(mockCore.setOutput).toHaveBeenCalledWith('draft', 'true');
    expect(mockCore.setOutput).toHaveBeenCalledWith('prerelease', 'false');
    expect(mockCore.setOutput).toHaveBeenCalledWith('hide_archive_links', 'true');
    expect(mockCore.setOutput).toHaveBeenCalledWith('tarball_url', 'https://example.com/tarball');
    expect(mockCore.setOutput).toHaveBeenCalledWith('zipball_url', 'https://example.com/zipball');
    expect(mockCore.setOutput).toHaveBeenCalledWith('assets_count', '2');
    expect(mockCore.setOutput).toHaveBeenCalledWith('zip_download_count', '10');
    expect(mockCore.setOutput).toHaveBeenCalledWith('tarball_download_count', '5');

    expect(mockCore.setFailed).not.toHaveBeenCalled();
  });

  test('handles minimal release data with missing optional fields', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-owner': 'owner',
        'forgejo-repository': 'repo', 
        'release-tag': 'v1.0.0',
        'forgejo-token': 'token123'
      };
      return inputs[key] || '';
    });

    const minimalReleaseData = {
      id: 123,
      tag_name: 'v1.0.0',
      // Missing most optional fields to test fallback values
      draft: false,
      prerelease: false,
      hide_archive_links: false
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(minimalReleaseData),
      clone: () => ({ json: () => Promise.resolve(minimalReleaseData) })
    });

    require('../index.js');
    await waitForAction();

    // Verify fallback values are used
    expect(mockCore.setOutput).toHaveBeenCalledWith('body', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('title', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('url', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('target_commitish', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('api_url', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('upload_url', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_email', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_id', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_full_name', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_avatar_url', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_html_url', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('created_at', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('published_at', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('draft', 'false');
    expect(mockCore.setOutput).toHaveBeenCalledWith('prerelease', 'false');
    expect(mockCore.setOutput).toHaveBeenCalledWith('hide_archive_links', 'false');
    expect(mockCore.setOutput).toHaveBeenCalledWith('tarball_url', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('zipball_url', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('assets_count', '0');
    expect(mockCore.setOutput).toHaveBeenCalledWith('zip_download_count', '0');
    expect(mockCore.setOutput).toHaveBeenCalledWith('tarball_download_count', '0');

    expect(mockCore.setFailed).not.toHaveBeenCalled();
  });

  test('handles release data with null author', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-owner': 'owner',
        'forgejo-repository': 'repo', 
        'release-tag': 'v1.0.0',
        'forgejo-token': 'token123'
      };
      return inputs[key] || '';
    });

    const releaseWithNullAuthor = {
      id: 123,
      tag_name: 'v1.0.0',
      name: 'Test Release',
      author: null,
      draft: false,
      prerelease: true,
      hide_archive_links: false
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(releaseWithNullAuthor),
      clone: () => ({ json: () => Promise.resolve(releaseWithNullAuthor) })
    });

    require('../index.js');
    await waitForAction();

    // Verify author fields handle null gracefully
    expect(mockCore.setOutput).toHaveBeenCalledWith('author', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_email', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_id', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_full_name', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_avatar_url', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('author_html_url', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('prerelease', 'true');

    expect(mockCore.setFailed).not.toHaveBeenCalled();
  });

  test('handles release data with falsy id and tag_name values', async () => {
    mockCore.getInput.mockImplementation((key) => {
      const inputs = {
        'forgejo-url': 'https://git.example.com',
        'forgejo-owner': 'owner',
        'forgejo-repository': 'repo', 
        'release-tag': 'v1.0.0',
        'forgejo-token': 'token123'
      };
      return inputs[key] || '';
    });

    const releaseWithFalsyValues = {
      id: null, // Falsy id to test || "" fallback
      tag_name: '', // Empty string to test || "" fallback
      name: 'Test Release',
      draft: false,
      prerelease: false,
      hide_archive_links: false
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(releaseWithFalsyValues),
      clone: () => ({ json: () => Promise.resolve(releaseWithFalsyValues) })
    });

    require('../index.js');
    await waitForAction();

    // Verify fallback values are used for falsy id and tag_name
    expect(mockCore.setOutput).toHaveBeenCalledWith('id', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('tag_name', '');
    expect(mockCore.setOutput).toHaveBeenCalledWith('title', 'Test Release');

    expect(mockCore.setFailed).not.toHaveBeenCalled();
  });
});