//filter content object
const filterContent={
	category: null,
	sort: null,
	price: {
		min: null,
		max: null
	},
	search: null
}

//array of cart objects
let cart=[];
let products;
let currentPage = 1;
const itemsPerPage = 8;

// Read filter inputs, normalize values, then re-render
const categoryEl = document.querySelector('#category');
const sortEl = document.querySelector('#sortBy');
const minPriceEl = document.querySelector('#minPrice');
const maxPriceEl = document.querySelector('#maxPrice');
const searchEl = document.querySelector('#search');

// Apply filtering when Apply Filters button is clicked
const filterElement = document.querySelector('#apply-filters');
filterElement.addEventListener('click', (e) => {
    e.preventDefault();
	filterContent.category = categoryEl.value || null;
	filterContent.sort = sortEl.value || null;
	filterContent.price.min = minPriceEl.value ? parseFloat(minPriceEl.value) : null;
	filterContent.price.max = maxPriceEl.value ? parseFloat(maxPriceEl.value) : null;
	filterContent.search = searchEl.value ? searchEl.value.toLowerCase() : null;
    const filteredProducts = applyFiltersAndSort();
	currentPage = 1;  // reset to first page when filters change
	renderProducts(filteredProducts);
    });

function applyFiltersAndSort(){
	let filteredProducts = products;
	console.log('Applying filters:', filterContent);
	// Apply search filter
	if(filterContent.search){
		filteredProducts = filteredProducts.filter(p => p.title.toLowerCase().includes(filterContent.search));
	}
	// Apply category filter
	if(filterContent.category && filterContent.category !== 'all'){
		filteredProducts = filteredProducts.filter(p => p.category === filterContent.category);
	}
	// Apply price filter
	if(filterContent.price.min !== null){
		filteredProducts = filteredProducts.filter(p => p.price >= filterContent.price.min);
	}
	if(filterContent.price.max !== null){
		filteredProducts = filteredProducts.filter(p => p.price <= filterContent.price.max);
	}
	// Apply sorting
	if(filterContent.sort){
		filteredProducts = filteredProducts.sort((a, b) => {
			if(filterContent.sort === 'price-asc'){
				return a.price - b.price;
			}else if(filterContent.sort === 'price-desc'){
				return b.price - a.price;
			}
			else if(filterContent.sort === 'rating-desc'){
				return b.rating.rate - a.rating.rate;
			}
			else if(filterContent.sort === 'rating-count-desc'){
				return (b.rating.count || 0) - (a.rating.count || 0);
			}
			else if(filterContent.sort === 'name-asc'){
				return a.title.localeCompare(b.title);
			}
			else if(filterContent.sort === 'name-desc'){
				return b.title.localeCompare(a.title);
			}
			return 0;
		});
	}
	return filteredProducts;
}

