import axios from "axios";
import * as cheerio from "cheerio";

export interface CrawledPage {
  url: string;
  title: string;
  content: string;
}

export async function crawlWebsite(url: string, maxPages: number = 10): Promise<CrawledPage[]> {
  const visited = new Set<string>();
  const toVisit: string[] = [url];
  const results: CrawledPage[] = [];
  let errors = 0;

  let baseUrl: URL;
  try {
    baseUrl = new URL(url);
  } catch (e) {
    throw new Error("Invalid URL format");
  }

  while (toVisit.length > 0 && visited.size < maxPages) {
    const currentUrl = toVisit.shift()!;
    
    if (visited.has(currentUrl)) {
      continue;
    }

    visited.add(currentUrl);

    try {
      console.log(`Crawling: ${currentUrl}`);
      
      const response = await axios.get(currentUrl, {
        timeout: 15000,
        maxRedirects: 5,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AgentiLab/1.0; +https://agentilab.com/bot)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        validateStatus: (status) => status < 500,
      });

      if (response.status >= 400) {
        console.error(`HTTP ${response.status} for ${currentUrl}`);
        errors++;
        continue;
      }

      const $ = cheerio.load(response.data);

      // Remove script, style, and nav elements
      $("script, style, nav, footer, header, iframe, noscript").remove();

      // Extract title
      const title = $("title").text().trim() || 
                   $("h1").first().text().trim() || 
                   $("meta[property='og:title']").attr("content") || 
                   "Untitled";

      // Extract main content - try multiple selectors
      let content = "";
      const selectors = ["main", "article", "[role='main']", ".content", "#content", ".main-content", "body"];
      
      for (const selector of selectors) {
        const text = $(selector).first().text().replace(/\s+/g, " ").trim();
        if (text.length > content.length) {
          content = text;
        }
      }

      // Limit content length
      content = content.slice(0, 50000);

      if (content.length > 100) {
        results.push({
          url: currentUrl,
          title: title.slice(0, 200),
          content,
        });
        console.log(`✓ Crawled: ${title} (${content.length} chars)`);
      } else {
        console.log(`✗ Skipped: ${currentUrl} (insufficient content)`);
      }

      // Extract links for further crawling
      $("a[href]").each((_, elem) => {
        const href = $(elem).attr("href");
        if (href && !href.startsWith("#") && !href.startsWith("javascript:") && !href.startsWith("mailto:")) {
          try {
            const absoluteUrl = new URL(href, currentUrl);
            
            // Only crawl same domain, avoid duplicates
            if (absoluteUrl.hostname === baseUrl.hostname && 
                !visited.has(absoluteUrl.href) &&
                !toVisit.includes(absoluteUrl.href)) {
              toVisit.push(absoluteUrl.href);
            }
          } catch (e) {
            // Invalid URL, skip
          }
        }
      });
    } catch (error: any) {
      console.error(`Error crawling ${currentUrl}:`, error.message);
      errors++;
      
      // If too many errors, stop crawling
      if (errors > 5) {
        console.error("Too many errors, stopping crawl");
        break;
      }
    }
  }

  console.log(`Crawl complete: ${results.length} pages, ${errors} errors`);
  return results;
}

export async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    switch (mimeType) {
      case "text/plain":
      case "text/csv":
        return buffer.toString("utf-8");
      
      case "application/pdf":
        const pdfParse = (await import("pdf-parse")).default;
        const pdfData = await pdfParse(buffer);
        return pdfData.text;
      
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw new Error("Failed to extract text from file");
  }
}
