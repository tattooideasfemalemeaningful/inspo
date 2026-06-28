document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const keywordFromQuery = params.get('q') || '';
    
    // Menghapus angka dan tanda strip di akhir parameter URL
    const cleanQuery = keywordFromQuery.replace(/-\d+$/, '');
    
    if (!cleanQuery) {
        runAGC('');
        return;
    }

    const targetHtml = cleanQuery + '.html';

    fetch(targetHtml)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('File not found');
        })
        .then(htmlData => {
            document.open();
            document.write(htmlData);
            document.close();
        })
        .catch(error => {
            const keyword = cleanQuery.replace(/-/g, ' ').trim();
            runAGC(keyword);
        });

    // ==========================================
    // FUNGSI UTAMA AGC
    // ==========================================
    function runAGC(keyword) {
        const detailTitle = document.getElementById('detail-title');
        const detailImageContainer = document.getElementById('detail-image-container');
        const detailBody = document.getElementById('detail-body');
        const relatedPostsContainer = document.getElementById('related-posts-container');
        
        const displayedKeywords = new Set();
        if (keyword) {
            displayedKeywords.add(keyword.toLowerCase());
        }
        
        function capitalizeEachWord(str) { 
            if (!str) return ''; 
            return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); 
        }
        
        // Hook Tattoo Niche
        function generateSeoTitle(baseKeyword) { 
            const hookWords = ['Awesome', 'Badass', 'Stunning', 'Unique', 'Creative', 'Intricate', 'Bold', 'Incredible', 'Inspiring', 'Epic']; 
            const suffixWords = ['Tattoo Ideas', 'Tattoo Designs', 'Ink Inspiration', 'Body Art', 'Tattoo Concepts'];
            const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)]; 
            const randomSuffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
            return `${randomHook} ${capitalizeEachWord(baseKeyword)} ${randomSuffix}`; 
        }

        // Ambil spintax
        function fetchDescriptionTemplate(term, title) {
            fetch('deskripsi.txt')
                .then(response => response.text())
                .then(data => {
                    const templates = data.split('---').map(t => t.trim()).filter(t => t.length > 0);
                    if(templates.length > 0) {
                        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
                        let parsedText = processSpintax(randomTemplate);
                        parsedText = parsedText.replace(/%keyword%/g, `<strong>${capitalizeEachWord(term)}</strong>`);
                        
                        const htmlContent = parsedText.split('\n').map(line => `<p>${line}</p>`).join('');
                        if(detailBody) detailBody.innerHTML = htmlContent;
                    } else {
                        fallbackDescription(term);
                    }
                })
                .catch(() => fallbackDescription(term));
        }

        function fallbackDescription(term) {
            const spintaxArticleTemplate = `{Discover|Explore} the best <strong>${capitalizeEachWord(term)}</strong> {tattoo designs|ink ideas} to {inspire|elevate} your {next tattoo|body art}.`;
            if(detailBody) detailBody.innerHTML = `<p>${processSpintax(spintaxArticleTemplate)}</p>`;
        }

        function processSpintax(text) {
            const spintaxPattern = /{([^{}]+)}/g;
            while (spintaxPattern.test(text)) {
                text = text.replace(spintaxPattern, function(match, choices) {
                    const options = choices.split('|');
                    return options[Math.floor(Math.random() * options.length)];
                });
            }
            return text;
        }

        function populateMainContent(term) {
            const newTitle = generateSeoTitle(term);
            document.title = `${newTitle} | TattooVault`;
            if(detailTitle) detailTitle.textContent = newTitle;
            
            // BING IMAGE SCRAPER (Resolusi 1280x720)
            const queryImage = term + " tattoo design high quality";
            const mainImageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=1280&h=720&c=7&rs=1&p=0&dpr=2&pid=1.7`;
            
            if(detailImageContainer) {
                detailImageContainer.innerHTML = `<img src="${mainImageUrl}" alt="${newTitle}" class="main-image" loading="lazy">`;
            }
            fetchDescriptionTemplate(term, newTitle);
        }

        function populateRelatedPosts() {
            fetch('keyword.txt')
                .then(response => response.text())
                .then(data => {
                    let keywords = data.split('\n').map(k => k.trim()).filter(k => k.length > 0);
                    keywords = keywords.sort(() => 0.5 - Math.random());
                    
                    // UBAH LIMIT RELATED POST MENJADI 8
                    const maxRelated = 8;
                    let added = 0;
                    let html = '';
                    
                    for (let i = 0; i < keywords.length; i++) {
                        if (added >= maxRelated) break;
                        let k = keywords[i].toLowerCase();
                        
                        if (!displayedKeywords.has(k)) {
                            displayedKeywords.add(k);
                            const relatedTitle = generateSeoTitle(k);
                            const slug = k.replace(/\s+/g, '-');
                            const detailUrl = `detail.html?q=${slug}`;
                            
                            // BING IMAGE SCRAPER THUMBNAIL (Resolusi 600x400)
                            const thumbQuery = k + " tattoo ideas";
                            const thumbUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(thumbQuery)}&w=600&h=400&c=7&rs=1&p=0&dpr=2&pid=1.7`;
                            
                            html += `
                                <a href="${detailUrl}" class="related-post-card">
                                    <img src="${thumbUrl}" alt="${relatedTitle}" class="related-post-img" loading="lazy">
                                    <div class="related-post-title">${relatedTitle}</div>
                                </a>
                            `;
                            added++;
                        }
                    }
                    if (relatedPostsContainer) {
                        relatedPostsContainer.innerHTML = html;
                    }
                })
                .catch(err => {
                    if (relatedPostsContainer) relatedPostsContainer.innerHTML = '<p>No related tattoos found.</p>';
                });
        }

        if (keyword) {
            populateMainContent(keyword);
            populateRelatedPosts();
        } else {
            if(detailTitle) detailTitle.textContent = "Keyword Not Found";
            if(detailBody) detailBody.innerHTML = '<p>Please return to the <a href="index.html">homepage</a>.</p>';
            if(relatedPostsContainer) relatedPostsContainer.closest('.related-posts-section').style.display = 'none';
        }
    }
});
