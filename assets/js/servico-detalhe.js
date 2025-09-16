document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://localhost:3000/servico';
    const urlParams = new URLSearchParams(window.location.search);
    const servicoId = urlParams.get('id');

    const loadingIndicator = document.getElementById('details-loading');
    const detailsContainer = document.getElementById('details-container');

    if (servicoId) {
        fetch(`${apiUrl}/${servicoId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(response => {
            if (!response.ok) throw new Error('Serviço não encontrado');
            return response.json();
        })
        .then(data => {
            loadingIndicator.style.display = 'none';
            detailsContainer.style.display = 'block';

            document.getElementById('detail-nome').textContent = data.nome || '-';
            document.getElementById('detail-descricao').textContent = data.descricao || '-';
            
            document.getElementById('btn-editar').addEventListener('click', () => {
                window.location.href = `./servico-form.html?id=${data.id}`;
            });
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            console.error('Erro ao buscar detalhes do serviço:', error);
            alert(error.message);
        });

        document.getElementById('btn-excluir').addEventListener('click', function () {
            if (confirm('Tem certeza que deseja excluir este serviço?')) {
                fetch(`${apiUrl}/${servicoId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
                .then(response => {
                    if (!response.ok) throw new Error('Falha ao excluir serviço');
                    alert('Serviço excluído com sucesso!');
                    window.location.href = './tabela-servico.html';
                })
                .catch(error => {
                    console.error('Erro ao excluir serviço:', error);
                    alert(error.message);
                });
            }
        });
    } else {
        alert('ID do serviço não fornecido.');
        window.location.href = './tabela-servico.html';
    }
});