//render products function (DONE) 
function renderProducts(productsData){
	const container = document.querySelector('#products');
	container.innerHTML = '';
	const list = applyFiltersAndSort();

	//pagination logic
	const totalItems = list.length;
	// calculate total pages based on itemsPerPage
	const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

	// ensure currentPage is in range
	if (currentPage > totalPages) {
		currentPage = totalPages;
	}
	if (currentPage < 1) {
		currentPage = 1;
	}

	// slice for current page (get items for current page by index from full list)
	const start = (currentPage - 1) * itemsPerPage;
	const end = start + itemsPerPage;
	const pageItems = list.slice(start, end);
	//display paginated items
	// handle no items case
	if(pageItems.length === 0){
		container.innerHTML = '<div class="col-12"><div class="alert alert-warning">No products match your filters.</div></div>';
		return;
	}

	pageItems.forEach(p => {
		const col = document.createElement('div');
		col.className = 'col-sm-6 col-md-4 col-lg-3';

		col.innerHTML = `
			<div class="card h-100 shadow-sm">
    				<img src="${p.image}" class="card-img-top product-img" alt="${p.title}">
				<div class="card-body d-flex flex-column">
					<h6 class="card-title">${p.title}</h6>
					<p class="card-text mb-1 price"><strong>${p.price}$</strong></p>
					<div class="mt-auto d-flex justify-content-center align-items-center">
						<div class="d-flex gap-2" role="group" aria-label="Actions">
							<button class="btn btn-sm btn-outline-secondary btn-view" data-id="${p.id}">View</button>
							<button class="btn btn-sm btn-primary btn-add" data-id="${p.id}">Add</button>
							<button class="btn btn-sm btn-outline-danger btn-remove" data-id="${p.id}">Remove</button>
						</div>
					</div>
				</div>
			</div>
		`;

		container.appendChild(col);
	});

	// render pagination once after rendering all page items
	renderPagination(totalPages);

	// wire view and add buttons for the currently rendered items
	const addButtons = document.querySelectorAll('.btn-add');
	addButtons.forEach(b => b.addEventListener('click', (e)=>{
		const id = parseInt(e.currentTarget.dataset.id, 10);
		console.log('Adding to cart:', id);
		addToCart(id);
	}));

	const viewButtons = document.querySelectorAll('.btn-view');
	viewButtons.forEach(b => b.addEventListener('click', (e) => {
		const id = parseInt(e.currentTarget.dataset.id, 10);
		const product = products.find(p => p.id === id);
		if (product) showProductModal(product);
	}));

	// remove button on cards: decrement or remove item from cart
	const removeButtons = document.querySelectorAll('.btn-remove');
	removeButtons.forEach(b => b.addEventListener('click', (e) => {
		const id = parseInt(e.currentTarget.dataset.id, 10);
		console.log('Removing from cart (card):', id);
		removeFromCart(id);
	}));

}

//render cart details
const cartItemsDetails = document.querySelector('#cart-items');
function renderCartDetails(){
	cartItemsDetails.innerHTML = '';
	cart.forEach(item => {
			const itemDiv = document.createElement('div');
			itemDiv.className = 'cart-item d-flex justify-content-between align-items-center mb-2';
			itemDiv.innerHTML = `
				<div>
					<strong>${item.product.title}</strong>
					<br>
					<span class="price"> ${item.product.price}$</span>
					<br>
					<span class="text-muted">Quantity: ${item.quantity}</span>
				</div>
				<div>
					<button class="btn btn-sm btn-outline-danger me-1 btn-remove" id="${item.product.id}">Remove</button>
				</div>
			`;
			cartItemsDetails.appendChild(itemDiv);
			//add remove button functionality as they are dynamically created
			cartItemsDetails.querySelectorAll('.btn-remove').forEach(b => {
			b.addEventListener('click', e => {
			const id = parseInt(e.currentTarget.id, 10);
			removeFromCart(id);
			});
		});
	});
}

//calculate total price
const cartTotalPriceEl = document.querySelector('#cart-total');
function calculateTotalPrice(){
	let total = 0;
	cart.forEach(item => {
		total += item.product.price * item.quantity;
	});
	cartTotalPriceEl.textContent = total.toFixed(2) + '$';
	return total;
}

//add to cart function (DONE)
function addToCart(productId){
	const product = products.find(p => p.id === productId);
	if(product){
		const cartItem = cart.find(p => p.product.id === product.id);
		if(cartItem){
			cartItem.quantity++;
		}else{
			cart.push({product, quantity: 1});
		}
		console.log('Added to cart:', product);
		console.log('Current cart:', cart);
		renderCartDetails();
		updateCartCount();
		calculateTotalPrice();
	}
}

//remove from cart function (DONE)
function removeFromCart(productId){
	const product = products.find(p => p.id === productId);
	const cartItem = cart.find(p => p.product.id === product.id);
	if(!cartItem) return; // not in cart
	if(cartItem){
		cartItem.quantity--;
		if(cartItem.quantity === 0){
			cart.splice(cart.indexOf(cartItem), 1);
		}
		console.log('Removed from cart:', product);
		console.log('Current cart:', cart);
	}
	renderCartDetails();
	updateCartCount();
	calculateTotalPrice();
}

