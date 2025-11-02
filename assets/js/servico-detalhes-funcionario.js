document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const servicoId = urlParams.get('id');
    
    const detailsLoading = document.getElementById('details-loading');
    const detailsContainer = document.getElementById('details-container');
    const detailNome = document.getElementById('detail-nome');
    const detailDescricao = document.getElementById('detail-descricao');

    if (!servicoId) {
        alert('ID do serviço não encontrado.');
        window.location.href = 'tabela-servico-funcionario.html';
        return;
    }

    try {
        const response = await authenticatedFetch(`/servico?id=${servicoId}`);
        
        if (!response.ok) {
            throw new Error('Serviço não encontrado.');
        }

        const servicos = await response.json();
        const servico = Array.isArray(servicos) ? servicos[0] : servicos;
        
        if (!servico) throw new Error('Serviço não encontrado');

        // Preencher os detalhes
        detailNome.textContent = servico.nome || '-';
        detailDescricao.textContent = servico.descricao || '-';

        // Ocultar loading e mostrar detalhes
        detailsLoading.style.display = 'none';
        detailsContainer.style.display = 'block';

    } catch (error) {
        console.error('Erro ao carregar detalhes do serviço:', error);
        alert('Erro ao carregar detalhes do serviço.');
        window.location.href = 'tabela-servico-funcionario.html';
    }
});
