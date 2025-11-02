document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = urlParams.get('id');
    
    const detailsLoading = document.getElementById('details-loading');
    const detailsContainer = document.getElementById('details-container');
    const detailNome = document.getElementById('detail-nome');
    const detailDescricao = document.getElementById('detail-descricao');
    const detailTamanhoTanque = document.getElementById('detail-tamanho-tanque');
    const detailValor = document.getElementById('detail-valor');

    if (!produtoId) {
        alert('ID do produto não encontrado.');
        window.location.href = 'tabela-produto-funcionario.html';
        return;
    }

    const formatCurrency = (value) => {
        if (!value) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    try {
        const response = await authenticatedFetch(`/produto?id=${produtoId}`);
        
        if (!response.ok) {
            throw new Error('Produto não encontrado.');
        }

        const produtos = await response.json();
        const produto = Array.isArray(produtos) ? produtos[0] : produtos;
        
        if (!produto) throw new Error('Produto não encontrado');

        // Preencher os detalhes
        detailNome.textContent = produto.nome || '-';
        detailDescricao.textContent = produto.descricao || '-';
        detailTamanhoTanque.textContent = produto.tamanho_tanque ? `${produto.tamanho_tanque} litros` : '-';
        detailValor.textContent = formatCurrency(produto.valor);

        // Ocultar loading e mostrar detalhes
        detailsLoading.style.display = 'none';
        detailsContainer.style.display = 'block';

    } catch (error) {
        console.error('Erro ao carregar detalhes do produto:', error);
        alert('Erro ao carregar detalhes do produto.');
        window.location.href = 'tabela-produto-funcionario.html';
    }
});
