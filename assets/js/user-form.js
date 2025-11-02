document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('user-form');
    const formMessage = document.getElementById('form-message');
    const formTitle = document.getElementById('form-title');
    const saveButton = document.getElementById('save-button');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    const passwordLabel = document.getElementById('password-label');
    const confirmPasswordLabel = document.getElementById('confirm-password-label');
    const passwordHint = document.getElementById('password-hint');

    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const isEditMode = userId !== null;

    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

    togglePassword.addEventListener('click', () => {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    });

    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordField.setAttribute('type', type);
        toggleConfirmPassword.querySelector('i').classList.toggle('fa-eye');
        toggleConfirmPassword.querySelector('i').classList.toggle('fa-eye-slash');
    });

    if (!isEditMode) {
        passwordField.setAttribute('required', 'required');
        confirmPasswordField.setAttribute('required', 'required');
        passwordLabel.classList.add('required-field');
        confirmPasswordLabel.classList.add('required-field');
        passwordHint.style.display = 'block';
    } else {
        passwordHint.innerHTML = 'Deixe em branco se não deseja alterar a senha.';
        passwordHint.style.display = 'block';
    }

    const validatePassword = (password) => {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(password);
    };

    const validatePasswordMatch = () => {
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
        
        if (password && confirmPassword && password !== confirmPassword) {
            confirmPasswordField.setCustomValidity('As senhas não coincidem');
            return false;
        } else {
            confirmPasswordField.setCustomValidity('');
            return true;
        }
    };

    passwordField.addEventListener('input', validatePasswordMatch);
    confirmPasswordField.addEventListener('input', validatePasswordMatch);

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

            if (!validatePasswordMatch()) {
                formMessage.innerHTML = '<div class="alert alert-danger">As senhas não coincidem.</div>';
                return;
            }

            const password = passwordField.value.trim();
            const confirmPassword = confirmPasswordField.value.trim();

            if (password && !validatePassword(password)) {
                formMessage.innerHTML = '<div class="alert alert-danger">A senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais (@$!%*?&).</div>';
                return;
            }

            if (!isEditMode && !password) {
                formMessage.innerHTML = '<div class="alert alert-danger">A senha é obrigatória para criar um novo usuário.</div>';
                return;
            }

            const userData = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                data_nascimento: document.getElementById('dataNascimento').value,
                rg: document.getElementById('rg').value.replace(/\D/g, ''),
                cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
                cargo: document.getElementById('cargo').value,
                status: document.getElementById('status').value,
            };

            if (password) {
                userData.senha = password;
            }

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

