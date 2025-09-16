// Função para pegar o token dos cookies do navegador
function getToken() {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    for (const cookie of cookies) {
        if (cookie.startsWith('access_token=')) {
            return cookie.substring('access_token='.length);
        }
    }
    return null;
}

// Função para decodificar e pegar os dados (payload)
function parseJwt(token) {
    if (!token) {
        return null;
    }
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

// verificação de cargo
function checkAuth() {
    const token = getToken();

    if (!token) {
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
             window.location.replace('/index.html');
        }
        return;
    }

    const userData = parseJwt(token);
    if (!userData || !userData.role) {
        logout();
        return;
    }

    const userRole = userData.role;
    const currentPath = window.location.pathname;

    if (userRole === 'admin' && !currentPath.startsWith('/pages/adm/')) {
        window.location.replace('/pages/adm/tabela-os.html');
    }
    else if (userRole === 'colaborador' && !currentPath.startsWith('/pages/funcionario/')) {
         window.location.replace('/pages/funcionario/tabela-os-funcionario.html');
    }
}


// Função de logout do sisteminha dos guri
function logout() {
    document.cookie = 'access_token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.replace('/index.html');
}

async function authenticatedFetch(url, options = {}) {
    const token = getToken();
    if (!token) {
        checkAuth();
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    const response = await fetch(`http://localhost:3000${url}`, { ...options, headers });

    if (response.status === 401) {
        logout();
        return;
    }

    return response;
}

if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
    checkAuth();
}

function getUserData() {
    const token = getToken();
    return parseJwt(token);
}