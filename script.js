document.addEventListener('DOMContentLoaded', function() {
    let allKeywords = [];
    let currentIndex = 0;
    // UBAH BATCH SIZE MENJADI 16
    const batchSize = 16;
    let isLoading = false;
    const contentContainer = document.getElementById('auto-content-container');
    const loader = document.getElementById('loader');
        
    function shuffleArray(array) { 
        for (let i = array.length - 1; i > 0; i--) { 
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; 
        } 
    }
    
    function capitalizeEachWord(str) { 
        if (!str) return ''; 
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); 
    }

    function loadKeywords() {
        fetch('keyword.txt')
            .then(response => response.text())
            .then(data => {
                allKeywords = data.split('\n').map(k => k.trim()).filter(k => k.length > 0);
                shuffleArray(allKeywords);
                loadMoreContent();
            })
            .catch(error => {
                console.error('Error loading keywords:', error);
                if(loader) loader.textContent = 'Failed to load content.';
            });
    }

    function generateSeoTitle(baseKeyword) {
        const hookWords = ['Awesome', 'Badass', 'Stunning', 'Unique', 'Creative', 'Intricate', 'Bold', 'Incredible', 'Inspiring', 'Epic']; 
        const suffixWords = ['Tattoo Ideas', 'Tattoo Designs', 'Ink Inspiration', 'Body Art', 'Tattoo Concepts'];
        const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)]; 
        const randomSuffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
        return `${randomHook} ${capitalizeEachWord(baseKeyword)} ${randomSuffix}`; 
    }

    function loadMoreContent() {
        if (isLoading || currentIndex >= allKeywords.length) return;
        isLoading = true;
        
        if (loader) {
            loader.innerHTML = '<button id="btn-loadmore" class="btn-loadmore" disabled>Loading Ink...</button>';
        }

        const fragment = document.createDocumentFragment();
        const endIndex = Math.min(currentIndex + batchSize, allKeywords.length);

        for (let i = currentIndex; i < endIndex; i++) {
            const keyword = allKeywords[i];
            const title = generateSeoTitle(keyword);
            
            // BING IMAGE SCRAPER (Optimasi resolusi 600x400 untuk Thumbnail Grid Homepage)
            const queryImage = keyword + " tattoo ideas quality";
            const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=600&h=400&c=7&rs=1&p=0&dpr=2&pid=1.7`;
            
            const slug = keyword.toLowerCase().replace(/\s+/g, '-');
            const detailUrl = `detail.html?q=${slug}`;

            const card = document.createElement('div');
            card.className = 'content-card';
            card.innerHTML = `
                <a href="${detailUrl}" style="text-decoration:none; color:inherit;">
                    <img src="${imageUrl}" alt="${title}" class="card-image" loading="lazy">
                    <div class="card-body">
                        <h2 class="card-title">${title}</h2>
                        <p class="card-desc">Discover the best ${keyword} tattoo designs to inspire your next ink session. Explore our gallery now!</p>
                        <span class="btn-readmore">View Design</span>
                    </div>
                </a>
            `;
            fragment.appendChild(card);
        }

        contentContainer.appendChild(fragment);
        currentIndex = endIndex;
        isLoading = false;

        if (loader) {
            if (currentIndex < allKeywords.length) {
                loader.innerHTML = '<button id="btn-loadmore" class="btn-loadmore">Load More Designs</button>';
                document.getElementById('btn-loadmore').addEventListener('click', loadMoreContent);
            } else {
                loader.innerHTML = '<p style="color:#888;">All designs loaded.</p>';
            }
        }
    }

    loadKeywords();
});