//update cart count in UI (DONE)
function updateCartCount(){
	const cartCount = document.querySelector('#cart-count');
	// sum quantities of all items in the cart array (each item: { product, quantity })
	const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
	cartCount.textContent = totalQty;
}

//get unique categories (DONE)
function getUniqueCategories(productsData){
    const categories = new Set();
    productsData.forEach(p => categories.add(p.category));
    return Array.from(categories);
}

//render categories in filter dropdown (DONE)
function renderCategories(productsData){
    const container = document.querySelector('#category');
    const uniqueCategories = getUniqueCategories(productsData);
    uniqueCategories.forEach(category => {
        const categoryOption = document.createElement('option');
        categoryOption.value = category;
        categoryOption.textContent = category;
        container.appendChild(categoryOption);
    });
}

function renderPagination(totalPages){
  const container = document.querySelector('#pagination');
  container.innerHTML = '';

  if (totalPages <= 1) {
    // if only one page, optionally hide controls
    return;
  }

  // Prev button
  const prevLi = document.createElement('li');
  prevLi.className = 'page-item ' + (currentPage === 1 ? 'disabled' : '');
  prevLi.innerHTML = `<button class="page-link" data-page="${currentPage-1}" aria-label="Previous">&laquo;</button>`;
  container.appendChild(prevLi);

  // show limited number of page buttons for large counts (e.g., up to 7)
  const maxButtons = 7;
  let start = Math.max(1, currentPage - Math.floor(maxButtons/2));
  let end = Math.min(totalPages, start + maxButtons - 1);
  if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

  for (let i = start; i <= end; i++) {
    const li = document.createElement('li');
    li.className = 'page-item ' + (i === currentPage ? 'active' : '');
    li.innerHTML = `<button class="page-link" data-page="${i}">${i}</button>`;
    container.appendChild(li);
  }

  // Next button
  const nextLi = document.createElement('li');
  nextLi.className = 'page-item ' + (currentPage === totalPages ? 'disabled' : '');
  nextLi.innerHTML = `<button class="page-link" data-page="${currentPage+1}" aria-label="Next">&raquo;</button>`;
  container.appendChild(nextLi);
}

// Show product details in modal
function showProductModal(product){
	const modalEl = document.getElementById('productModal');
	if(!modalEl) return;
	const modalTitle = modalEl.querySelector('#modalTitle');
	const modalImage = modalEl.querySelector('#modalImage');
	const modalPrice = modalEl.querySelector('#modalPrice');
	const modalCategory = modalEl.querySelector('#modalCategory');
	const modalDescription = modalEl.querySelector('#modalDescription');
	const modalRating = modalEl.querySelector('#modalRating');

	modalTitle.textContent = product.title;
	modalImage.src = product.image;
	modalImage.alt = product.title;
	modalPrice.textContent = product.price + '$';
	modalCategory.textContent = ' • ' + product.category;
	modalDescription.textContent = product.description;
	modalRating.textContent = `${product.rating.rate.toFixed(1)} ★ • ${product.rating.count || 0} reviews`;

	// create/get Bootstrap modal instance and show it
	const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
	bsModal.show();

	// set up modal Add button (simple and beginner-friendly)
	const modalAddButton = modalEl.querySelector('#modalAddButton');
	// assign a single onclick handler which replaces any previous handler
	modalAddButton.onclick = () => {
		addToCart(product.id);
		bsModal.hide();
	};
}

const paginationEl = document.querySelector('#pagination');
paginationEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.page-link');
    if (!btn || !paginationEl.contains(btn)) return;
    // ignore clicks on disabled controls
    if (btn.closest('.page-item.disabled')) return;

    const page = Number(btn.dataset.page);
    if (!Number.isInteger(page)) return;

    currentPage = page;
    renderProducts(products);

    // scroll to product list
    window.scrollTo({
      top: document.querySelector('#products').offsetTop - 20,
      behavior: 'smooth'
    });
});

//fetch products and initialize 
fetch('https://fakestoreapi.com/products')
	.then(response => response.json())
	.then(data => {
		products = data;
		renderProducts(products);
        renderCategories(products);
	});
