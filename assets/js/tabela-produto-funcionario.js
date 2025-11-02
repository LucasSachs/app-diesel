document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('product-table-body');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const paginationControls = document.getElementById('pagination-controls');
    const resultsInfo = document.getElementById('results-info');
    const paginationList = document.getElementById('pagination-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noResults = document.getElementById('no-results');

    let currentPage = 1;
    const rowsPerPage = 10;
    let allProducts = [];
    let filteredProducts = [];

    const renderTablePage = () => {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        tableBody.innerHTML = '';
        if (noResults) noResults.style.display = 'none';
        
        if (filteredProducts.length === 0) {
            if (noResults) noResults.style.display = 'table-row';
            if (paginationControls) paginationControls.style.display = 'none';
            return;
        }

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, filteredProducts.length);
        const pageProducts = filteredProducts.slice(startIndex, endIndex);

        pageProducts.forEach(product => {
            const row = `
                <tr>
                    <td>${product.nome}</td>
                    <td>${product.descricao || '-'}</td>
                    <td>${product.tamanho_tanque ? `${product.tamanho_tanque} L` : '-'}</td>
                    <td class="text-center">
                        <a href="produto-detalhes-funcionario.html?id=${product.id}" class="btn btn-sm btn-info" title="Visualizar"><i class="fas fa-eye"></i></a>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
        updatePagination(startIndex, endIndex);
    };

    const updatePagination = (startIndex, endIndex) => {
        const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
        if (paginationList) paginationList.innerHTML = ''; 

        if (totalPages <= 1) {
            if (paginationControls) paginationControls.style.display = 'none';
            if (resultsInfo) resultsInfo.textContent = `Exibindo ${filteredProducts.length} de ${filteredProducts.length} resultados`;
            return;
        }
        
        if (paginationControls) paginationControls.style.display = 'flex';
        if (resultsInfo) resultsInfo.textContent = `Exibindo ${startIndex + 1} a ${endIndex} de ${filteredProducts.length} resultados`;

        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderTablePage();
            }
        });
        paginationList.appendChild(prevLi);

        for (let i = 1; i <= totalPages; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageLi.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                renderTablePage();
            });
            paginationList.appendChild(pageLi);
        }

        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Próxima</a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderTablePage();
            }
        });
        paginationList.appendChild(nextLi);
    };
    
    const applyFiltersAndSort = () => {
        let tempProducts = [...allProducts];
        const searchTerm = searchInput.value.toLowerCase();
        const [sortColumn, sortDirection] = sortSelect.value.split('-');

        if (searchTerm) {
            tempProducts = tempProducts.filter(product =>
                product.nome.toLowerCase().includes(searchTerm) ||
                (product.descricao && product.descricao.toLowerCase().includes(searchTerm))
            );
        }
        
        tempProducts.sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];
            if (typeof aValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        });
        
        filteredProducts = tempProducts;
        currentPage = 1;
        renderTablePage();
    };

    const fetchProducts = async () => {
        if(loadingIndicator) loadingIndicator.style.display = 'table-row';
        if(tableBody) tableBody.innerHTML = '';
        try {
            const response = await authenticatedFetch('/produto');
            if (!response.ok) throw new Error('Falha ao carregar produtos.');
            allProducts = await response.json();
            applyFiltersAndSort();
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            if(tableBody) tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao carregar dados.</td></tr>`;
        } finally {
            if(loadingIndicator) loadingIndicator.style.display = 'none';
        }
    };

    searchInput.addEventListener('input', applyFiltersAndSort);
    sortSelect.addEventListener('change', applyFiltersAndSort);

    fetchProducts();
});
