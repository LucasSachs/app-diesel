    document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const icon = this.querySelector('i');

    // Alterna o tipo do input entre 'password' e 'text'
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Alterna o ícone
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
});