// Mini e-commerce frontend logic
// - filtering by title, category, min/max price
// - sorting (price, rating, name)
// - cart: add/remove, quantities, total

const products = [
	{id:1, title:'Wireless Headphones', price:59.99, category:'Electronics', description:'Comfortable wireless headphones with 20h battery.', rating:4.3, ratingCount:214, image:'https://picsum.photos/seed/p1/400/300'},
	{id:2, title:'Running Shoes', price:89.00, category:'Shoes', description:'Lightweight running shoes for daily training.', rating:4.7, ratingCount:492, image:'https://picsum.photos/seed/p2/400/300'},
	{id:3, title:'Coffee Mug', price:12.5, category:'Home', description:'Ceramic mug 350ml, dishwasher safe.', rating:4.1, ratingCount:78, image:'https://picsum.photos/seed/p3/400/300'},
	{id:4, title:'Smart Watch', price:129.99, category:'Electronics', description:'Track fitness, notifications and sleep.', rating:4.5, ratingCount:341, image:'https://picsum.photos/seed/p4/400/300'},
	{id:5, title:'Leather Wallet', price:39.5, category:'Accessories', description:'Genuine leather wallet with RFID protection.', rating:4.0, ratingCount:66, image:'https://picsum.photos/seed/p5/400/300'},
	{id:6, title:'Sunglasses', price:24.99, category:'Accessories', description:'UV400 protection, polarized lenses.', rating:3.9, ratingCount:44, image:'https://picsum.photos/seed/p6/400/300'},
	{id:7, title:'Desk Lamp', price:45.0, category:'Home', description:'LED desk lamp with adjustable brightness.', rating:4.2, ratingCount:128, image:'https://picsum.photos/seed/p7/400/300'},
	{id:8, title:'Yoga Mat', price:29.99, category:'Fitness', description:'Non-slip yoga mat, 6mm thickness.', rating:4.6, ratingCount:289, image:'https://picsum.photos/seed/p8/400/300'},
	{id:9, title:'Backpack', price:69.95, category:'Bags', description:'Water-resistant backpack with laptop compartment.', rating:4.4, ratingCount:215, image:'https://picsum.photos/seed/p9/400/300'},
	{id:10, title:'Bluetooth Speaker', price:49.99, category:'Electronics', description:'Portable speaker with rich sound.', rating:4.5, ratingCount:199, image:'https://picsum.photos/seed/p10/400/300'},
	{id:11, title:'Formal Shoes', price:99.99, category:'Shoes', description:'Classic formal shoes for office use.', rating:4.1, ratingCount:84, image:'https://picsum.photos/seed/p11/400/300'},
	{id:12, title:'Throw Pillow', price:15.0, category:'Home', description:'Soft throw pillow for couch or bed.', rating:3.8, ratingCount:22, image:'https://picsum.photos/seed/p12/400/300'}
];

let state = {
	search: '',
	category: 'all',
	minPrice: null,
	maxPrice: null,
	sortBy: 'default',
	cart: {} // id -> qty
};

// Utilities
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function formatPrice(v){
	return '$' + v.toFixed(2);
}

function getUniqueCategories(){
	const cats = new Set(products.map(p => p.category));
	return Array.from(cats).sort();
}

function populateCategoryOptions(){
	const sel = $('#category');
	getUniqueCategories().forEach(c => {
		const opt = document.createElement('option');
		opt.value = c;
		opt.textContent = c;
		sel.appendChild(opt);
	});
}

