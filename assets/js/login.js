document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const errorMessage = document.getElementById('error-message');

    // Função para decodificar o token (copiada de auth.js para uso local)
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            errorMessage.style.display = 'none';

            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('http://localhost:3000/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const token = data.access_token;

                    // Salva o token nos cookies
                    document.cookie = `access_token=${token};path=/;max-age=604800`;

                    // Decodifica o token para saber o cargo
                    const userData = parseJwt(token);

                    if (userData && userData.role === 'admin') {
                        window.location.href = 'pages/adm/tabela-os.html';
                    } else if (userData && userData.role === 'colaborador') {
                        window.location.href = 'pages/funcionario/tabela-os-funcionario.html';
                    } else {
                        // Fallbackzada
                        errorMessage.textContent = 'Cargo de usuário não reconhecido.';
                        errorMessage.style.display = 'block';
                    }
                } else {
                    const errorData = await response.json();
                    errorMessage.textContent = errorData.message || 'Email ou senha inválidos.';
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                errorMessage.textContent = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
                errorMessage.style.display = 'block';
                console.error('Erro na requisição de login:', error);
            }
        });
    }
});