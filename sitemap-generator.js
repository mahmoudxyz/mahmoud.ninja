const fs = require('fs');
const path = require('path');

class SitemapGenerator {
    constructor(baseUrl = 'https://mahmoud.ninja') {
        this.baseUrl = baseUrl;
        this.postsData = this.loadPostsData();
    }

    loadPostsData() {
        const dataPath = path.join(__dirname, 'data', 'posts.json');
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }

    generateSitemap() {
        const urls = [];

        // Add main pages
        urls.push({
            loc: this.baseUrl,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'daily',
            priority: 1.0
        });

        urls.push({
            loc: `${this.baseUrl}/about.html`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.8
        });

        urls.push({
            loc: `${this.baseUrl}/search.html`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.6
        });

        // Add category pages
        this.postsData.categories.forEach(category => {
            urls.push({
                loc: `${this.baseUrl}/category-${category.slug}.html`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'weekly',
                priority: 0.7
            });
        });

        // Add posts
        this.postsData.posts.forEach(post => {
            urls.push({
                loc: `${this.baseUrl}/posts/${post.category}/${post.slug}.html`,
                lastmod: post.date,
                changefreq: 'monthly',
                priority: 0.9
            });
        });

        const xml = this.generateXML(urls);
        fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xml);
        console.log('✅ Sitemap generated: sitemap.xml');
    }

    generateXML(urls) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        urls.forEach(url => {
            xml += '  <url>\n';
            xml += `    <loc>${url.loc}</loc>\n`;
            xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
            xml += `    <priority>${url.priority}</priority>\n`;
            xml += '  </url>\n';
        });

        xml += '</urlset>';
        return xml;
    }
}

// Generate sitemap
if (require.main === module) {
    const generator = new SitemapGenerator();
    generator.generateSitemap();
}

module.exports = SitemapGenerator;