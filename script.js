const productDOM = document.querySelector(".products-container");
const cartDOM = document.querySelector(".cart-modal");	
const cartContent = document.querySelector(".cart-content"); 
const itemTotals = document.querySelector(".cart-items");
const openCart = document.querySelector(".cart");
const closeCart = document.querySelector(".close-btn");
const overlay = document.querySelector(".cart-background");	
const cartTotal = document.querySelector(".cart-total");
const clearCartBtn = document.querySelector(".remove-all-btn");
let cart = [];
let buttonDOM = [];

class UI {
	displayProducts(products) {
		let results = "";
		products.forEach(({title,price,image,id})=> {
			results += `
			<div class="product">
				<div class="img-container">
					<img src=${image}>
				</div>
				<div class="product-info">
					<h1>${title}</h1>
					<div class="bottom">
						<button class="btn-add" data-id=${id}>Agregar al carrito</button>
						<div class="price">$${price}</div>
					</div>
				</div>
			</div>`;
		});
		productDOM.innerHTML = results;
	}

	getButtons() {
		const buttons = [...document.querySelectorAll(".btn-add")];
		buttonDOM = buttons;
   		console.log(buttonDOM)
		buttons.forEach(button => {
			const id = button.dataset.id;
			const inCart = cart.find(item => item.id === parseInt(id,10)); 
			
			if(inCart) {
				button.innerText = "En Carrito";
				button.disabled = true;		
			}

			button.addEventListener("click", e => {
				e.preventDefault();
				e.target.innerHTML = "En Carrito";
				e.target.disabled = true;
				
				const cartItem = {...Storage.getProduct(id), amount: 1};
				cart = [...cart, cartItem];

				Storage.saveCart(cart);
				this.setItemValues(cart);
				this.addCartItem(cartItem);
			});
		});
	}

	setItemValues(cart) {
		let tempTotal = 0;
		let itemTotal = 0;
		cart.map(item => {
			tempTotal += item.price * item.amount;
			itemTotal += item.amount;
		})
	    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
	    itemTotals.innerText = itemTotal;
	}

	addCartItem({image,price,title,id}) {
		const cartProduct = document.createElement("DIV");
		cartProduct.classList.add("cart-product");
		cartProduct.innerHTML = `
				<img src=${image}>
				<div class="product-dtl">
					<h3>${title}</h3>
					<p class="price">$${price}</p>
				</div>
				<div class="cant">
					<div class="arrow-up" data-id=${id}>
						<i class="fas fa-arrow-up"></i>
					</div>
					<p>1</p>
					<div class="arrow-down" data-id=${id}>
						<i class="fas fa-arrow-down"></i>
					</div>
				</div>
				<div class="remove-btn" data-id=${id}>
					<i class="fas fa-trash"></i>
				</div>`;
		cartContent.appendChild(cartProduct);
	}

	show() {
		cartDOM.classList.add("show");
		overlay.classList.add("show");
	}

	hide() {
		cartDOM.classList.remove("show");
		overlay.classList.remove("show");
	}

	setAPP() {
		cart = Storage.getCart();
		this.setItemValues(cart);
		this.fill(cart);

		openCart.addEventListener("click", this.show);
		closeCart.addEventListener("click", this.hide);
	}

	fill(cart) {
		cart.forEach(item => this.addCartItem(item));
	}

	cartLogic() {
		//Eliminar todo
		clearCartBtn.addEventListener("click",()=> {
			this.clearCart();
			this.hide();
		});

		//Funcionamiento del carrito
		cartContent.addEventListener("click", e => {
			const target = e.target.closest("div");
			const targetElement = target.classList.contains("remove-btn");
			if(!target) return;

			if(targetElement) {
				const id = parseInt(target.dataset.id);
				this.removeItem(id);
				cartContent.removeChild(target.parentElement); 
			} else if(target.classList.contains("arrow-up")) {
				const id = parseInt(target.dataset.id); 
				let tempItem = cart.find(item => item.id === id);
				tempItem.amount++;
				Storage.saveCart(cart);
				this.setItemValues(cart);
				target.nextElementSibling.innerText = tempItem.amount;	
			} else if (target.classList.contains("arrow-down")) {
				const id = parseInt(target.dataset.id);  
				let tempItem = cart.find(item => item.id === id);
				tempItem.amount--;
				if (tempItem.amount > 0) {
					Storage.saveCart(cart);
					this.setItemValues(cart);
					target.previousElementSibling.innerText = tempItem.amount;
				} else {
					this.removeItem(id);
					cartContent.removeChild(target.parentElement.parentElement);
				}
			}
		});
	}
	
	clearCart() {
		const cartItems = cart.map(item => item.id);
		cartItems.forEach(id => this.removeItem(id));

		while (cartContent.children.length > 0) {				
			cartContent.removeChild(cartContent.children[0])
		}
	}

	removeItem(id) {
		cart = cart.filter(item => item.id !== id);
		this.setItemValues(cart);
		Storage.saveCart(cart);
		console.log(id)

		let button = this.singleButton(id);
		button.disabled = false;
		button.innerText = "Agregar al carrito";
	}

	singleButton(id) {
		return buttonDOM.find(button => parseInt(button.dataset.id) === id);
	}
}

class Products {
	async getProducts() {
		try {
			let result = await fetch("products.json"); 
			let data = await result.json();
			let products = data.products;
			return products;
		} catch(err) {
			console.log(err);
		}
	}
}

class Storage {
	static saveProduct(obj) {
		localStorage.setItem("products", JSON.stringify(obj));
	}

	static saveCart(cart) {
		localStorage.setItem("cart", JSON.stringify(cart));
	}

	static getProduct(id) {
		const products = JSON.parse(localStorage.getItem("products"));
		return products.find(product => product.id === parseFloat(id,10))
	}

	static getCart() {
		return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	const productList = new Products();
	const ui = new UI();

	ui.setAPP();

	const products = await productList.getProducts();
	ui.displayProducts(products);
	Storage.saveProduct(products);
	ui.getButtons();
	ui.cartLogic(); 
});