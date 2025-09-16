document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const saveButton = document.getElementById('save-button');
    const formMessage = document.getElementById('form-message');

    const nomeInput = document.getElementById('nome');
    const descricaoInput = document.getElementById('descricao');
    const tamanhoTanqueInput = document.getElementById('tamanho_tanque');
    const valorInput = document.getElementById('valor');

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const isEditMode = productId !== null;
    const formatBRL = (raw) => {
        let digits = String(raw || '').replace(/\D/g, '');
        if (!digits) return '0,00';
        while (digits.length < 3) digits = '0' + digits;
        const intPartRaw = digits.slice(0, -2).replace(/^0+(?=\d)/, '');
        const decPart = digits.slice(-2);
        const intPart = intPartRaw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return `${intPart},${decPart}`;
    };
    const handleValorInput = (e) => {
        const value = e.target.value;
        e.target.value = formatBRL(value);
    };
    valorInput.addEventListener('input', handleValorInput);
    valorInput.addEventListener('blur', handleValorInput);

    const validateValor = () => {
        const raw = (valorInput.value || '').trim();
        if (!raw) { valorInput.setCustomValidity('Obrigatório'); return; }
        const normalized = raw.replace(/\s+/g, '').replace(/\./g, '').replace(',', '.');
        const num = Number(normalized);
        if (isNaN(num) || num <= 0) {
            valorInput.setCustomValidity('Informe um valor maior que zero');
        } else {
            valorInput.setCustomValidity('');
        }
    };
    valorInput.addEventListener('input', validateValor);
    valorInput.addEventListener('blur', validateValor);

    descricaoInput.addEventListener('input', () => {
        if (descricaoInput.value.length > 0 && descricaoInput.value.length < 3) {
            descricaoInput.setCustomValidity("A descrição precisa ter no mínimo 3 caracteres.");
        } else {
            descricaoInput.setCustomValidity("");
        }
    });

    const setupFormForEdit = async () => {
        if (!isEditMode) return;

        formTitle.textContent = 'Editar Produto';
        saveButton.textContent = 'Salvar';
        document.title = 'Editar Produto';

        try {
            const response = await authenticatedFetch(`/produto?id=${productId}`);
            if (!response.ok) throw new Error('Produto não encontrado para edição.');
            
            const products = await response.json();
            if (products.length === 0) throw new Error('Produto não encontrado.');
            
            const product = products[0];
            
            nomeInput.value = product.nome;
            descricaoInput.value = product.descricao || '';
            tamanhoTanqueInput.value = product.tamanho_tanque || '';
            if (product.valor !== undefined && product.valor !== null) {
                const num = Number(product.valor);
                valorInput.value = isNaN(num)
                    ? String(product.valor)
                    : num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }

        } catch (error) {
            console.error('Erro ao carregar produto:', error);
            formMessage.innerHTML = `<div class="alert alert-danger">Não foi possível carregar os dados do produto.</div>`;
        }
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        form.classList.add('was-validated');

        validateValor();

        if (!form.checkValidity()) {
            return;
        }

        const productData = {
            nome: nomeInput.value,
        };
        
        if (descricaoInput.value) {
            productData.descricao = descricaoInput.value;
        }
        
        const tamanhoTanqueValue = tamanhoTanqueInput.value;
        if (tamanhoTanqueValue && parseFloat(tamanhoTanqueValue) >= 0) {
            productData.tamanho_tanque = parseFloat(tamanhoTanqueValue);
        }

        validateValor();
        const rawValor = (valorInput.value || '').trim().replace(/\s+/g, '').replace(/\./g, '').replace(',', '.');
        const parsedValor = parseFloat(rawValor);
        if (!isNaN(parsedValor) && parsedValor > 0) {
            productData.valor = parsedValor;
        }

        const method = isEditMode ? 'PUT' : 'POST';
        const url = '/produto';
        
        if (isEditMode) {
            productData.id = parseInt(productId);
        }

        try {
            const response = await authenticatedFetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            const result = await response.json();

            if (response.ok) {
                formMessage.innerHTML = `<div class="alert alert-success">Produto salvo com sucesso! Redirecionando...</div>`;
                setTimeout(() => {
                    window.location.href = `produto-detalhes.html?id=${result.id}`;
                }, 1500);
            } else {
                const errorMessage = Array.isArray(result.message) ? result.message.join('<br>') : (result.message || 'Erro desconhecido do servidor.');
                formMessage.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
            }
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            formMessage.innerHTML = `<div class="alert alert-danger">Erro de conexão. Não foi possível salvar o produto.</div>`;
        }
    });

    setupFormForEdit();
});

