document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('user-form');
    const formMessage = document.getElementById('form-message');
    const formTitle = document.getElementById('form-title');
    const saveButton = document.getElementById('save-button');

    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const isEditMode = userId !== null;

    const loadUserData = async () => {
        if (!isEditMode) return;

        formTitle.textContent = 'Editar Usuário';

        try {
            const response = await authenticatedFetch(`/usuario?id=${userId}`);
            if (!response.ok) throw new Error('Usuário não encontrado.');
            
            const users = await response.json();
            if (users.length === 0) throw new Error('Usuário não encontrado.');
            const user = users[0];

            document.getElementById('nome').value = user.nome;
            document.getElementById('email').value = user.email;
            document.getElementById('dataNascimento').value = new Date(user.data_nascimento).toISOString().split('T')[0];
            document.getElementById('rg').value = user.rg;
            document.getElementById('cpf').value = user.cpf;
            document.getElementById('cargo').value = user.cargo;
            document.getElementById('status').value = user.status;
            
            document.getElementById('rg').dispatchEvent(new Event('input'));
            document.getElementById('cpf').dispatchEvent(new Event('input'));

        } catch (error) {
            formMessage.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    };

    if (userForm) {
        userForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            formMessage.innerHTML = '';

            const userData = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                data_nascimento: document.getElementById('dataNascimento').value,
                rg: document.getElementById('rg').value.replace(/\D/g, ''),
                cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
                cargo: document.getElementById('cargo').value,
                status: document.getElementById('status').value,
            };

            let response;
            try {
                if (isEditMode) {
                    response = await authenticatedFetch('/usuario', {
                        method: 'PUT',
                        body: JSON.stringify({ id: parseInt(userId), ...userData }),
                    });
                } else {
                    response = await authenticatedFetch('/usuario', {
                        method: 'POST',
                        body: JSON.stringify(userData),
                    });
                }

                if (response.ok) {
                    const savedUser = await response.json();
                    const targetUserId = savedUser.id;

                    const successMessage = isEditMode ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!';
                    formMessage.innerHTML = `<div class="alert alert-success">${successMessage} Redirecionando...</div>`;
                    
                    setTimeout(() => {
                        window.location.href = `user-detalhes.html?id=${targetUserId}`;
                    }, 2000);

                } else {
                    const errorData = await response.json();
                    const errorMessage = Array.isArray(errorData.message) ? errorData.message.join('<br>') : errorData.message;
                    formMessage.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
                }
            } catch (error) {
                formMessage.innerHTML = '<div class="alert alert-danger">Erro de conexão. Tente novamente.</div>';
                console.error('Erro ao salvar usuário:', error);
            }
        });
    }
    
    loadUserData();
});