function applyFiltersAndSort(list){
	let out = list.filter(p => {
		if(state.search){
			const s = state.search.toLowerCase();
			if(!p.title.toLowerCase().includes(s)) return false;
		}
		if(state.category !== 'all' && p.category !== state.category) return false;
		if(state.minPrice != null && p.price < state.minPrice) return false;
		if(state.maxPrice != null && p.price > state.maxPrice) return false;
		return true;
	});

	switch(state.sortBy){
		case 'price-asc': out.sort((a,b)=>a.price-b.price); break;
		case 'price-desc': out.sort((a,b)=>b.price-a.price); break;
		case 'rating-desc': out.sort((a,b)=>b.rating-a.rating); break;
		case 'rating-count-desc': out.sort((a,b)=> (b.ratingCount||0) - (a.ratingCount||0)); break;
		case 'name-asc': out.sort((a,b)=>a.title.localeCompare(b.title)); break;
		case 'name-desc': out.sort((a,b)=>b.title.localeCompare(a.title)); break;
	}
	return out;
}
function renderProducts(){
	const container = document.querySelector('#products');
	container.innerHTML = '';
	const list = applyFiltersAndSort(products);

	if(list.length === 0){
		container.innerHTML = '<div class="col-12"><div class="alert alert-warning">No products match your filters.</div></div>';
		return;
	}

	list.forEach(p => {
		const col = document.createElement('div');
		col.className = 'col-sm-6 col-md-4 col-lg-3';

		col.innerHTML = `
			<div class="card h-100 shadow-sm">
				<img src="${p.image}" class="card-img-top product-img" alt="${p.title}">
				<div class="card-body d-flex flex-column">
					<h6 class="card-title">${p.title}</h6>
					<p class="card-text mb-1"><strong>${formatPrice(p.price)}</strong> <small class="text-muted">• ${p.category}</small></p>
					<p class="card-description">${p.description}</p>
					<div class="mt-2 small text-muted">${p.rating.toFixed(1)} ★ • ${p.ratingCount || 0} reviews</div>
					<div class="mt-auto d-flex justify-content-between align-items-center">
						<div>
							<span class="rating-stars">${'★'.repeat(Math.round(p.rating))}</span>
							<small class="text-muted"> ${p.rating.toFixed(1)}</small>
						</div>
						<div>
							<button class="btn btn-sm btn-outline-danger me-1 btn-remove" data-id="${p.id}">Remove</button>
							<button class="btn btn-sm btn-primary btn-add" data-id="${p.id}">Add</button>
						</div>
					</div>
				</div>
			</div>
		`;

		container.appendChild(col);
	});

	// attach handlers
	$$('.btn-add').forEach(b => b.addEventListener('click', (e)=>{
		addToCart(parseInt(e.currentTarget.dataset.id,10));
	}));
	$$('.btn-remove').forEach(b => b.addEventListener('click', (e)=>{
		removeFromCart(parseInt(e.currentTarget.dataset.id,10));
	}));
}

function addToCart(id){
	state.cart[id] = (state.cart[id] || 0) + 1;
	updateCartUI();
}

function removeFromCart(id){
	if(!state.cart[id]) return; // nothing
	state.cart[id]--;
	if(state.cart[id] <= 0) delete state.cart[id];
	updateCartUI();
}

function updateCartUI(){
	const cartItemsEl = $('#cart-items');
	cartItemsEl.innerHTML = '';
	const ids = Object.keys(state.cart).map(n=>parseInt(n,10));
	let total = 0;
	let count = 0;

	if(ids.length === 0){
		cartItemsEl.innerHTML = '<div class="text-muted">Cart is empty.</div>';
	} else {
		ids.forEach(id => {
			const qty = state.cart[id];
			const p = products.find(x=>x.id===id);
			if(!p) return;
			const row = document.createElement('div');
			row.className = 'd-flex align-items-center mb-2';
			row.innerHTML = `
				<img src="${p.image}" alt="" width="64" height="48" class="me-2 object-fit-cover">
				<div class="flex-grow-1">
					<div class="fw-bold">${p.title}</div>
					<div class="text-muted small">${formatPrice(p.price)} × ${qty}</div>
				</div>
				<div class="text-end">
					<div class="mb-1"><strong>${formatPrice(p.price * qty)}</strong></div>
					<div class="btn-group btn-group-sm" role="group">
						<button class="btn btn-outline-secondary btn-decr" data-id="${id}">−</button>
						<span class="btn btn-light badge badge-qty">${qty}</span>
						<button class="btn btn-outline-secondary btn-incr" data-id="${id}">+</button>
					</div>
				</div>
			`;
			cartItemsEl.appendChild(row);
			total += p.price * qty;
			count += qty;
		});

		// attach cart buttons
		$$('.btn-decr').forEach(b => b.addEventListener('click', e => removeFromCart(parseInt(e.currentTarget.dataset.id,10))));
		$$('.btn-incr').forEach(b => b.addEventListener('click', e => addToCart(parseInt(e.currentTarget.dataset.id,10))));
	}

	$('#cart-total').textContent = formatPrice(total);
	$('#cart-count').textContent = count;
}

function wireFilters(){
	$('#search').addEventListener('input', e => {
		state.search = e.target.value.trim();
		renderProducts();
	});
	$('#category').addEventListener('change', e => {
		state.category = e.target.value;
		renderProducts();
	});
	$('#minPrice').addEventListener('input', e => {
		const v = parseFloat(e.target.value);
		state.minPrice = Number.isFinite(v) ? v : null;
		renderProducts();
	});
	$('#maxPrice').addEventListener('input', e => {
		const v = parseFloat(e.target.value);
		state.maxPrice = Number.isFinite(v) ? v : null;
		renderProducts();
	});
	$('#sortBy').addEventListener('change', e => {
		state.sortBy = e.target.value;
		renderProducts();
	});
}

document.addEventListener('DOMContentLoaded', ()=>{
	populateCategoryOptions();
	wireFilters();
	renderProducts();
	updateCartUI();
	// sample checkout handler
	$('#checkout').addEventListener('click', ()=>{
		alert('Checkout not implemented in demo. Total: ' + $('#cart-total').textContent);
	});
});

