document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    const loadingIndicator = document.getElementById('details-loading');
    const detailsContainer = document.getElementById('details-container');

    if (!productId) {
        alert('ID do produto não fornecido!');
        window.location.href = 'tabela-produto.html';
        return;
    }

    const loadProductDetails = async () => {
        try {
            const response = await authenticatedFetch(`/produto?id=${productId}`);
            if (!response.ok) throw new Error('Falha ao buscar dados do produto.');

            const products = await response.json();
            if (products.length === 0) throw new Error('Produto não encontrado.');
            
            const product = products[0];

            document.getElementById('detail-nome').textContent = product.nome;
            document.getElementById('detail-descricao').textContent = product.descricao || 'Não informado';
            document.getElementById('detail-tamanho-tanque').textContent = product.tamanho_tanque ? `${product.tamanho_tanque} Litros` : 'Não aplicável';
            const valorEl = document.getElementById('detail-valor');
            if (valorEl) {
                if (product.valor !== undefined && product.valor !== null) {
                    const num = Number(product.valor);
                    valorEl.textContent = isNaN(num)
                        ? String(product.valor)
                        : num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                } else {
                    valorEl.textContent = 'Não informado';
                }
            }
            
            loadingIndicator.style.display = 'none';
            detailsContainer.style.display = 'block';

        } catch (error) {
            console.error('Erro ao carregar detalhes do produto:', error);
            alert('Não foi possível carregar os detalhes do produto.');
            window.location.href = 'tabela-produto.html';
        }
    };

    const editButton = document.getElementById('btn-editar');
    if(editButton) {
        editButton.addEventListener('click', () => {
            window.location.href = `produto-form.html?id=${productId}`;
        });
    }

    const deleteButton = document.getElementById('btn-excluir');
    if(deleteButton) {
        deleteButton.addEventListener('click', async () => {
            const productName = document.getElementById('detail-nome').textContent;
            if (confirm(`Tem certeza que deseja excluir o produto "${productName}"? Esta ação não pode ser desfeita.`)) {
                try {
                    const response = await authenticatedFetch('/produto', {
                        method: 'DELETE',
                        body: JSON.stringify({ id: parseInt(productId) })
                    });

                    if (response.ok) {
                        alert('Produto excluído com sucesso!');
                        window.location.href = 'tabela-produto.html';
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Falha ao excluir o produto.');
                    }
                } catch (error) {
                    alert(`Erro ao excluir: ${error.message}`);
                    console.error('Erro ao excluir produto:', error);
                }
            }
        });
    }

    loadProductDetails();
});

