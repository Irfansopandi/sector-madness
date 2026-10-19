import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/checkout/", "/dashboard/", "/account/"],
      },
    ],
    sitemap: "https://www.sectormadness.com/sitemap.xml",
  };
}
