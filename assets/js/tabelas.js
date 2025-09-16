document.addEventListener('DOMContentLoaded', () => {

    if (window.location.pathname.includes('tabela-user.html')) {
        
        let allUsers = [];
        let filteredUsers = [];
        let currentPage = 1;
        const rowsPerPage = 10;

        const tableBody = document.getElementById('user-table-body');
        const searchInput = document.getElementById('search-input');
        const cargoFilter = document.getElementById('cargo-filter');
        const statusFilter = document.getElementById('status-filter');
        const sortSelect = document.getElementById('sort-select');
        const paginationControls = document.getElementById('pagination-controls');
        const resultsInfo = document.getElementById('results-info');
        const paginationList = document.getElementById('pagination-list');
        const loadingIndicator = document.getElementById('loading-indicator');
        const noResults = document.getElementById('no-results');

        const renderTablePage = () => {
            tableBody.innerHTML = '';
            if (noResults) noResults.style.display = 'none';
            
            if (filteredUsers.length === 0) {
                if (noResults) noResults.style.display = 'block';
                if (paginationControls) paginationControls.style.display = 'none';
                return;
            }

            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = Math.min(startIndex + rowsPerPage, filteredUsers.length);
            const pageUsers = filteredUsers.slice(startIndex, endIndex);

            pageUsers.forEach(user => {
                const statusClass = user.status === 'ativo' ? 'badge bg-success' : 'badge bg-danger';
                const cargoFormatted = user.cargo.charAt(0).toUpperCase() + user.cargo.slice(1);
                
                const row = `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.nome}</td>
                        <td>${user.email}</td>
                        <td>${cargoFormatted}</td>
                        <td><span class="${statusClass}">${user.status}</span></td>
                        <td class="text-center">
                            <a href="user-detalhes.html?id=${user.id}" class="btn btn-sm btn-info" title="Visualizar"><i class="fas fa-eye"></i></a>
                            <a href="user-form.html?id=${user.id}" class="btn btn-sm btn-warning" title="Editar"><i class="fas fa-pencil-alt"></i></a>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
            updatePagination(startIndex, endIndex);
        };

        const updatePagination = (startIndex, endIndex) => {
            const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
            if (paginationList) paginationList.innerHTML = ''; 

            if (totalPages <= 1) {
                if (paginationControls) paginationControls.style.display = 'none';
                if (resultsInfo) resultsInfo.textContent = `Exibindo ${filteredUsers.length} de ${filteredUsers.length} resultados`;
                return;
            }
            
            if (paginationControls) paginationControls.style.display = 'flex';
            if (resultsInfo) resultsInfo.textContent = `Exibindo ${startIndex + 1} a ${endIndex} de ${filteredUsers.length} resultados`;

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
            let tempUsers = [...allUsers];
            const searchTerm = searchInput.value.toLowerCase();
            const cargo = cargoFilter.value;
            const status = statusFilter.value;
            const [sortColumn, sortDirection] = sortSelect.value.split('-');

            if (searchTerm) {
                tempUsers = tempUsers.filter(user =>
                    user.nome.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm)
                );
            }
            if (cargo && cargo !== 'todos') { 
                tempUsers = tempUsers.filter(user => user.cargo === cargo);
            }
            if (status && status !== 'todos') {
                tempUsers = tempUsers.filter(user => user.status === status);
            }

            tempUsers.sort((a, b) => {
                const aValue = a[sortColumn];
                const bValue = b[sortColumn];
                if (typeof aValue === 'string') {
                    return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            });
            
            filteredUsers = tempUsers;
            currentPage = 1;
            renderTablePage();
        };

        const fetchUsers = async () => {
            if(loadingIndicator) loadingIndicator.style.display = 'block';
            if(tableBody) tableBody.innerHTML = '';
            try {
                const response = await authenticatedFetch('/usuario');
                if (!response.ok) throw new Error('Falha ao carregar usuários.');
                allUsers = await response.json();
                applyFiltersAndSort();
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
                if(tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar dados.</td></tr>`;
            } finally {
                if(loadingIndicator) loadingIndicator.style.display = 'none';
            }
        };
        
        searchInput.addEventListener('input', applyFiltersAndSort);
        cargoFilter.addEventListener('change', applyFiltersAndSort);
        statusFilter.addEventListener('change', applyFiltersAndSort);
        sortSelect.addEventListener('change', applyFiltersAndSort);

        fetchUsers();
    }

    if (window.location.pathname.includes('tabela-produto.html')) {
        let allProducts = [];
        let filteredProducts = [];
        let currentPage = 1;
        const rowsPerPage = 10;

        const tableBody = document.getElementById('product-table-body');
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        const paginationControls = document.getElementById('pagination-controls');
        const resultsInfo = document.getElementById('results-info');
        const paginationList = document.getElementById('pagination-list');
        const loadingIndicator = document.getElementById('loading-indicator');
        const noResults = document.getElementById('no-results');
        
        const renderTablePage = () => {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            tableBody.innerHTML = '';
            
            if (filteredProducts.length === 0) {
                if (noResults) noResults.style.display = 'block';
                if (paginationControls) paginationControls.style.display = 'none';
                return;
            }
            if (noResults) noResults.style.display = 'none';

            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = Math.min(startIndex + rowsPerPage, filteredProducts.length);
            const pageProducts = filteredProducts.slice(startIndex, endIndex);

            pageProducts.forEach(product => {
                const row = `
                    <tr>
                        <td>${product.id}</td>
                        <td>${product.nome}</td>
                        <td>${product.descricao || '-'}</td>
                        <td>${product.tamanho_tanque ? `${product.tamanho_tanque} L` : '-'}</td>
                        <td class="text-center">
                            <a href="produto-detalhes.html?id=${product.id}" class="btn btn-sm btn-info" title="Visualizar"><i class="fas fa-eye"></i></a>
                            <a href="produto-form.html?id=${product.id}" class="btn btn-sm btn-warning" title="Editar"><i class="fas fa-pencil-alt"></i></a>
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
                    product.nome.toLowerCase().includes(searchTerm)
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
            if(loadingIndicator) loadingIndicator.style.display = 'block';
            if(tableBody) tableBody.innerHTML = '';
            try {
                const response = await authenticatedFetch('/produto');
                if (!response.ok) throw new Error('Falha ao carregar produtos.');
                allProducts = await response.json();
                applyFiltersAndSort();
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
                if(tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar dados.</td></tr>`;
            } finally {
                if(loadingIndicator) loadingIndicator.style.display = 'none';
            }
        };

        searchInput.addEventListener('input', applyFiltersAndSort);
        sortSelect.addEventListener('change', applyFiltersAndSort);

        fetchProducts();
    }

    if (window.location.pathname.includes('tabela-cliente.html')) {
        let allClients = [];
        let filteredClients = [];
        let currentPage = 1;
        const rowsPerPage = 10;

        const tableBody = document.getElementById('client-table-body');
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        const loadingIndicator = document.getElementById('loading-indicator');
        const noResults = document.getElementById('no-results');
        const paginationControls = document.getElementById('pagination-controls');
        const resultsInfo = document.getElementById('results-info');
        const paginationList = document.getElementById('pagination-list');
        
        const renderTablePage = () => {
            if(tableBody) tableBody.innerHTML = '';
            if(noResults) noResults.style.display = 'none';

            if(filteredClients.length === 0){
                if(noResults) noResults.style.display = 'block';
                if(paginationControls) paginationControls.style.display = 'none';
                return;
            }

            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = Math.min(startIndex + rowsPerPage, filteredClients.length);
            const pageClients = filteredClients.slice(startIndex, endIndex);

            pageClients.forEach(client => {
                const row = `
                    <tr>
                        <td>${client.id}</td>
                        <td>${client.nome}</td>
                        <td>${client.cpf_cnpj}</td>
                        <td class="text-center">
                            <a href="cliente-detalhes.html?id=${client.id}" class="btn btn-sm btn-info" title="Visualizar"><i class="fas fa-eye"></i></a>
                            <a href="cliente-form.html?id=${client.id}" class="btn btn-sm btn-warning" title="Editar"><i class="fas fa-pencil-alt"></i></a>
                        </td>
                    </tr>
                `;
                if(tableBody) tableBody.innerHTML += row;
            });
            updatePagination(startIndex, endIndex);
        };

        const updatePagination = (startIndex, endIndex) => {
            const totalPages = Math.ceil(filteredClients.length / rowsPerPage);
            if(paginationList) paginationList.innerHTML = '';

            if (totalPages <= 1) {
                if(paginationControls) paginationControls.style.display = 'none';
                if(resultsInfo) resultsInfo.textContent = `Exibindo ${filteredClients.length} de ${filteredClients.length} resultados`;
                return;
            }

            if(paginationControls) paginationControls.style.display = 'flex';
            if(resultsInfo) resultsInfo.textContent = `Exibindo ${startIndex + 1} a ${endIndex} de ${filteredClients.length} resultados`;

        };
        
        const applyFiltersAndSort = () => {
            let tempClients = [...allClients];
            if(searchInput){
                const searchTerm = searchInput.value.toLowerCase();
                 tempClients = tempClients.filter(client =>
                    client.nome.toLowerCase().includes(searchTerm) ||
                    (client.cpf_cnpj && client.cpf_cnpj.includes(searchTerm))
                );
            }

            if(sortSelect){
                const [sortColumn, sortDirection] = sortSelect.value.split('-');
                tempClients.sort((a,b) => {
                    const aValue = a[sortColumn];
                    const bValue = b[sortColumn];
                    const comparison = (aValue > bValue) ? 1 : ((bValue > aValue) ? -1 : 0);
                    return sortDirection === 'asc' ? comparison : comparison * -1;
                });
            }

            filteredClients = tempClients;
            currentPage = 1;
            renderTablePage();
        };

        const fetchClients = async () => {
            if(loadingIndicator) loadingIndicator.style.display = 'block';
            if(tableBody) tableBody.innerHTML = '';
            try {
                const response = await authenticatedFetch('/cliente');
                if (!response.ok) throw new Error('Falha ao carregar clientes.');
                allClients = await response.json();
                applyFiltersAndSort();
            } catch (error) {
                console.error("Erro ao buscar clientes:", error);
                 if(tableBody) tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao carregar dados.</td></tr>`;
            } finally {
                if(loadingIndicator) loadingIndicator.style.display = 'none';
            }
        };

        if(searchInput) searchInput.addEventListener('input', applyFiltersAndSort);
        if(sortSelect) sortSelect.addEventListener('change', applyFiltersAndSort);

        fetchClients();
    }
 if (window.location.pathname.includes('tabela-cliente.html')) {
        let allClients = [];
        let filteredClients = [];
        let currentPage = 1;
        const rowsPerPage = 10;

        const tableBody = document.getElementById('client-table-body');
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        const loadingIndicator = document.getElementById('loading-indicator');
        const noResults = document.getElementById('no-results');
        const paginationControls = document.getElementById('pagination-controls');
        const resultsInfo = document.getElementById('results-info');
        const paginationList = document.getElementById('pagination-list');
        
        const formatCpfCnpj = (value) => {
            const cleanValue = value.replace(/\D/g, '');
            if (cleanValue.length > 11) {
                return cleanValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
            }
            return cleanValue.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
        };

        const formatTelefone = (value) => {
            const cleanValue = value.replace(/\D/g, '');
            if (cleanValue.length > 10) {
                return cleanValue.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
            }
            return cleanValue.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        };

        const renderTablePage = () => {
            if(tableBody) tableBody.innerHTML = '';
            if(noResults) noResults.style.display = 'none';

            if(filteredClients.length === 0){
                if(noResults) noResults.style.display = 'block';
                if(paginationControls) paginationControls.style.display = 'none';
                return;
            }

            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = Math.min(startIndex + rowsPerPage, filteredClients.length);
            const pageClients = filteredClients.slice(startIndex, endIndex);

            pageClients.forEach(client => {
                const firstTelefone = client.telefones && client.telefones.length > 0 
                    ? formatTelefone(client.telefones[0].descricao) 
                    : '-';

                const row = `
                    <tr>
                        <td>${client.id}</td>
                        <td>${client.nome}</td>
                        <td>${formatCpfCnpj(client.cpf_cnpj)}</td>
                        <td>${firstTelefone}</td>
                        <td class="text-center">
                            <a href="cliente-detalhes.html?id=${client.id}" class="btn btn-sm btn-info" title="Visualizar"><i class="fas fa-eye"></i></a>
                            <a href="cliente-form.html?id=${client.id}" class="btn btn-sm btn-warning" title="Editar"><i class="fas fa-pencil-alt"></i></a>
                        </td>
                    </tr>
                `;
                if(tableBody) tableBody.innerHTML += row;
            });
            updatePagination(startIndex, endIndex);
        };

        const updatePagination = (startIndex, endIndex) => {
            const totalPages = Math.ceil(filteredClients.length / rowsPerPage);
            if(paginationList) paginationList.innerHTML = '';

            if (totalPages <= 1) {
                if(paginationControls) paginationControls.style.display = 'none';
                if(resultsInfo) resultsInfo.textContent = `Exibindo ${filteredClients.length} de ${filteredClients.length} resultados`;
                return;
            }

            if(paginationControls) paginationControls.style.display = 'flex';
            if(resultsInfo) resultsInfo.textContent = `Exibindo ${startIndex + 1} a ${endIndex} de ${filteredClients.length} resultados`;

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
            let tempClients = [...allClients];
            if(searchInput){
                const searchTerm = searchInput.value.toLowerCase();
                 tempClients = tempClients.filter(client =>
                    client.nome.toLowerCase().includes(searchTerm) ||
                    (client.cpf_cnpj && client.cpf_cnpj.includes(searchTerm))
                );
            }

            if(sortSelect){
                const [sortColumn, sortDirection] = sortSelect.value.split('-');
                tempClients.sort((a,b) => {
                    const aValue = a[sortColumn];
                    const bValue = b[sortColumn];
                    const comparison = (aValue > bValue) ? 1 : ((bValue > aValue) ? -1 : 0);
                    return sortDirection === 'asc' ? comparison : comparison * -1;
                });
            }

            filteredClients = tempClients;
            currentPage = 1;
            renderTablePage();
        };

        const fetchClients = async () => {
            if(loadingIndicator) loadingIndicator.style.display = 'block';
            if(tableBody) tableBody.innerHTML = '';
            try {
                const response = await authenticatedFetch('/cliente');
                if (!response.ok) throw new Error('Falha ao carregar clientes.');
                allClients = await response.json();
                applyFiltersAndSort();
            } catch (error) {
                console.error("Erro ao buscar clientes:", error);
                 if(tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar dados.</td></tr>`;
            } finally {
                if(loadingIndicator) loadingIndicator.style.display = 'none';
            }
        };

        if(searchInput) searchInput.addEventListener('input', applyFiltersAndSort);
        if(sortSelect) sortSelect.addEventListener('change', applyFiltersAndSort);

        fetchClients();
    }
    
    if (window.location.pathname.includes('tabela-os.html')) {
        let allOs = [];
        let filteredOs = [];
        let currentPage = 1;
        const rowsPerPage = 10;

        const tableBody = document.getElementById('os-table-body');
        const searchInput = document.getElementById('search-input');
        const statusFilter = document.getElementById('filter-status');
        const sortSelect = document.getElementById('sort-select');
        const paginationControls = document.getElementById('pagination-controls');
        const resultsInfo = document.getElementById('results-info');
        const paginationList = document.getElementById('pagination-list');
        const loadingIndicator = document.getElementById('loading-indicator');
        const noResults = document.getElementById('no-results');

        const formatDate = (dateString) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        };

        const renderTablePage = () => {
            tableBody.innerHTML = '';
            if (noResults) noResults.style.display = 'none';

            if (filteredOs.length === 0) {
                if (noResults) noResults.style.display = 'table-row';
                if (paginationControls) paginationControls.style.display = 'none';
                if (resultsInfo) resultsInfo.textContent = '';
                return;
            }
            
            if (paginationControls) paginationControls.style.display = 'flex';
            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = Math.min(startIndex + rowsPerPage, filteredOs.length);
            const pageOs = filteredOs.slice(startIndex, endIndex);

            pageOs.forEach(os => {
                const statusClass = os.status === 'Concluida' ? 'bg-success' : (os.status === 'Em andamento' ? 'bg-warning' : 'bg-secondary');
                const servicos = (os.servicos && os.servicos.length > 0) ? os.servicos.map(s => s.nome).join(', ') : 'N/A';
                const clienteNome = os.propriedade?.cliente?.nome || 'N/A';
                const responsaveis = (os.usuarios && os.usuarios.length > 0) ? os.usuarios.map(u => u.nome).join(', ') : 'N/A';

                const row = `
                    <tr>
                        <td>${servicos}</td>
                        <td>${clienteNome}</td>
                        <td>${responsaveis}</td>
                        <td><span class="badge ${statusClass}">${os.status}</span></td>
                        <td>${formatDate(os.created_at)}</td>
                        <td class="text-end">
                            <a href="os-detalhes.html?id=${os.id}" class="btn btn-sm btn-info" title="Visualizar"><i class="fas fa-eye"></i></a>
                            <a href="ordem-servico-form.html?id=${os.id}" class="btn btn-sm btn-warning" title="Editar"><i class="fas fa-pencil-alt"></i></a>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
            updatePagination(startIndex, endIndex);
        };

        const updatePagination = (startIndex, endIndex) => {
            const totalPages = Math.ceil(filteredOs.length / rowsPerPage);
            if (paginationList) paginationList.innerHTML = '';

            if (totalPages <= 1) {
                if (paginationControls) paginationControls.style.display = 'none';
                if (resultsInfo) resultsInfo.textContent = `Exibindo ${filteredOs.length} de ${filteredOs.length} resultados`;
                return;
            }
            
            if (paginationControls) paginationControls.style.display = 'flex';
            if (resultsInfo) resultsInfo.textContent = `Exibindo ${startIndex + 1} a ${endIndex} de ${filteredOs.length} resultados`;

            const prevLi = document.createElement('li');
            prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
            prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
            prevLi.addEventListener('click', (e) => { e.preventDefault(); if (currentPage > 1) { currentPage--; renderTablePage(); } });
            paginationList.appendChild(prevLi);

            for (let i = 1; i <= totalPages; i++) {
                const pageLi = document.createElement('li');
                pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
                pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
                pageLi.addEventListener('click', (e) => { e.preventDefault(); currentPage = i; renderTablePage(); });
                paginationList.appendChild(pageLi);
            }

            const nextLi = document.createElement('li');
            nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
            nextLi.innerHTML = `<a class="page-link" href="#">Próxima</a>`;
            nextLi.addEventListener('click', (e) => { e.preventDefault(); if (currentPage < totalPages) { currentPage++; renderTablePage(); } });
            paginationList.appendChild(nextLi);
        };
        
        const applyFiltersAndSort = () => {
            let tempOs = [...allOs];
            const searchTerm = searchInput.value.toLowerCase();
            const status = statusFilter.value;
            const [sortColumn, sortDirection] = sortSelect.value.split('-');

            if (searchTerm) {
                tempOs = tempOs.filter(os => {
                    const servicosStr = (os.servicos && os.servicos.length) ? os.servicos.map(s => s.nome).join(', ').toLowerCase() : '';
                    const clienteStr = os.propriedade?.cliente?.nome ? os.propriedade.cliente.nome.toLowerCase() : '';
                    const usuariosStr = (os.usuarios && os.usuarios.length) ? os.usuarios.map(u => u.nome).join(', ').toLowerCase() : '';
                    const dataStr = formatDate(os.created_at);
                    return servicosStr.includes(searchTerm) || clienteStr.includes(searchTerm) || usuariosStr.includes(searchTerm) || dataStr.includes(searchTerm);
                });
            }
            if (status && status !== 'todos') {
                tempOs = tempOs.filter(os => os.status === status);
            }

            tempOs.sort((a, b) => {
                if (sortColumn === 'data_abertura') {
                    const aDate = new Date(a.created_at);
                    const bDate = new Date(b.created_at);
                    return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
                }
                if (sortColumn === 'servico') {
                    const aServ = (a.servicos && a.servicos.length) ? a.servicos[0].nome : '';
                    const bServ = (b.servicos && b.servicos.length) ? b.servicos[0].nome : '';
                    return sortDirection === 'asc' ? aServ.localeCompare(bServ) : bServ.localeCompare(aServ);
                }
                if (sortColumn === 'responsavel') {
                    const aUser = (a.usuarios && a.usuarios.length) ? a.usuarios[0].nome : '';
                    const bUser = (b.usuarios && b.usuarios.length) ? b.usuarios[0].nome : '';
                    return sortDirection === 'asc' ? aUser.localeCompare(bUser) : bUser.localeCompare(aUser);
                }
                return 0;
            });
            
            filteredOs = tempOs;
            currentPage = 1;
            renderTablePage();
        };

        const fetchOs = async () => {
            if (loadingIndicator) loadingIndicator.style.display = 'table-row';
            if(tableBody) tableBody.innerHTML = '';
            if(noResults) noResults.style.display = 'none';
            try {
                const response = await authenticatedFetch('/ordem-servico');
                if (!response.ok) throw new Error('Falha ao carregar ordens de serviço.');
                allOs = await response.json();
                applyFiltersAndSort();
            } catch (error) {
                console.error("Erro ao buscar ordens de serviço:", error);
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar dados.</td></tr>`;
            } finally {
                if (loadingIndicator) loadingIndicator.style.display = 'none';
            }
        };
        
        searchInput.addEventListener('input', applyFiltersAndSort);
        statusFilter.addEventListener('change', applyFiltersAndSort);
        sortSelect.addEventListener('change', applyFiltersAndSort);

        fetchOs();
    }
});