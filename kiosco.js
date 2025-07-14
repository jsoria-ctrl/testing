// --- Cargar productos y categorías dinámicamente desde la API ---

const API_URL = 'api_productos.php';; // Ajusta si mueves el archivo
let productosPorCategoria = {};
let categorias = [];
let carrito = [];
let categoriaActual = '';

// Cargar productos y categorías al iniciar
window.addEventListener('DOMContentLoaded', async () => {
    await cargarProductosYCategorias();
    cargarCarritoDeLocalStorage();
    renderizarCategorias();
    mostrarCategoria(categorias[0]?.nombre || '');
    asignarEventosFooter();
});

async function cargarProductosYCategorias() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.success) {
            productosPorCategoria = data.productos;
            categorias = data.categorias;
        } else {
            alert('Error al cargar productos: ' + (data.error || 'Desconocido'));
        }
    } catch (e) {
        alert('Error de conexión al cargar productos.');
    }
}

function renderizarCategorias() {
    const contenedor = document.querySelector('.Contenedor_Categorias');
    contenedor.innerHTML = '';
    categorias.forEach(cat => {
        const btn = document.createElement('button');
        btn.innerHTML = `<img src="Images/Iconos/Icono_${cat.nombre}.png" alt=""><p>${cat.nombre}</p>`;
        btn.onclick = () => mostrarCategoria(cat.nombre);
        contenedor.appendChild(btn);
    });
}

function mostrarCategoria(nombre) {
    categoriaActual = nombre;
    document.getElementById('Nombre_Categoria_Seleccionada').innerText = nombre;
    const contenedor = document.getElementById('Contenedor_Productos');
    contenedor.className = 'Categoria'; // Usar la clase de grilla original
    contenedor.innerHTML = '';
    const productos = productosPorCategoria[nombre] || [];
    productos.forEach(prod => {
        const div = document.createElement('div');
        div.className = 'Producto';
        div.innerHTML = `
            <img src="${prod.imagen}" alt="">
            <p class="Nombre_Producto">${prod.nombre}</p>
            <p class="Precio_Producto">$${prod.precio.toLocaleString()}</p>
        `;
        div.style.cursor = 'pointer';
        div.onclick = () => agregarAlCarrito(prod.nombre, prod.precio, div);
        contenedor.appendChild(div);
    });
    // Marcar botón activo
    document.querySelectorAll('.Contenedor_Categorias button').forEach(btn => {
        btn.classList.toggle('boton-activo', btn.innerText.trim() === nombre);
    });
}

function agregarAlCarrito(nombre, precio, elemento) {
    const existente = carrito.find(p => p.nombre === nombre);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }
    elemento.classList.add('added');
    setTimeout(() => elemento.classList.remove('added'), 500);
    actualizarCarrito();
}

function actualizarCarrito() {
    const contenedor = document.querySelector('.Footer_Contenedor_Orden');
    if (carrito.length === 0) {
        contenedor.textContent = 'Tu orden está vacía';
    } else {
        let total = 0;
        carrito.forEach(item => { total += item.precio * item.cantidad; });
        let html = `<div style="display: flex; flex-direction: column; height: 100%; width: 100%;">
            <div style="flex: 1; overflow-y: auto; margin-bottom: 10px;">
                <ul style="list-style:none; padding:0; margin:0; font-size: 1.1rem;">`;
        carrito.forEach(item => {
            html += `<li style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #ddd;">
                        <span style="flex: 1; text-align: left;">${item.cantidad} x ${item.nombre}</span>
                        <span style="font-weight: bold; margin-left: 10px;">$${(item.precio * item.cantidad).toLocaleString()}</span>
                     </li>`;
        });
        html += `</ul></div><div style="border-top: 2px solid #333; padding-top: 10px; font-size: 1.3rem; font-weight: bold; text-align: center;">
            Total: $${total.toLocaleString()}</div></div>`;
        contenedor.innerHTML = html;
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function cargarCarritoDeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }
}

function asignarEventosFooter() {
    const botonContinuar = document.getElementById('Boton_Continuar');
    if (botonContinuar) {
        botonContinuar.addEventListener('click', () => {
            let total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
            if (total > 0) {
                localStorage.setItem('carrito', JSON.stringify(carrito));
                localStorage.setItem('carrito_total', total);
                window.location.href = 'metodo_pago.html';
            } else {
                alert('Agrega productos al carrito antes de continuar.');
            }
        });
    }
    const botonCancelar = document.getElementById('Boton_Cancelar');
    if (botonCancelar) {
        botonCancelar.addEventListener('click', () => {
            carrito = [];
            actualizarCarrito();
            localStorage.removeItem('carrito');
            localStorage.removeItem('carrito_total');
        });
    }
} 