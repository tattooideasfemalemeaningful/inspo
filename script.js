document.addEventListener('DOMContentLoaded', function() {
    let allKeywords = [];
    let currentIndex = 0;
    const batchSize = 15;
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
            loader.innerHTML = '<button id="btn-loadmore" class="btn-loadmore" disabled>Generating Ink...</button>';
        }

        const fragment = document.createDocumentFragment();
        const endIndex = Math.min(currentIndex + batchSize, allKeywords.length);

        for (let i = currentIndex; i < endIndex; i++) {
            const keyword = allKeywords[i];
            const title = generateSeoTitle(keyword);
            
            // Gambar Thumbnail HD AI API
            const seed = Math.floor(Math.random() * 99999);
            const queryImage = `${keyword} tattoo design, trending on artstation`;
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(queryImage)}?width=600&height=400&nologo=true&seed=${seed}`;
            
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