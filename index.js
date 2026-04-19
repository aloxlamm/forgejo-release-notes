const core = require("@actions/core");

async function run() {
  try {
    // Get inputs
    const forgejoUrl = core.getInput("forgejo-url");
    const owner = core.getInput("forgejo-owner");
    const repository = core.getInput("forgejo-repository");
    const releaseTag = core.getInput("release-tag");
    const forgejoToken = core.getInput("forgejo-token");

    // Log the request details
    core.info(`Fetching release notes`);
    core.info(`Tag: ${releaseTag}`);
    core.info(`URL: ${forgejoUrl}`);
    core.info(`Owner: ${owner}`);
    core.info(`Repository: ${repository}`);

    // Construct API URL
    const apiUrl = `${forgejoUrl}/api/v1/repos/${owner}/${repository}/releases/tags/${releaseTag}`;

    // Fetch release data
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${forgejoToken}`,
        Accept: "application/json",
        "User-Agent": "GitHub-Actions",
      },
    });

    // Check if request was successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch release information for tag '${releaseTag}'. HTTP ${response.status}: ${response.statusText}. Response: ${errorText}`,
      );
    }

    // Test JSON response
    try {
      await response.clone().json();
    } catch (jsonError) {
      const textResponse = await response.text();
      throw new Error(
        `Failed to parse JSON response. Response text: ${textResponse}. Original error: ${jsonError.message}`,
      );
    }
    const release = await response.json();

    // Extract and set outputs
    const body = release.body || "";
    const title = release.name || "";
    const url = release.html_url || "";
    const id = release.id || "";
    const tagName = release.tag_name || "";
    const targetCommitish = release.target_commitish || "";
    const releaseApiUrl = release.url || "";
    const uploadUrl = release.upload_url || "";
    const author = release.author?.login || "";
    const authorEmail = release.author?.email || "";
    const authorId = release.author?.id || "";
    const authorFullName = release.author?.full_name || "";
    const authorAvatarUrl = release.author?.avatar_url || "";
    const authorHtmlUrl = release.author?.html_url || "";
    const createdAt = release.created_at || "";
    const publishedAt = release.published_at || "";
    const draft = release.draft ? "true" : "false";
    const prerelease = release.prerelease ? "true" : "false";
    const hideArchiveLinks = release.hide_archive_links ? "true" : "false";
    const tarballUrl = release.tarball_url || "";
    const zipballUrl = release.zipball_url || "";
    const assetsCount = release.assets?.length || 0;
    const zipDownloadCount = release.archive_download_count?.zip || 0;
    const tarballDownloadCount = release.archive_download_count?.tar_gz || 0;
    const json = JSON.stringify(release);

    core.setOutput("json", json);
    core.setOutput("body", body);
    core.setOutput("title", title);
    core.setOutput("url", url);
    core.setOutput("id", id.toString());
    core.setOutput("tag_name", tagName);
    core.setOutput("target_commitish", targetCommitish);
    core.setOutput("api_url", releaseApiUrl);
    core.setOutput("upload_url", uploadUrl);
    core.setOutput("author", author);
    core.setOutput("author_email", authorEmail);
    core.setOutput("author_id", authorId.toString());
    core.setOutput("author_full_name", authorFullName);
    core.setOutput("author_avatar_url", authorAvatarUrl);
    core.setOutput("author_html_url", authorHtmlUrl);
    core.setOutput("created_at", createdAt);
    core.setOutput("published_at", publishedAt);
    core.setOutput("draft", draft);
    core.setOutput("prerelease", prerelease);
    core.setOutput("hide_archive_links", hideArchiveLinks);
    core.setOutput("tarball_url", tarballUrl);
    core.setOutput("zipball_url", zipballUrl);
    core.setOutput("assets_count", assetsCount.toString());
    core.setOutput("zip_download_count", zipDownloadCount.toString());
    core.setOutput("tarball_download_count", tarballDownloadCount.toString());

    core.info(
      `✅ Successfully fetched and parsed release notes for '${title}'`,
    );
    // Create collapsible section for detailed output
    core.startGroup("Response JSON");
    core.info(JSON.stringify(release));
    core.endGroup();

    core.startGroup("Parsed values");
    core.info(`ID: ${id}`);
    core.info(`Tag Name: ${tagName}`);
    core.info(`Title: ${title}`);
    core.info(`Target: ${targetCommitish}`);
    core.info(`Author: ${author} (ID: ${authorId})`);
    core.info(`Author Email: ${authorEmail}`);
    core.info(`Author Full Name: ${authorFullName}`);
    core.info(`Author Avatar: ${authorAvatarUrl}`);
    core.info(`Author Profile: ${authorHtmlUrl}`);
    core.info(`Created: ${createdAt}`);
    core.info(`Published: ${publishedAt}`);
    core.info(`Draft: ${draft}`);
    core.info(`Prerelease: ${prerelease}`);
    core.info(`Hide Archive Links: ${hideArchiveLinks}`);
    core.info(`Assets Count: ${assetsCount}`);
    core.info(
      `Downloads - Zip: ${zipDownloadCount}, Tarball: ${tarballDownloadCount}`,
    );
    core.info(`URL: ${url}`);
    core.info(`API URL: ${releaseApiUrl}`);
    core.info(`Upload URL: ${uploadUrl}`);
    core.info(`Tarball: ${tarballUrl}`);
    core.info(`Zipball: ${zipballUrl}`);
    core.info(`Body:`);
    core.info(body.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n"));
    core.endGroup();
  } catch (error) {
    core.setFailed(` ❌ Failed to fetch release notes:\n${error.message}`);
  }
}

run();
