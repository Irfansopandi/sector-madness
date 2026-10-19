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
    sitemap: "https://sectormadness.com/sitemap.xml",
  };
}
