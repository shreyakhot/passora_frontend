/**
 * CLI Script: Submit every URL in the live sitemap to IndexNow
 * Usage: npm run indexnow
 *
 * Reads NEXT_PUBLIC_SITE_URL (falls back to https://photo-govt.com), fetches
 * `${SITE_URL}/sitemap.xml` and submits its <loc> URLs, so the list always
 * matches the pages that actually exist.
 */

function normaliseSiteUrl(raw, fallback) {
  if (!raw) return fallback;
  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return fallback;
  }
}

const SITE_URL = normaliseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, "https://photo-govt.com");
const INDEXNOW_KEY = "0c3dc5e8833b46beb209705aa05e5683";
const INDEXNOW_HOST = new URL(SITE_URL).host;
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

async function fetchSitemapUrls() {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  console.log(`🗺️  Fetching ${sitemapUrl}...`);
  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    throw new Error(`Sitemap request failed with status ${response.status}`);
  }
  const xml = await response.text();
  const urls = Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g), (m) =>
    m[1].replace(/&amp;/g, "&")
  );
  // IndexNow rejects URLs that do not belong to the submitted host.
  const sameHost = urls.filter((u) => {
    try {
      return new URL(u).host === INDEXNOW_HOST;
    } catch {
      return false;
    }
  });
  return Array.from(new Set(sameHost));
}

async function run() {
  console.log(`🚀 Preparing IndexNow submission for ${INDEXNOW_HOST}...`);
  console.log(`🔑 Key: ${INDEXNOW_KEY}`);
  console.log(`📄 Key Location: ${INDEXNOW_KEY_LOCATION}`);

  let allUrls;
  try {
    allUrls = await fetchSitemapUrls();
  } catch (err) {
    console.error(`❌ Could not read the sitemap:`, err.message);
    process.exitCode = 1;
    return;
  }

  if (allUrls.length === 0) {
    console.error(`❌ The sitemap contained no URLs for ${INDEXNOW_HOST}. Nothing to submit.`);
    process.exitCode = 1;
    return;
  }

  console.log(`🌐 Submitting ${allUrls.length} URLs to IndexNow protocol...`);

  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: allUrls,
  };

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Sending POST to ${endpoint}...`);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      if (response.status === 200 || response.status === 202) {
        console.log(`✅ SUCCESS: Search engines accepted ${allUrls.length} URLs via ${endpoint}!`);
      } else {
        const text = await response.text();
        console.warn(`⚠️ Warning: Status ${response.status}:`, text);
      }
    } catch (err) {
      console.error(`❌ Error submitting to ${endpoint}:`, err.message);
    }
  }

  console.log(`\n🎉 IndexNow submission process completed!`);
}

run();
