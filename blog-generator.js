#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class BlogGenerator {
    constructor() {
        this.postsData = this.loadPostsData();
    }

    loadPostsData() {
        const dataPath = path.join(__dirname, 'data', 'posts.json');
        if (!fs.existsSync(dataPath)) {
            // Create initial posts.json if it doesn't exist
            const initialData = {
                "posts": [],
                "categories": [
                    {
                        "slug": "web-development",
                        "name": "Web Development",
                        "description": "Articles about building for the web, from beginner tutorials to advanced techniques."
                    },
                    {
                        "slug": "design",
                        "name": "Design",
                        "description": "Thoughts on user interface design, user experience, and design principles."
                    },
                    {
                        "slug": "thoughts",
                        "name": "Thoughts",
                        "description": "Personal reflections on technology, learning, and the developer experience."
                    }
                ]
            };
            
            // Create data directory if it doesn't exist
            const dataDir = path.dirname(dataPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }

    savePostsData() {
        const dataPath = path.join(__dirname, 'data', 'posts.json');
        fs.writeFileSync(dataPath, JSON.stringify(this.postsData, null, 2));
    }

    createSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // Fixed method name from generatePost to createPost
    createPost(postData) {
        const slug = this.createSlug(postData.title);
        const categoryDir = path.join(__dirname, 'posts', postData.category);
        
        // Create posts directory if it doesn't exist
        const postsDir = path.join(__dirname, 'posts');
        if (!fs.existsSync(postsDir)) {
            fs.mkdirSync(postsDir, { recursive: true });
        }
        
        // Create category directory if it doesn't exist
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }

        // Create post object
        const post = {
            id: slug,
            title: postData.title,
            slug: slug,
            category: postData.category,
            categoryName: postData.categoryName,
            date: postData.date || new Date().toISOString().split('T')[0],
            excerpt: postData.excerpt,
            tags: postData.tags || [],
            readTime: this.calculateReadTime(postData.content || ''),
            featured: postData.featured || false,
            seo: {
                description: postData.seoDescription || postData.excerpt,
                keywords: postData.keywords || postData.tags.join(', ')
            }
        };

        // Add to posts data
        this.postsData.posts.unshift(post);
        this.savePostsData();

        // Generate HTML file
        const htmlContent = this.generatePostHTML(post, postData.content || this.getDefaultContent());
        const filePath = path.join(categoryDir, `${slug}.html`);
        fs.writeFileSync(filePath, htmlContent);

        console.log(`✅ Created post: ${filePath}`);
        console.log(`📝 Updated posts.json with new post data`);
        return post;
    }

    getDefaultContent() {
        return `<p>Start writing your blog post content here...</p>

<h2>Section Heading</h2>
<p>Add your content here...</p>

<h3>Subsection</h3>
<p>More content...</p>

<p>Remember to replace this placeholder content with your actual blog post!</p>`;
    }

    calculateReadTime(content) {
        const wordsPerMinute = 200;
        const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
        const words = text.split(/\s+/).filter(word => word.length > 0).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min read`;
    }

    generatePostHTML(post, content) {
        // Create template if it doesn't exist
        const templatePath = path.join(__dirname, 'post-template.html');
        if (!fs.existsSync(templatePath)) {
            this.createPostTemplate();
        }
        
        const template = fs.readFileSync(templatePath, 'utf8');
        
        return template
            .replace(/{{TITLE}}/g, post.title)
            .replace(/{{SLUG}}/g, post.slug)
            .replace(/{{CATEGORY}}/g, post.category)
            .replace(/{{CATEGORY_NAME}}/g, post.categoryName)
            .replace(/{{DATE}}/g, this.formatDate(post.date))
            .replace(/{{EXCERPT}}/g, post.excerpt)
            .replace(/{{SEO_DESCRIPTION}}/g, post.seo.description)
            .replace(/{{KEYWORDS}}/g, post.seo.keywords)
            .replace(/{{TAGS}}/g, post.tags.map(tag => `<span class="tag">${tag}</span>`).join(''))
            .replace(/{{CONTENT}}/g, content)
            .replace(/{{READ_TIME}}/g, post.readTime);
    }

    createPostTemplate() {
        const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - Mahmoudxyz</title>
    <meta name="description" content="{{SEO_DESCRIPTION}}">
    <meta name="keywords" content="{{KEYWORDS}}">
    <meta name="author" content="Mahmoudxyz">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph -->
    <meta property="og:title" content="{{TITLE}}">
    <meta property="og:description" content="{{SEO_DESCRIPTION}}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://mahmoud.ninja/posts/{{CATEGORY}}/{{SLUG}}.html">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{{TITLE}}">
    <meta name="twitter:description" content="{{SEO_DESCRIPTION}}">
    
    <link rel="canonical" href="https://mahmoud.ninja/posts/{{CATEGORY}}/{{SLUG}}.html">
    <link rel="stylesheet" href="../../styles.css">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "{{TITLE}}",
        "description": "{{SEO_DESCRIPTION}}",
        "datePublished": "{{DATE}}",
        "dateModified": "{{DATE}}",
        "author": {
            "@type": "Person",
            "name": "Mahmoudxyz"
        },
        "publisher": {
            "@type": "Person",
            "name": "Mahmoudxyz"
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://mahmoud.ninja/posts/{{CATEGORY}}/{{SLUG}}.html"
        },
        "articleSection": "{{CATEGORY_NAME}}"
    }
    </script>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <a href="../../index.html" class="logo">Mahmoudxyz</a>
            <ul class="nav-links">
                <li><a href="../../index.html">Writing</a></li>
                <li><a href="../../search.html">Search</a></li>
                <li><a href="../../about.html">About</a></li>
            </ul>
        </nav>
    </header>

    <main class="container">
        <a href="../../index.html" class="back-link">← Back</a>
        
        <article>
            <header class="post-header">
                <h1>{{TITLE}}</h1>
                <div class="post-meta">
                    <span class="date">{{DATE}}</span>
                    <span class="category">
                        <a href="../../category-{{CATEGORY}}.html">{{CATEGORY_NAME}}</a>
                    </span>
                    <span class="read-time">{{READ_TIME}}</span>
                </div>
                <div class="post-tags">
                    {{TAGS}}
                </div>
            </header>

            <div class="post-body">
                {{CONTENT}}
            </div>
        </article>

        <nav class="post-navigation">
            <a href="../../category-{{CATEGORY}}.html" class="back-link">← More {{CATEGORY_NAME}} posts</a>
        </nav>
    </main>

    <footer class="footer">
        <p>© 2024 Mahmoudxyz</p>
    </footer>
</body>
</html>`;

        fs.writeFileSync(path.join(__dirname, 'post-template.html'), template);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// CLI Usage
if (require.main === module) {
    const generator = new BlogGenerator();
    
    const command = process.argv[2];
    
    if (command === 'create') {
        // Interactive post creation
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('🚀 Creating a new blog post...\n');
        
        const questions = [
            'Post title: ',
            'Category (web-development/design/thoughts): ',
            'Category display name: ',
            'Excerpt: ',
            'Tags (comma separated): ',
            'SEO keywords: ',
            'Featured post? (y/n): '
        ];

        let answers = [];
        let currentQuestion = 0;

        function askQuestion() {
            if (currentQuestion < questions.length) {
                rl.question(questions[currentQuestion], (answer) => {
                    answers.push(answer.trim());
                    currentQuestion++;
                    askQuestion();
                });
            } else {
                rl.close();
                
                const postData = {
                    title: answers[0],
                    category: answers[1],
                    categoryName: answers[2],
                    excerpt: answers[3],
                    tags: answers[4].split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
                    keywords: answers[5],
                    featured: answers[6].toLowerCase() === 'y',
                    content: generator.getDefaultContent()
                };

                try {
                    const post = generator.createPost(postData);
                    console.log(`\n✨ Post created successfully!`);
                    console.log(`📄 File: posts/${post.category}/${post.slug}.html`);
                    console.log(`📝 Edit the content in the HTML file to complete your post.`);
                    console.log(`🔗 URL: /posts/${post.category}/${post.slug}.html`);
                } catch (error) {
                    console.error('❌ Error creating post:', error.message);
                }
            }
        }

        askQuestion();
    } else {
        console.log(`
🔧 Blog Generator Commands:

npm run new-post         - Create a new blog post interactively
node blog-generator.js create - Same as above

Example programmatic usage:
const BlogGenerator = require('./blog-generator.js');
const generator = new BlogGenerator();
generator.createPost({
    title: "My New Post",
    category: "web-development", 
    categoryName: "Web Development",
    excerpt: "A brief description...",
    tags: ["javascript", "tutorial"],
    keywords: "javascript, programming, tutorial",
    featured: false,
    content: "<p>Your post content here...</p>"
});
        `);
    }
}

module.exports = BlogGenerator;