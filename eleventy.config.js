import { EleventyI18nPlugin } from '@11ty/eleventy';
import yaml from 'js-yaml';
import Image from '@11ty/eleventy-img';
import CleanCSS from "clean-css";
import { minify } from "terser";
import { eleventyImageOnRequestDuringServePlugin } from "@11ty/eleventy-img";
import path from 'path';

async function getProducts() {
    const productsModule = await import("./src/_data/products.mjs");
    return await productsModule.default();
}

export const config = {
    dir: {
        input: 'src',
        output: 'dist'
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    templateFormats: ['njk', 'md', 'html'],
    pathPrefix: '/',
    langs: { default: 'fr', others: ['en'] }
};

export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy('src/_assets/icons');
    eleventyConfig.addPassthroughCopy('src/_assets/404.jpg');
    eleventyConfig.addPassthroughCopy({ 'src/robots.txt': '/robots.txt' });
    eleventyConfig.addPassthroughCopy({ 'src/_headers': '/_headers' });

    eleventyConfig.addPlugin(eleventyImageOnRequestDuringServePlugin);
    
    eleventyConfig.addPlugin(EleventyI18nPlugin, {
        defaultLanguage: 'fr',
        errorMode: 'never'
    });

    eleventyConfig.addDataExtension('yaml, yml', (contents) =>
        yaml.load(contents)
    );

    eleventyConfig.addFilter("excerptFromDescription", function(description) {
        if (!description) return "";
        const separator = "<!--more-->";
        const parts = description.split(separator);
        return parts[0];
    });

    eleventyConfig.addFilter('customLocaleUrl', function (path, lang) {
        if (lang === config.langs.default) {
            return path.replace(/^\/(fr|en)/, '');
        }

        for (let otherLang of config.langs.others) {
            const langPattern = new RegExp(`^/${otherLang}`);

            if (langPattern.test(path)) {
                return path;
            }
        }

        return `/${lang}${path}`;
    });

    eleventyConfig.addFilter("formatPrice", (price, lang) => {
        const priceFixed = parseFloat(price).toFixed(2)
        return (lang === "fr") ? priceFixed.replace('.', ',') : priceFixed
    });

    eleventyConfig.addFilter("sortCountries", (countries, lang) => {
        return countries.sort((a, b) => {
            return a[lang].localeCompare(b[lang]);
        });
    });

    eleventyConfig.addFilter("with", function (str, vars) {
        return str.replace(/{{\s*([\w]+)\s*}}/g, function (match, p1) {
            return vars[p1] || match;
        });
    });

    eleventyConfig.addFilter("cssmin", function (code) {
		return new CleanCSS({}).minify(code).styles;
	});

    eleventyConfig.addNunjucksAsyncFilter("jsmin", async (code, callback) => {
        try {
          const minified = await minify(code);
          return callback(null, minified.code);
        } catch (err) {
          console.error("Error during terser minify:", err);
          return callback(err, code);
        }
      });

    eleventyConfig.addCollection("products", async function () {
        const data = await getProducts();
        return data;
    });
    
    (async function generateTagCollections() {
        const data = await getProducts();
    
        const uniqueTags = new Set();
        data.forEach(product => {
            if (product.tags) {
                product.tags.forEach(tag => uniqueTags.add(tag));
            }
        });
    
        uniqueTags.forEach(tag => {
            eleventyConfig.addCollection(tag, () => {
                return data.filter(product => product.tags && product.tags.includes(tag));
            });
        });
    })();

    eleventyConfig.addNunjucksAsyncShortcode('image_product', async (src, cls, alt, sizes) => {
        let metadata = await Image(`${process.env.DATA_URL}photos/${src}`, {
            widths: [65, 365, 490, 750],
            formats: ['webp'],
            outputDir: './dist/img/',
            urlPath: '/img/',
            transformOnRequest: process.env.ELEVENTY_RUN_MODE === "serve",
            filenameFormat: function (id, src, width, format, options) {
                const extension = path.extname(src);
                const name = path.basename(src, extension);
                return `${name}-${width}w.${format}`;
            }
        });
    
        let imageAttributes = {
            class: cls,
            alt,
            sizes,
            loading: 'lazy',
            decoding: 'async',
        };
    
        return Image.generateHTML(metadata, imageAttributes);
    });

    eleventyConfig.addNunjucksAsyncShortcode('logo', async (src, alt, sizes) => {

        let metadata = await Image(`${process.env.DATA_URL}icons/${src}`, {
            widths: [128, 80],
            formats: ['svg'],
            outputDir: './dist/img/',
            urlPath: '/img/',
          })

        let imageAttributes = {
            alt,
            sizes,
            loading: 'lazy',
            decoding: 'async',
        };

        return Image.generateHTML(metadata, imageAttributes);
    });
}
