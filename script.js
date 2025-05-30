class BlogManager {
    constructor() {
        this.posts = [];
        this.categories = [];
        this.searchIndex = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupPage();
        this.initSearch();
        this.updateSEO();
    }

    async loadData() {
        try {
            const response = await fetch('./data/posts.json');
            const data = await response.json();
            this.posts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.categories = data.categories;
            this.buildSearchIndex();
        } catch (error) {
            console.error('Failed to load posts:', error);
        }
    }

    buildSearchIndex() {
        this.searchIndex = this.posts.map(post => ({
            id: post.id,
            title: post.title.toLowerCase(),
            excerpt: post.excerpt.toLowerCase(),
            tags: post.tags.join(' ').toLowerCase(),
            category: post.categoryName.toLowerCase(),
            url: `posts/${post.category}/${post.slug}.html`
        }));
    }

    setupPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';

        switch (page) {
            case 'index.html':
            case '':
                this.renderHomePage();
                break;
            case 'search.html':
                this.setupSearchPage();
                break;
            default:
                if (page.includes('category-')) {
                    this.renderCategoryPage();
                }
        }

        this.setActiveNav();
    }

    renderHomePage() {
        const postsContainer = document.querySelector('.posts');
        const featuredContainer = document.querySelector('.featured-posts');
        
        if (postsContainer) {
            const recentPosts = this.posts.slice(0, 5);
            postsContainer.innerHTML = recentPosts.map(post => this.createPostHTML(post)).join('');
        }

        if (featuredContainer) {
            const featured = this.posts.filter(post => post.featured);
            featuredContainer.innerHTML = featured.map(post => this.createPostHTML(post, true)).join('');
        }

        this.renderCategories();
    }

    renderCategories() {
        const categoriesContainer = document.querySelector('.categories');
        if (!categoriesContainer) return;

        const categoryHTML = this.categories.map(category => {
            const postCount = this.posts.filter(post => post.category === category.slug).length;
            return `
                <div class="category-item">
                    <h3><a href="category-${category.slug}.html">${category.name}</a></h3>
                    <p>${category.description}</p>
                    <span class="post-count">${postCount} posts</span>
                </div>
            `;
        }).join('');

        categoriesContainer.innerHTML = categoryHTML;
    }

    renderCategoryPage() {
        const categorySlug = window.location.pathname.split('-').pop().replace('.html', '');
        const category = this.categories.find(cat => cat.slug === categorySlug);
        const categoryPosts = this.posts.filter(post => post.category === categorySlug);

        document.querySelector('.category-title').textContent = category?.name || 'Category';
        document.querySelector('.category-description').textContent = category?.description || '';
        
        const postsContainer = document.querySelector('.category-posts');
        if (postsContainer) {
            postsContainer.innerHTML = categoryPosts.map(post => this.createPostHTML(post)).join('');
        }
    }

    createPostHTML(post, featured = false) {
        return `
            <article class="post-item ${featured ? 'featured' : ''}">
                <h2 class="post-title">
                    <a href="posts/${post.category}/${post.slug}.html">${post.title}</a>
                </h2>
                <div class="post-meta">
                    <span class="date">${this.formatDate(post.date)}</span>
                    <span class="category">
                        <a href="category-${post.category}.html">${post.categoryName}</a>
                    </span>
                    <span class="read-time">${post.readTime}</span>
                </div>
                <div class="post-excerpt">${post.excerpt}</div>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </article>
        `;
    }

    initSearch() {
        const searchInput = document.querySelector('.search-input');
        const searchResults = document.querySelector('.search-results');
        
        if (!searchInput) return;

        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.performSearch(e.target.value, searchResults);
            }, 300);
        });
    }

    performSearch(query, resultsContainer) {
        if (!query.trim()) {
            resultsContainer.innerHTML = '';
            return;
        }

        const results = this.searchIndex.filter(item => 
            item.title.includes(query.toLowerCase()) ||
            item.excerpt.includes(query.toLowerCase()) ||
            item.tags.includes(query.toLowerCase()) ||
            item.category.includes(query.toLowerCase())
        );

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No posts found.</p>';
            return;
        }

        const resultsHTML = results.map(result => {
            const post = this.posts.find(p => p.id === result.id);
            return this.createPostHTML(post);
        }).join('');

        resultsContainer.innerHTML = `
            <div class="results-count">${results.length} post${results.length !== 1 ? 's' : ''} found</div>
            ${resultsHTML}
        `;
    }

    setupSearchPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        
        if (query) {
            document.querySelector('.search-input').value = query;
            this.performSearch(query, document.querySelector('.search-results'));
        }
    }

    setActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
        });
    }

    updateSEO() {
        // Add structured data for blog
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Mahmoudxyz - Blog",
            "description": "Writing about web development, design, and technology",
            "url": window.location.origin,
            "author": {
                "@type": "Person",
                "name": "Mahmoudxyz"
            },
            "blogPost": this.posts.map(post => ({
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt,
                "datePublished": post.date,
                "author": {
                    "@type": "Person", 
                    "name": "Mahmoudxyz"
                },
                "url": `${window.location.origin}/posts/${post.category}/${post.slug}.html`
            }))
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }
}

// Initialize blog manager
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});

// SEO utilities
function generateMetaTags(post) {
    return `
        <title>${post.title} - Mahmoudxyz</title>
        <meta name="description" content="${post.seo.description}">
        <meta name="keywords" content="${post.seo.keywords}">
        <meta property="og:title" content="${post.title}">
        <meta property="og:description" content="${post.seo.description}">
        <meta property="og:type" content="article">
        <meta property="og:url" content="${window.location.href}">
        <meta name="twitter:card" content="summary">
        <meta name="twitter:title" content="${post.title}">
        <meta name="twitter:description" content="${post.seo.description}">
        <link rel="canonical" href="${window.location.href}">
    `;
}