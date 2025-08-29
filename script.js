// --- KONFIGURASI ---
const BLOG_ID = '8460589087246299360'; // Ganti dengan Blog ID kamu
const API_KEY = 'AIzaSyAMVYNjwqJn8msXdSdsX1qxXfokNFrBoUc'; // Ganti dengan API Key kamu
// --------------------

const productGrid = document.getElementById('product-grid');

// Fungsi utama untuk mengambil dan menampilkan produk
async function fetchProducts() {
    const apiUrl = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?key=${API_KEY}&fetchImages=true&maxResults=20`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        productGrid.innerHTML = ''; // Kosongkan loader

        if (data.items && data.items.length > 0) {
            data.items.forEach(post => {
                const product = parseProductData(post);
                // Hanya tampilkan produk jika datanya valid & punya link afiliasi
                if (product && product.affiliateLink) {
                    productGrid.appendChild(createProductCard(product));
                }
            });
        } else {
            productGrid.innerHTML = '<div class="loader">Tidak ada produk ditemukan.</div>';
        }

    } catch (error) {
        console.error("Gagal mengambil data produk:", error);
        productGrid.innerHTML = '<div class="loader">Gagal memuat produk. Coba lagi nanti.</div>';
    }
}

// Fungsi untuk mem-parsing data dari konten post (disederhanakan)
function parseProductData(post) {
    const match = post.content.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
    if (match && match[1]) {
        try {
            const details = JSON.parse(match[1]);
            return {
                title: post.title,
                price: details.price,
                imageUrl: details.image_url,
                affiliateLink: details.affiliate_link
            };
        } catch (e) {
            console.error('Gagal parsing JSON untuk post:', post.title, e);
            return null;
        }
    }
    return null;
}

// Fungsi untuk membuat kartu produk HTML (disederhanakan)
function createProductCard(product) {
    const card = document.createElement('a');
    card.className = 'product-card';
    card.href = product.affiliateLink; // Link langsung ke produk afiliasi
    card.target = '_blank'; // Buka di tab baru
    card.rel = 'noopener noreferrer'; // Keamanan saat buka tab baru

    // Format harga ke Rupiah
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(product.price).replace(/\s/g, ''); // Hapus spasi (Rp132.050)

    // Struktur HTML untuk kartu produk
    card.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
        <div class="product-info">
            <p class="product-title">${product.title}</p>
            <span class="product-price">${formattedPrice}</span>
        </div>
    `;
    return card;
}

// Jalankan fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', fetchProducts);