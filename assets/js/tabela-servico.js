document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('servicos-table-body');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    let currentPage = 1;
    const rowsPerPage = 10;
    let allServicos = [];
    let filteredServicos = [];

    let paginationControls = document.getElementById('pagination-controls');
    let resultsInfo = document.getElementById('results-info');
    let paginationList = document.getElementById('pagination-list');
    let noResults = document.getElementById('no-results');

    if (!paginationControls) {
        paginationControls = document.createElement('div');
        paginationControls.id = 'pagination-controls';
        paginationControls.className = 'd-flex justify-content-between align-items-center mt-3';
        paginationControls.style.display = 'none';
        resultsInfo = document.createElement('span');
        resultsInfo.id = 'results-info';
        resultsInfo.className = 'text-muted';
        paginationList = document.createElement('ul');
        paginationList.className = 'pagination mb-0';
        paginationList.id = 'pagination-list';
        paginationControls.appendChild(resultsInfo);
        const nav = document.createElement('nav');
        nav.appendChild(paginationList);
        paginationControls.appendChild(nav);
        tableBody.parentElement.parentElement.appendChild(paginationControls);
    }
    if (!noResults) {
        noResults = document.createElement('tr');
        noResults.className = 'no-results-row';
        noResults.style.display = 'none';
        noResults.innerHTML = `<td colspan="4" class="text-center"><p id="no-results">Nenhum serviço encontrado.</p></td>`;
        tableBody.appendChild(noResults);
    }

    const renderTablePage = () => {
        tableBody.innerHTML = '';
        if (filteredServicos.length === 0) {
            if (noResults) noResults.style.display = 'block';
            if (paginationControls) paginationControls.style.display = 'none';
            tableBody.appendChild(noResults);
            return;
        }
        if (noResults) noResults.style.display = 'none';

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, filteredServicos.length);
        const pageServicos = filteredServicos.slice(startIndex, endIndex);

        pageServicos.forEach(servico => {
            const row = `
                <tr>
                    <td>${servico.id}</td>
                    <td>${servico.nome}</td>
                    <td>${servico.descricao || '-'}</td>
                    <td class="text-center">
                        <a href="servico-detalhes.html?id=${servico.id}" class="btn btn-sm btn-info" title="Visualizar"><i class="fas fa-eye"></i></a>
                        <a href="servico-form.html?id=${servico.id}" class="btn btn-sm btn-warning" title="Editar"><i class="fas fa-pencil-alt"></i></a>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
        updatePagination(startIndex, endIndex);
    };

    const updatePagination = (startIndex, endIndex) => {
        const totalPages = Math.ceil(filteredServicos.length / rowsPerPage);
        if (paginationList) paginationList.innerHTML = '';

        if (totalPages <= 1) {
            if (paginationControls) paginationControls.style.display = 'none';
            if (resultsInfo) resultsInfo.textContent = `Exibindo ${filteredServicos.length} de ${filteredServicos.length} resultados`;
            return;
        }

        if (paginationControls) paginationControls.style.display = 'flex';
        if (resultsInfo) resultsInfo.textContent = `Exibindo ${startIndex + 1} a ${endIndex} de ${filteredServicos.length} resultados`;

        // Botão "Anterior"
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
        let tempServicos = [...allServicos];
        const searchTerm = searchInput.value.toLowerCase();
        const [sortColumn, sortDirection] = sortSelect.value.split('-');

        if (searchTerm) {
            tempServicos = tempServicos.filter(servico =>
                servico.nome.toLowerCase().includes(searchTerm)
            );
        }

        tempServicos.sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];
            if (typeof aValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        });

        filteredServicos = tempServicos;
        currentPage = 1;
        renderTablePage();
    };

    const fetchServicos = async () => {
        if (tableBody) tableBody.innerHTML = '';
        try {
            const response = await authenticatedFetch('/servico');
            if (!response.ok) throw new Error('Falha ao carregar serviços.');
            allServicos = await response.json();
            applyFiltersAndSort();
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao carregar dados.</td></tr>`;
        }
    };

    searchInput.addEventListener('input', applyFiltersAndSort);
    sortSelect.addEventListener('change', applyFiltersAndSort);

    fetchServicos();
});
