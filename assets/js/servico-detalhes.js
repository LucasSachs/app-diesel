document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const servicoId = urlParams.get('id');

    const loadingIndicator = document.getElementById('details-loading');
    const detailsContainer = document.getElementById('details-container');

    if (!servicoId) {
        alert('ID do serviço não fornecido!');
        window.location.href = 'tabela-servico.html';
        return;
    }

    try {
        const response = await authenticatedFetch(`/servico?id=${servicoId}`);
        if (!response.ok) throw new Error('Serviço não encontrado');
        
        const servicos = await response.json();
        const servico = Array.isArray(servicos) ? servicos[0] : servicos;
        
        if (!servico) throw new Error('Serviço não encontrado');

        loadingIndicator.style.display = 'none';
        detailsContainer.style.display = 'block';

        document.getElementById('detail-nome').textContent = servico.nome || '-';
        document.getElementById('detail-descricao').textContent = servico.descricao || '-';
        
        document.getElementById('btn-editar').addEventListener('click', () => {
            window.location.href = `servico-form.html?id=${servico.id}`;
        });

        document.getElementById('btn-excluir').addEventListener('click', async function () {
            if (confirm('Tem certeza que deseja excluir este serviço?')) {
                try {
                    const deleteResponse = await authenticatedFetch('/servico', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: parseInt(servicoId) })
                    });
                    if (!deleteResponse.ok) throw new Error('Falha ao excluir serviço');
                    alert('Serviço excluído com sucesso!');
                    window.location.href = 'tabela-servico.html';
                } catch (error) {
                    console.error('Erro ao excluir serviço:', error);
                    alert(`Erro ao excluir: ${error.message}`);
                }
            }
        });
    } catch (error) {
        loadingIndicator.style.display = 'none';
        console.error('Erro ao buscar detalhes do serviço:', error);
        alert(`Erro: ${error.message}`);
        window.location.href = 'tabela-servico.html';
    }
});

