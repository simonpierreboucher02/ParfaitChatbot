import Exa from "exa-js";

export interface ExaCrawledPage {
  url: string;
  title: string;
  content: string;
}

function extractText(result: any): string {
  // Try multiple fields where Exa might return text content
  if (result.text && typeof result.text === 'string') {
    return result.text;
  }
  
  // Check if contents array exists
  if (result.contents && Array.isArray(result.contents) && result.contents.length > 0) {
    const firstContent = result.contents[0];
    if (firstContent.text && typeof firstContent.text === 'string') {
      return firstContent.text;
    }
  }
  
  return "";
}

export async function exaCrawlWebsite(url: string, maxPages: number = 10): Promise<ExaCrawledPage[]> {
  const apiKey = process.env.EXA_API_KEY;
  
  if (!apiKey) {
    throw new Error("EXA_API_KEY not configured. Please add your Exa API key to continue.");
  }

  const exa = new Exa(apiKey);
  const results: ExaCrawledPage[] = [];

  try {
    console.log(`Exa crawling: ${url}`);

    // Extract domain from URL for better results
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // First, try crawling the specific URL directly with livecrawl
    try {
      console.log(`Attempting direct crawl of: ${url}`);
      const directResult = await exa.getContents(
        [url],
        {
          text: { maxCharacters: 50000 },
        },
        { livecrawl: "always" }
      );

      console.log(`Direct result received:`, {
        hasResults: !!directResult.results,
        count: directResult.results?.length || 0
      });

      if (directResult.results && directResult.results.length > 0) {
        const result = directResult.results[0];
        const text = extractText(result);
        
        console.log(`Extracted text length: ${text.length}`);
        
        if (text.length > 100) {
          results.push({
            url: result.url,
            title: result.title || "Untitled",
            content: text,
          });
          console.log(`✓ Exa crawled main page: ${result.title} (${text.length} chars)`);
        } else {
          console.warn(`Insufficient content from main page (${text.length} chars)`);
        }
      }
    } catch (directError: any) {
      console.warn(`Direct crawl failed: ${directError.message}`);
    }

    // Then, search for related pages on the same domain
    if (results.length < maxPages) {
      try {
        console.log(`Searching for pages on domain: ${domain}`);
        const searchResults = await exa.searchAndContents(
          `site:${domain}`,
          {
            type: "keyword",
            numResults: Math.min(maxPages - results.length, 9),
            text: { maxCharacters: 50000 },
          }
        );

        console.log(`Search results received:`, {
          hasResults: !!searchResults.results,
          count: searchResults.results?.length || 0
        });

        if (searchResults.results && searchResults.results.length > 0) {
          for (const result of searchResults.results) {
            // Skip if we already have this URL
            if (results.some(r => r.url === result.url)) {
              console.log(`Skipping duplicate URL: ${result.url}`);
              continue;
            }
            
            const text = extractText(result);
            console.log(`Page ${result.url}: ${text.length} chars`);
            
            if (text.length > 100) {
              results.push({
                url: result.url,
                title: result.title || "Untitled",
                content: text,
              });
              console.log(`✓ Exa crawled: ${result.title} (${text.length} chars)`);
            }
          }
        }
      } catch (searchError: any) {
        console.warn(`Search crawl failed: ${searchError.message}`);
      }
    }

    if (results.length === 0) {
      throw new Error("No content could be extracted from any pages. The website may be blocking crawlers, may have no text content, or Exa cannot access it.");
    }

    console.log(`Exa crawl complete: ${results.length} pages successfully extracted`);
    return results;
  } catch (error: any) {
    console.error("Exa crawl error:", error.message);
    if (error.message.includes("EXA_API_KEY")) {
      throw error; // Re-throw config errors as-is
    }
    throw new Error(`Exa crawl failed: ${error.message}`);
  }
}
