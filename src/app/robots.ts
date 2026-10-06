import type { MetadataRoute } from "next";
import { absoluteUrl, isIndexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    // Ambientes de prévia e local não devem ser indexados.
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
