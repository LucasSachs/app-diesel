document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get('id');
    const detailNome = document.getElementById('detail-nome');
    const detailCpfCnpj = document.getElementById('detail-cpf_cnpj');
    const emailsList = document.getElementById('emails-list');
    const telefonesList = document.getElementById('telefones-list');
    const propertiesList = document.getElementById('properties-list');
    const propertiesLoading = document.getElementById('properties-loading');
    const propertyTemplate = document.getElementById('property-details-template');
    const editButton = document.getElementById('edit-client-btn');
    const deleteButton = document.getElementById('delete-client-btn');

    if (!clientId) {
        alert('ID do cliente não fornecido!');
        window.location.href = 'tabela-cliente.html';
        return;
    }

    // --- Máscaras ---
    const formatCpfCnpj = (value) => {
        if (!value) return '-';
        const cleanValue = String(value).replace(/\D/g, '');
        if (cleanValue.length > 11) { // CNPJ
            return cleanValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        // CPF
        return cleanValue.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const formatCep = (value) => {
        if (!value) return '-';
        const cleanValue = String(value).replace(/\D/g, '');
        if (cleanValue.length === 8) {
            return cleanValue.replace(/^(\d{5})(\d{3})/, '$1-$2');
        }
        return cleanValue;
    };

    const formatTelefone = (tel) => {
        if (!tel) return '-';
        const value = tel.replace(/\D/g, '');
        if (value.length > 10) {
            return value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        }
        return value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    };

    const fetchAddressFromViaCEP = async (cep) => {
        if (!cep || cep.replace(/\D/g, '').length !== 8) return { logradouro: '-', bairro: '-' };
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
            const data = await response.json();
            if (data.erro) return { logradouro: 'CEP não encontrado', bairro: '' };
            return data;
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            return { logradouro: 'Erro na busca', bairro: '' };
        }
    };

    try {
        const response = await authenticatedFetch(`/cliente?id=${clientId}`);
        if (!response.ok) throw new Error('Falha ao buscar dados do cliente.');
        const clients = await response.json();
        if (clients.length === 0) throw new Error('Cliente não encontrado.');
        const client = clients[0];

        detailNome.textContent = client.nome;
        detailCpfCnpj.textContent = formatCpfCnpj(client.cpf_cnpj);

        emailsList.innerHTML = '<h6>Email(s):</h6>';
        client.emails.forEach(email => {
            emailsList.innerHTML += `<p class="mb-1">${email.descricao}</p>`;
        });

        telefonesList.innerHTML = '<h6>Telefone(s):</h6>';
        client.telefones.forEach(tel => {
            telefonesList.innerHTML += `<p class="mb-1">${formatTelefone(tel.descricao)}</p>`;
        });

        propertiesList.innerHTML = '';
        if (client.propriedades && client.propriedades.length > 0) {
            for (const prop of client.propriedades) {
                const viaCepData = await fetchAddressFromViaCEP(prop.endereco.cep);
                
                const clone = propertyTemplate.content.cloneNode(true);
                clone.querySelector('.prop-cadpro').textContent = prop.cadpro || '-';
                clone.querySelector('.prop-logradouro').textContent = viaCepData.logradouro || prop.endereco.logradouro || '-';
                clone.querySelector('.prop-numero').textContent = prop.endereco.numero || '-';
                clone.querySelector('.prop-complemento').textContent = prop.endereco.complemento || '-';
                clone.querySelector('.prop-bairro').textContent = viaCepData.bairro || prop.endereco.bairro || '-';
                clone.querySelector('.prop-cidade').textContent = prop.endereco.cidade?.descricao || '-';
                clone.querySelector('.prop-uf').textContent = prop.endereco.uf?.descricao || '-';
                clone.querySelector('.prop-cep').textContent = prop.endereco.cep ? formatCep(prop.endereco.cep) : '-';
                clone.querySelector('.prop-lat').textContent = prop.endereco.lat || '-';
                clone.querySelector('.prop-long').textContent = prop.endereco.long || '-';
                propertiesList.appendChild(clone);
            }
        } else {
            propertiesList.innerHTML = '<p>Nenhuma propriedade cadastrada.</p>';
        }

        editButton.addEventListener('click', () => {
            window.location.href = `cliente-form.html?id=${clientId}`;
        });

        deleteButton.addEventListener('click', async () => {
             if (confirm(`Tem certeza que deseja excluir o cliente ${client.nome}?`)) {
                try {
                    const deleteResponse = await authenticatedFetch('/cliente', {
                        method: 'DELETE',
                        body: JSON.stringify({ id: parseInt(clientId) })
                    });
                    if (deleteResponse.ok) {
                        alert('Cliente excluído com sucesso!');
                        window.location.href = 'tabela-cliente.html';
                    } else {
                        const error = await deleteResponse.json();
                        throw new Error(error.message || 'Falha ao excluir cliente.');
                    }
                } catch (error) {
                    alert(`Erro: ${error.message}`);
                }
            }
        });

    } catch (error) {
        console.error('Erro:', error);
        alert(error.message);
        window.location.href = 'tabela-cliente.html';
    }
});

