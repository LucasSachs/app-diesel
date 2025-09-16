// Integração do formulário de serviço com o backend

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const servicoId = params.get('id');
    const isEditMode = !!servicoId;
    const form = document.getElementById('servico-form');
    const formTitle = document.getElementById('form-title');
    const saveButton = document.getElementById('save-button');
    const formMessage = document.getElementById('form-message');
    const nomeInput = document.getElementById('nome');
    const descricaoInput = document.getElementById('descricao');
    const btnCancelar = document.getElementById('btn-cancelar');

    if (isEditMode) {
        formTitle.textContent = 'Editar Serviço';
        document.title = 'Editar Serviço';
        fetchServico();
    }

    async function fetchServico() {
        try {
            const response = await authenticatedFetch(`/servico?id=${servicoId}`);
            if (!response.ok) throw new Error('Serviço não encontrado.');
            const servicos = await response.json();
            const servico = Array.isArray(servicos) ? servicos[0] : servicos;
            if (!servico) throw new Error('Serviço não encontrado.');
            nomeInput.value = servico.nome;
            descricaoInput.value = servico.descricao || '';
        } catch (e) {
            formMessage.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
        }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (btnCancelar && document.activeElement === btnCancelar) return; // Se cancelar estava focado, não submete
            const data = {
                nome: nomeInput.value,
                descricao: descricaoInput.value.trim() === '' ? null : descricaoInput.value
            };
            let url = '/servico';
            let method = 'POST';
            if (isEditMode) {
                method = 'PUT';
                data.id = parseInt(servicoId);
            }
            try {
                const response = await authenticatedFetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok) {
                    formMessage.innerHTML = `<div class="alert alert-success">Serviço salvo com sucesso! Redirecionando...</div>`;
                    setTimeout(() => {
                        window.location.href = `servico-detalhes.html?id=${result.id || servicoId}`;
                    }, 1500);
                } else {
                    const errorMessage = Array.isArray(result.message) ? result.message.join('<br>') : (result.message || 'Erro desconhecido.');
                    formMessage.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
                }
            } catch (e) {
                formMessage.innerHTML = `<div class="alert alert-danger">Erro ao salvar serviço.</div>`;
            }
        });
    }
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function () {
            if (confirm('Ao cancelar, você perderá todo o progresso do formulário. Deseja realmente sair?')) {
                window.location.href = 'tabela-servico.html';
            }
        });
    }
});
