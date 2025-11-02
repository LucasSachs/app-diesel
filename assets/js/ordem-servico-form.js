document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('ordem-servico-form.html')) {
        const form = document.getElementById('os-form');
        const propriedadeSelect = document.getElementById('cliente-propriedade');
    const responsavelSelect = document.getElementById('responsavel');
        const servicosSelect = document.getElementById('servicos-select');
        const produtosContainer = document.getElementById('produtos-container');
        const addProductBtn = document.getElementById('add-product-btn');
        const totalValueEl = document.getElementById('total-value');
        const noProductMessage = document.getElementById('no-product-message');
        const formTitle = document.getElementById('form-title');
    const descricaoInput = document.getElementById('descricao');

        const urlParams = new URLSearchParams(window.location.search);
        const osId = urlParams.get('id');

        // Controle do campo Status - mostrar apenas na edição
        const statusFieldContainer = document.getElementById('status-field-container');
        const statusSelect = document.getElementById('status');
        
        if (osId) {
            // Modo edição - mostrar campo de status
            statusFieldContainer.style.display = 'block';
            statusSelect.required = true;
        } else {
            // Modo criação - ocultar campo de status e definir como Pendente
            statusFieldContainer.style.display = 'none';
            statusSelect.required = false;
            statusSelect.value = 'Pendente';
        }

        //  Modais 
        const createUserModal = new bootstrap.Modal(document.getElementById('create-user-modal'));
        const newUserForm = document.getElementById('new-user-form');
        const saveNewUserBtn = document.getElementById('save-new-user-btn');

        const createServiceModal = new bootstrap.Modal(document.getElementById('create-service-modal'));
        const newServiceForm = document.getElementById('new-service-form');
        const saveNewServiceBtn = document.getElementById('save-new-service-btn');

        const createProductModal = new bootstrap.Modal(document.getElementById('create-product-modal'));
        const newProductForm = document.getElementById('new-product-form');
        const saveNewProductBtn = document.getElementById('save-new-product-btn');

        let allProducts = [];
        let allServices = [];
        let allClients = [];
        let allUsers = [];

        $('.money').mask('000.000.000.000.000,00', { reverse: true });
        $('.cpf').mask('000.000.000-00', { reverse: true });
        $('#new-user-rg').mask('000000000'); // Máscara para RG - 9 dígitos

        document.querySelectorAll('.password-toggle-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const input = document.getElementById(targetId);
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });


        const getNumericValue = (formattedValue) => {
            if (!formattedValue) return 0;
            return parseFloat(formattedValue.replace(/\./g, '').replace(',', '.'));
        };

        const formatCurrency = (value) => {
            const numberValue = parseFloat(value);
            return isNaN(numberValue) ? (0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        };

        const calculateTotal = () => {
            let total = 0;
            document.querySelectorAll('.produto-row').forEach(row => {
                const quantidade = parseFloat(row.querySelector('.produto-quantidade').value) || 0;
                const valor = getNumericValue(row.querySelector('.produto-valor').value);
                total += quantidade * valor;
            });
            total += getNumericValue(document.getElementById('valor-mo').value);
            total += getNumericValue(document.getElementById('valor-deslocamento').value);
            totalValueEl.textContent = formatCurrency(total);
        };
        

        const updatePropriedadeSelect = () => {
            const currentVal = $(propriedadeSelect).val();
            propriedadeSelect.innerHTML = '<option value="">Selecione...</option>';
            allClients.forEach(cliente => {
                if (cliente.propriedades && cliente.propriedades.length > 0) {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = cliente.nome;
                    cliente.propriedades.forEach(prop => {
                        const option = document.createElement('option');
                        option.value = prop.id;
                        const cadproText = prop.cadpro ? ` (CAD/PRO: ${prop.cadpro})` : '';
                        const descriptionText = prop.descricao || `Propriedade de ${cliente.nome}`;
                        option.textContent = `${descriptionText}${cadproText}`;
                        optgroup.appendChild(option);
                    });
                    propriedadeSelect.appendChild(optgroup);
                }
            });
            $(propriedadeSelect).val(currentVal).trigger('change');
        };
        
        const updateResponsavelSelect = () => {
            const currentVals = $(responsavelSelect).val();
            responsavelSelect.innerHTML = '';
            allUsers
                .filter(usuario => usuario.status === 'ativo')
                .forEach(usuario => {
                    const option = document.createElement('option');
                    option.value = usuario.id;
                    option.textContent = usuario.nome;
                    responsavelSelect.appendChild(option);
                });
            $(responsavelSelect).val(currentVals).trigger('change');
        };

        const updateServicoSelect = () => {
            const currentVals = $(servicosSelect).val();
            servicosSelect.innerHTML = '';
            allServices.forEach(servico => {
                const option = document.createElement('option');
                option.value = servico.id;
                option.textContent = servico.nome;
                servicosSelect.appendChild(option);
            });
            $(servicosSelect).val(currentVals).trigger('change');
        };
        
        const updateAllProductSelects = () => {
            document.querySelectorAll('.produto-select').forEach(select => {
                const $select = $(select);
                const currentVal = $select.val();
                if ($select.data('select2')) {
                    $select.select2('destroy');
                }
                select.innerHTML = '<option value="">Selecione um produto...</option>';
                allProducts.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.id;
                    option.textContent = p.nome;
                    option.dataset.valor = p.valor;
                    select.appendChild(option);
                });
                $select.val(currentVal);
                $select.select2({ theme: 'bootstrap-5', placeholder: 'Selecione um produto...', width: '100%' });
                $select.trigger('change');
            });
        };

        const fetchInitialData = async () => {
            try {
                const [clientesRes, usuariosRes, servicosRes, produtosRes] = await Promise.all([
                    authenticatedFetch('/cliente'),
                    authenticatedFetch('/usuario'),
                    authenticatedFetch('/servico'),
                    authenticatedFetch('/produto')
                ]);

                allClients = await clientesRes.json();
                allUsers = await usuariosRes.json();
                allServices = await servicosRes.json();
                allProducts = await produtosRes.json();
                
                updatePropriedadeSelect();
                updateResponsavelSelect();
                updateServicoSelect();

                $(propriedadeSelect).select2({
                    theme: "bootstrap-5",
                    placeholder: 'Pesquise por cliente ou propriedade',
                });
                
                $(responsavelSelect).select2({
                    theme: "bootstrap-5",
                    placeholder: 'Selecione os responsáveis',
                    closeOnSelect: false,
                });

                $(servicosSelect).select2({
                    theme: "bootstrap-5",
                    placeholder: 'Pesquise e selecione os serviços',
                    closeOnSelect: false,
                });

                // Não cria linha de produto aqui; será criada após init (novo) ou via preenchimento (edição)

            } catch (error) {
                console.error('Erro ao carregar dados iniciais:', error);
                alert('Erro ao carregar dados da página. Verifique o console.');
            }
        };
        
        // Produtos
        const addProductHeader = () => {
            if (!produtosContainer.querySelector('.produto-header')) {
                const header = document.createElement('div');
                header.className = 'row g-2 mb-2 produto-header';
                header.innerHTML = `
                    <div class="col-md-4">
                        <label class="form-label fw-bold mb-0">Produto</label>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label fw-bold mb-0">Quantidade</label>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold mb-0">Valor Unitário</label>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label fw-bold mb-0">Subtotal</label>
                    </div>
                    <div class="col-md-1">
                    </div>
                `;
                produtosContainer.insertBefore(header, produtosContainer.firstChild);
            }
        };

        const createProductRow = () => {
            if(produtosContainer.querySelector('#no-product-message')) {
                 produtosContainer.innerHTML = '';
            }

            // Adiciona o cabeçalho se não existir
            addProductHeader();

            const rowId = `produto-row-${Date.now()}`;
            const div = document.createElement('div');
            div.className = 'row g-2 mb-2 align-items-center produto-row';
            div.id = rowId;

            div.innerHTML = `
                <div class="col-md-4">
                    <select class="form-select produto-select">
                        <option value="">Selecione um produto...</option>
                        ${allProducts.map(p => `<option value="${p.id}" data-valor="${p.valor}">${p.nome}</option>`).join('')}
                    </select>
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control produto-quantidade" placeholder="Ex: 10" min="0" step="0.001">
                </div>
                <div class="col-md-3">
                    <input type="text" class="form-control produto-valor money" placeholder="Ex: 50,00">
                </div>
                <div class="col-md-2">
                     <input type="text" class="form-control produto-subtotal" placeholder="R$ 0,00" disabled>
                </div>
                <div class="col-md-1 text-end">
                    <button type="button" class="btn btn-sm btn-danger remove-product-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;

            produtosContainer.appendChild(div);
            $('#' + rowId + ' .money').mask('000.000.000.000.000,00', { reverse: true });

            const select = div.querySelector('.produto-select');
            const quantidadeInput = div.querySelector('.produto-quantidade');
            const valorInput = div.querySelector('.produto-valor');
            const subtotalInput = div.querySelector('.produto-subtotal');

            const updateSubtotal = () => {
                const qtd = parseFloat(quantidadeInput.value) || 0;
                const val = getNumericValue(valorInput.value);
                subtotalInput.value = formatCurrency(qtd * val);
                calculateTotal();
            };
            
            $(select).select2({
                theme: "bootstrap-5",
                placeholder: 'Selecione um produto...',
                width: '100%'
            });

            const onProductChange = () => {
                const selectedId = $(select).val();
                const produto = allProducts.find(p => String(p.id) === String(selectedId));

                let unitValue = NaN;
                if (produto && produto.valor !== undefined && produto.valor !== null) {
                    if (typeof produto.valor === 'number') {
                        unitValue = produto.valor;
                    } else if (typeof produto.valor === 'string') {
                        unitValue = produto.valor.includes(',') ? getNumericValue(produto.valor) : parseFloat(produto.valor);
                    }
                }

                if (isNaN(unitValue)) {
                    const opt = select.querySelector(`option[value="${selectedId}"]`);
                    const raw = opt?.dataset?.valor;
                    if (raw !== undefined) {
                        unitValue = raw.includes(',') ? getNumericValue(raw) : parseFloat(raw);
                    }
                }

                const formatted = isNaN(unitValue) ? '' : unitValue.toFixed(2).replace('.', ',');
                $(valorInput).val(formatted);
                $(valorInput).trigger('input');
                $(valorInput).trigger('keyup');
                valorInput.dispatchEvent(new Event('input', { bubbles: true }));
                updateSubtotal();
            };

            select.addEventListener('change', onProductChange);
            $(select).on('select2:select', onProductChange);

            quantidadeInput.addEventListener('input', updateSubtotal);
            valorInput.addEventListener('input', updateSubtotal);
            return div;
        };
        
    addProductBtn.addEventListener('click', () => createProductRow());
        
        produtosContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remove-product-btn')) {
                e.target.closest('.produto-row').remove();
                if (produtosContainer.querySelectorAll('.produto-row').length === 0) {
                     // Remove o cabeçalho também
                     const header = produtosContainer.querySelector('.produto-header');
                     if (header) header.remove();
                     produtosContainer.innerHTML = '<div id="no-product-message" class="text-center text-muted">Nenhum produto adicionado.</div>';
                }
                calculateTotal();
            }
        });

        // Listeners dos Modais 
        
        saveNewUserBtn.addEventListener('click', async () => {
            const senha = document.getElementById('new-user-senha').value;
            const confirmarSenha = document.getElementById('new-user-confirmar-senha').value;
            
            // Validação de senha
            if (!senha || !confirmarSenha) {
                alert('Por favor, preencha os campos de senha.');
                return;
            }
            
            if (senha.length < 6) {
                alert('A senha deve ter no mínimo 6 caracteres.');
                return;
            }
            
            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem. Por favor, verifique.');
                return;
            }
            
            const dataNascimentoValue = document.getElementById('new-user-nascimento').value;
            
            let dataNascimentoISO = null;
            if (dataNascimentoValue) {
                const localDate = new Date(`${dataNascimentoValue}T00:00:00`);
                dataNascimentoISO = localDate.toISOString();
            }

            const payload = {
                nome: document.getElementById('new-user-nome').value,
                cpf: document.getElementById('new-user-cpf').value.replace(/\D/g, ''),
                rg: document.getElementById('new-user-rg').value,
                email: document.getElementById('new-user-email').value,
                senha: senha,
                cargo: document.getElementById('new-user-cargo').value,
                status: document.getElementById('new-user-status').value,
                data_nascimento: dataNascimentoISO
            };
            
            try {
                const response = await authenticatedFetch('/usuario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    const errorMessage = Array.isArray(errorData.message) ? errorData.message.join('\n') : (errorData.message || 'Falha ao criar usuário.');
                    throw new Error(errorMessage);
                }

                const newUser = await response.json();
                allUsers.push(newUser);
                updateResponsavelSelect();
                const current = $(responsavelSelect).val() || [];
                $(responsavelSelect).val([...new Set([...current, String(newUser.id)])]).trigger('change');
                newUserForm.reset();
                createUserModal.hide();
                alert('Responsável criado com sucesso!');
            } catch (error) {
                alert(`Erro:\n${error.message}`);
            }
        });
        
        saveNewServiceBtn.addEventListener('click', async () => {
            const descricaoValue = document.getElementById('new-service-descricao').value;
            const payload = {
                nome: document.getElementById('new-service-nome').value,
                descricao: descricaoValue.trim() ? descricaoValue : null
            };
            if (!payload.nome) { alert('O nome do serviço é obrigatório.'); return; }
            try {
                const response = await authenticatedFetch('/servico', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

                if (!response.ok) {
                    const errorData = await response.json();
                    const errorMessage = Array.isArray(errorData.message) ? errorData.message.join('\n') : (errorData.message || 'Falha ao criar serviço.');
                    throw new Error(errorMessage);
                }

                const newService = await response.json();
                allServices.push(newService);
                updateServicoSelect();
                const currentSelection = $(servicosSelect).val();
                $(servicosSelect).val([...currentSelection, newService.id.toString()]).trigger('change');
                newServiceForm.reset();
                createServiceModal.hide();
                alert('Serviço criado com sucesso!');
            } catch (error) {
                alert(`Erro:\n${error.message}`);
            }
        });

        saveNewProductBtn.addEventListener('click', async () => {
            const descricaoValue = document.getElementById('new-product-descricao').value;
            const payload = {
                nome: document.getElementById('new-product-nome').value,
                descricao: descricaoValue.trim() ? descricaoValue : null,
                tamanho_tanque: parseFloat(document.getElementById('new-product-tamanho').value) || null,
                valor: getNumericValue(document.getElementById('new-product-valor').value),
            };
             if (!payload.nome || !payload.valor) {
                alert('Nome e Valor Unitário são obrigatórios.');
                return;
            }
            try {
                const response = await authenticatedFetch('/produto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

                if (!response.ok) {
                    const errorData = await response.json();
                    const errorMessage = Array.isArray(errorData.message) ? errorData.message.join('\n') : (errorData.message || 'Falha ao criar produto.');
                    throw new Error(errorMessage);
                }

                const newProduct = await response.json();
                allProducts.push(newProduct);
                updateAllProductSelects();
                newProductForm.reset();
                createProductModal.hide();
                alert('Produto criado com sucesso!');
            } catch(error) {
                console.error("Erro ao salvar produto:", error);
                alert(`Erro:\n${error.message}`);
            }
        });
        form.addEventListener('input', (e) => {
             if (e.target.id === 'valor-mo' || e.target.id === 'valor-deslocamento') {
                calculateTotal();
            }
        });
        
        // Atualização Automática da Lista de Clientes 
        window.addEventListener('focus', async () => {
            if (localStorage.getItem('clienteAtualizado') === 'true') {
                localStorage.removeItem('clienteAtualizado');
                try {
                    console.log('Detectada atualização de cliente. Recarregando lista...');
                    const response = await authenticatedFetch('/cliente');
                    if(response.ok) {
                        allClients = await response.json();
                        updatePropriedadeSelect();
                        console.log('Lista de clientes atualizada automaticamente.');
                    }
                } catch (error) {
                    console.error('Falha ao recarregar lista de clientes:', error);
                }
            }
        });
        
        // Preenchimento do Formulário para Edição (dados do banco)
        const prefillOsForm = (os) => {
            if (!os) return;
            if (formTitle) formTitle.textContent = 'Editar Ordem de Serviço';

            // Seleções básicas
            if (os.propriedade_id) {
                $(propriedadeSelect).val(String(os.propriedade_id)).trigger('change');
            }
            if (Array.isArray(os.usuarios)) {
                const userIds = os.usuarios.map(u => String(u.id));
                $(responsavelSelect).val(userIds).trigger('change');
            }
            if (Array.isArray(os.servicos)) {
                const serviceIds = os.servicos.map(s => String(s.id));
                $(servicosSelect).val(serviceIds).trigger('change');
            }
            if (os.status) {
                $('#status').val(os.status).trigger('change');
            }

            if (descricaoInput) {
                descricaoInput.value = os.descricao || '';
            }

            // Valores monetários
            const formatBR = (num) => (Number(num || 0).toFixed(2)).replace('.', ',');
            $('#valor-mo').val(formatBR(os.valor_mo)).trigger('input');
            $('#valor-deslocamento').val(formatBR(os.valor_deslocamento)).trigger('input');

            // Produtos
            produtosContainer.innerHTML = '';
            const itens = Array.isArray(os.ordem_servico_produtos) ? os.ordem_servico_produtos : [];
            if (itens.length === 0) {
                createProductRow();
            } else {
                itens.forEach(item => {
                    const row = createProductRow();
                    if (!row) return;
                    const select = row.querySelector('.produto-select');
                    const qtdInput = row.querySelector('.produto-quantidade');
                    const valorInput = row.querySelector('.produto-valor');

                    $(select).val(String(item.produto_id)).trigger('change');
                    qtdInput.value = item.quantidade;
                    valorInput.value = formatBR(item.valor);

                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    qtdInput.dispatchEvent(new Event('input', { bubbles: true }));
                    valorInput.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }
            try { calculateTotal(); } catch {}
        };

        const init = async () => {
            await fetchInitialData();
            if (osId) {
                try {
                    const res = await authenticatedFetch(`/ordem-servico/${osId}`);
                    if (res?.ok) {
                        const data = await res.json();
                        const os = Array.isArray(data) ? data[0] : data;
                        prefillOsForm(os);
                    } else {
                        createProductRow();
                    }
                } catch (e) {
                    console.error('Erro ao carregar OS para edição:', e);
                    createProductRow();
                }
            } else {
                createProductRow();
            }
        };
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const produtosPayload = [];
            let invalidRow = null;
            document.querySelectorAll('.produto-row').forEach(row => {
                const produtoIdStr = row.querySelector('.produto-select').value;
                const quantidadeVal = parseFloat(row.querySelector('.produto-quantidade').value);
                const valorVal = getNumericValue(row.querySelector('.produto-valor').value);

                const hasAnyInput = produtoIdStr || quantidadeVal > 0 || valorVal > 0;
                if (!hasAnyInput) return;

                const produto_id = parseInt(produtoIdStr);
                const quantidade = Number(quantidadeVal);
                const valor = Number(valorVal);

                if (!produto_id || !(quantidade > 0) || !(valor > 0)) {
                    invalidRow = row;
                    return;
                }
                produtosPayload.push({ produto_id, quantidade, valor });
            });

            if (invalidRow) {
                invalidRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                alert('Verifique os produtos: selecione o produto e informe quantidade e valor maiores que zero.');
                return;
            }

            if (produtosPayload.length === 0) {
                alert('Adicione pelo menos um produto com quantidade e valor.');
                return;
            }

            const servicosPayload = ($(servicosSelect).val() || []).map(id => parseInt(id));
            const usuariosPayload = ($(responsavelSelect).val() || []).map(id => parseInt(id));

            const valorMo = getNumericValue(document.getElementById('valor-mo').value);
            const valorDesloc = getNumericValue(document.getElementById('valor-deslocamento').value);

            const payload = {
                status: document.getElementById('status').value,
                propriedade_id: parseInt(propriedadeSelect.value),
                usuarios: usuariosPayload,
                valor_mo: valorMo,
                valor_deslocamento: valorDesloc,
                ordem_servico_produtos: produtosPayload,
                servicos: servicosPayload,
                descricao: (descricaoInput?.value || '').trim() || null,
            };

            if (!payload.propriedade_id || !payload.usuarios?.length) {
                alert('Por favor, selecione o Cliente/Propriedade e pelo menos um Responsável.');
                return;
            }
            if (!(payload.valor_mo > 0) || !(payload.valor_deslocamento > 0)) {
                alert('Informe valores positivos para Mão de Obra e Deslocamento.');
                return;
            }

            try {
                const isEdit = Boolean(osId);
                const url = isEdit ? '/ordem-servico' : '/ordem-servico';
                const method = isEdit ? 'PUT' : 'POST';

                const bodyPayload = isEdit ? { ...payload, id: parseInt(osId) } : payload;

                const response = await authenticatedFetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyPayload),
                });
                if (!response?.ok) {
                    let message = 'Erro ao salvar Ordem de Serviço.';
                    try {
                        const errorData = await response.json();
                        message = Array.isArray(errorData?.message) ? errorData.message.join('\n') : (errorData?.message || message);
                    } catch {}
                    throw new Error(message);
                }
                const result = await response.json();

                // Verifica se o backend persistiu os produtos
                try {
                    const checkRes = await authenticatedFetch(`/ordem-servico/${result.id}`);
                    if (checkRes?.ok) {
                        const os = await checkRes.json();
                        const persisted = Array.isArray(os?.[0]?.ordem_servico_produtos) ? os[0].ordem_servico_produtos.length : (Array.isArray(os?.ordem_servico_produtos) ? os.ordem_servico_produtos.length : 0);
                        if (!persisted) {
                            alert('Ordem de Serviço criada, mas os produtos não foram salvos pelo backend.');
                        }
                    }
                } catch {}

                alert('Ordem de Serviço salva com sucesso!');
                const newId = result?.id || osId;
                window.location.href = `os-detalhes.html?id=${newId}`;
            } catch (error) {
                console.error('Erro no submit:', error);
                alert(`Erro:\n${error.message}`);
            }
        });

        init();
    }
});

