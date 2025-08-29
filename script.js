// --- KONFIGURASI ---
const BLOG_ID = '8460589087246299360'; // Ganti dengan Blog ID kamu
const API_KEY = 'AIzaSyAMVYNjwqJn8msXdSdsX1qxXfokNFrBoUc'; // Ganti dengan API Key kamu
// --------------------

const productGrid = document.getElementById('product-grid');
const categoryMenu = document.getElementById('category-menu');
let allProducts = []; // Variabel untuk menyimpan semua produk sekali fetch

// Fungsi untuk menampilkan produk ke grid
function displayProducts(products) {
    productGrid.innerHTML = ''; // Kosongkan grid
    if (products && products.length > 0) {
        products.forEach(product => {
            productGrid.appendChild(createProductCard(product));
        });
    } else {
        productGrid.innerHTML = '<div class="loader">Tidak ada produk ditemukan di kategori ini.</div>';
    }
}

// Fungsi untuk mengambil semua produk dari Blogger
async function fetchAllProducts() {
    productGrid.innerHTML = '<div class="loader">Memuat produk...</div>';
    const apiUrl = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?key=${API_KEY}&fetchImages=true&maxResults=500`; // Ambil sampai 500 post

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            allProducts = data.items.map(post => parseProductData(post)).filter(p => p !== null);
            displayProducts(allProducts); // Tampilkan semua produk saat pertama kali load
        } else {
            productGrid.innerHTML = '<div class="loader">Belum ada produk.</div>';
        }

    } catch (error) {
        console.error("Gagal mengambil data produk:", error);
        productGrid.innerHTML = '<div class="loader">Gagal memuat produk. Coba lagi nanti.</div>';
    }
}

// Fungsi untuk mem-parsing data dari konten post
function parseProductData(post) {
    const match = post.content.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
    if (match && match[1]) {
        try {
            const details = JSON.parse(match[1]);
            return {
                title: post.title,
                price: details.price,
                imageUrl: details.image_url,
                affiliateLink: details.affiliate_link,
                categories: post.labels || [] // Ambil labels dari post
            };
        } catch (e) {
            console.error('Gagal parsing JSON untuk post:', post.title, e);
            return null;
        }
    }
    return null;
}

// Fungsi untuk membuat kartu produk HTML (Tetap Sama)
function createProductCard(product) {
    const card = document.createElement('a');
    card.className = 'product-card';
    card.href = product.affiliateLink;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(product.price).replace(/\s/g, '');

    card.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
        <div class="product-info">
            <p class="product-title">${product.title}</p>
            <span class="product-price">${formattedPrice}</span>
        </div>
    `;
    return card;
}

// ---- LOGIKA BARU UNTUK FILTER ----
categoryMenu.addEventListener('click', function(event) {
    // Cek apakah yang diklik adalah link <a>
    if (event.target.tagName === 'A') {
        event.preventDefault(); // Mencegah link pindah halaman

        // Hapus class 'active' dari semua menu
        const allMenuItems = categoryMenu.querySelectorAll('a');
        allMenuItems.forEach(item => item.classList.remove('active'));

        // Tambahkan class 'active' ke menu yang diklik
        const clickedMenu = event.target;
        clickedMenu.classList.add('active');

        // Ambil kategori dari data-attribute
        const category = clickedMenu.dataset.category;

        // Filter dan tampilkan produk
        if (category === 'all') {
            displayProducts(allProducts); // Tampilkan semua
        } else {
            const filteredProducts = allProducts.filter(product => 
                product.categories.includes(category)
            );
            displayProducts(filteredProducts);
        }
    }
});


// Jalankan fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', fetchAllProducts);