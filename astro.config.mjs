// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/schema
export default defineConfig({
	site: "https://mittenpaw.github.io",
	base: "/astro-blog-starter-template",
	integrations: [mdx(), sitemap()],
});
