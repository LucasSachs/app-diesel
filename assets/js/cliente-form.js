// Preenche UF automaticamente com a sigla
(function () {
    function normalizeText(s) {
        return String(s || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase()
            .replace(/[^A-Z\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function estadoParaUF(nomeOuSigla) {
        if (!nomeOuSigla) return '';
        const v = String(nomeOuSigla).trim().toUpperCase();
        if (/^[A-Z]{2}$/.test(v)) return v;

        const map = {
            'ACRE': 'AC',
            'ALAGOAS': 'AL',
            'AMAPA': 'AP',
            'AMAPÁ': 'AP',
            'AMAZONAS': 'AM',
            'BAHIA': 'BA',
            'CEARA': 'CE',
            'CEARÁ': 'CE',
            'DISTRITO FEDERAL': 'DF',
            'ESPIRITO SANTO': 'ES',
            'ESPÍRITO SANTO': 'ES',
            'GOIAS': 'GO',
            'GOIÁS': 'GO',
            'MARANHAO': 'MA',
            'MARANHÃO': 'MA',
            'MATO GROSSO': 'MT',
            'MATO GROSSO DO SUL': 'MS',
            'MINAS GERAIS': 'MG',
            'PARA': 'PA',
            'PARÁ': 'PA',
            'PARAIBA': 'PB',
            'PARAÍBA': 'PB',
            'PARANA': 'PR',
            'PARANÁ': 'PR',
            'PERNAMBUCO': 'PE',
            'PIAUI': 'PI',
            'PIAUÍ': 'PI',
            'RIO DE JANEIRO': 'RJ',
            'RIO GRANDE DO NORTE': 'RN',
            'RIO GRANDE DO SUL': 'RS',
            'RONDONIA': 'RO',
            'RONDÔNIA': 'RO',
            'RORAIMA': 'RR',
            'SANTA CATARINA': 'SC',
            'SAO PAULO': 'SP',
            'SÃO PAULO': 'SP',
            'SERGIPE': 'SE',
            'TOCANTINS': 'TO'
        };
        const key = map[v] ? v : normalizeText(v);
        return map[key] || '';
    }

    function toUfSigla(value) {
        const sigla = estadoParaUF(value);
        return sigla || String(value || '')
            .toUpperCase()
            .replace(/[^A-Z]/g, '')
            .slice(0, 2);
    }

    function findUfInput(startEl) {
        const scope = (startEl && startEl.closest && startEl.closest('form')) || document;
        return scope.querySelector('input[name$="[uf]"], input[name="uf"], input#uf');
    }

    async function preencherUFPorCEP(cepInput) {
        if (!cepInput) return;
        const raw = (cepInput.value || '').replace(/\D/g, '');
        if (raw.length !== 8) return;
        try {
            const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
            const data = await res.json();
            if (data && !data.erro) {
                const ufValue = data.estado || data.state || data.uf || '';
                const ufSigla = toUfSigla(ufValue);
                const ufInput = findUfInput(cepInput);
                if (ufInput && ufSigla) {
                    ufInput.value = ufSigla;
                }
            }
        } catch (e) {
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        const form = document.querySelector('#cliente-form') || document.querySelector('form[data-entity="cliente"], form[name="cliente-form"]');

        const cepSelectors = 'input[name$="[cep]"], input[name="cep"], input#cep';
        const scope = form || document;
        scope.querySelectorAll(cepSelectors).forEach((cepInput) => {
            cepInput.addEventListener('blur', () => preencherUFPorCEP(cepInput));
            cepInput.addEventListener('change', () => preencherUFPorCEP(cepInput));
        });

        // para garantir que UF tera duas letras maiusculas
        scope.querySelectorAll('input[name$="[uf]"], input[name="uf"], input#uf').forEach((ufInput) => {
            ufInput.setAttribute('maxlength', '2');
            ufInput.addEventListener('input', () => {
                const val = ufInput.value || '';
                if (val.length !== 2 || /[^A-Za-z]/.test(val)) {
                    ufInput.value = toUfSigla(val);
                } else {
                    ufInput.value = val.toUpperCase();
                }
            });
        });
    });
})();

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get('id');
    const isEditMode = clientId !== null;

    const form = document.getElementById('client-form');
    const formTitle = document.getElementById('form-title');
    const saveButton = document.getElementById('save-button');
    const formMessage = document.getElementById('form-message');

    // Botões de adicionar (email, telefone, propriedade)
    const addEmailBtn = document.getElementById('add-email');
    const addTelefoneBtn = document.getElementById('add-telefone');
    const addPropertyBtn = document.getElementById('add-property');

    // Containers
    const emailsContainer = document.getElementById('emails-container');
    const telefonesContainer = document.getElementById('telefones-container');
    const propertiesContainer = document.getElementById('properties-container');

    // Templates
    const emailTemplate = document.getElementById('email-template');
    const telefoneTemplate = document.getElementById('telefone-template');
    const propertyTemplate = document.getElementById('property-template');

    const stateMap = {
        'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
        'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
        'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
        'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
        'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
        'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
        'SE': 'Sergipe', 'TO': 'Tocantins'
    };

    // máscara de telefone
    const handleTelefoneInput = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        }
        e.target.value = value;
    };

    const addEmailHeader = () => {
        if (!emailsContainer.querySelector('.email-header')) {
            const header = document.createElement('div');
            header.className = 'row g-2 mb-2 email-header';
            header.innerHTML = `
                <div class="col">
                    <label class="form-label fw-bold mb-0">E-mail(s)</label>
                </div>
            `;
            emailsContainer.insertBefore(header, emailsContainer.firstChild);
        }
    };

    const addTelefoneHeader = () => {
        if (!telefonesContainer.querySelector('.telefone-header')) {
            const header = document.createElement('div');
            header.className = 'row g-2 mb-2 telefone-header';
            header.innerHTML = `
                <div class="col">
                    <label class="form-label fw-bold mb-0">Telefone(s)</label>
                </div>
            `;
            telefonesContainer.insertBefore(header, telefonesContainer.firstChild);
        }
    };

    // campos dinâmicos
    const addField = (template, container) => {
        const clone = template.content.cloneNode(true);
        const newField = clone.querySelector('.dynamic-field');
        container.appendChild(newField);
        return newField;
    };

    const addProperty = (prop = {}) => {
        const clone = propertyTemplate.content.cloneNode(true);
        const newItem = clone.querySelector('.property-item');
        const endereco = prop.endereco || {};

        if (prop.id) {
            newItem.dataset.propertyId = prop.id;
        }
        if (endereco.id) {
            newItem.dataset.addressId = endereco.id;
        }

        newItem.querySelector('[data-field="cadpro"]').value = prop.cadpro || '';
        newItem.querySelector('[data-field="cep"]').value = endereco.cep || '';
        newItem.querySelector('[data-field="logradouro"]').value = endereco.logradouro || '';
        newItem.querySelector('[data-field="numero"]').value = endereco.numero || '';
        newItem.querySelector('[data-field="complemento"]').value = endereco.complemento || '';
        newItem.querySelector('[data-field="bairro"]').value = endereco.bairro || '';
        newItem.querySelector('[data-field="cidade"]').value = endereco.cidade?.descricao || '';
        const ufInicial = endereco.uf?.descricao || '';
        newItem.querySelector('[data-field="uf"]').value = (ufInicial || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
        newItem.querySelector('[data-field="lat"]').value = endereco.lat || '';
        newItem.querySelector('[data-field="long"]').value = endereco.long || '';
        
        propertiesContainer.appendChild(newItem);
        // Normaliza digitação da UF (sempre 2 letras maiúsculas)
        const ufEl = newItem.querySelector('[data-field="uf"]');
        if (ufEl) {
            ufEl.setAttribute('maxlength', '2');
            ufEl.addEventListener('input', () => {
                ufEl.value = (ufEl.value || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
            });
        }
        return newItem;
    };

    addEmailBtn.addEventListener('click', () => {
        addEmailHeader();
        addField(emailTemplate, emailsContainer);
    });
    addTelefoneBtn.addEventListener('click', () => {
        addTelefoneHeader();
        const newField = addField(telefoneTemplate, telefonesContainer);
        const input = newField.querySelector('input');
        input.addEventListener('input', handleTelefoneInput);
    });
    addPropertyBtn.addEventListener('click', () => addProperty());

    document.addEventListener('click', (e) => {
        if (e.target.closest('.remove-field-btn')) {
            const field = e.target.closest('.dynamic-field');
            const container = field.parentElement;
            field.remove();
            
            // Remove o cabeçalho se não houver mais campos
            if (container.id === 'emails-container' && !container.querySelector('.dynamic-field')) {
                const header = container.querySelector('.email-header');
                if (header) header.remove();
            }
            if (container.id === 'telefones-container' && !container.querySelector('.dynamic-field')) {
                const header = container.querySelector('.telefone-header');
                if (header) header.remove();
            }
        }
        if (e.target.closest('.remove-property-btn')) {
            e.target.closest('.property-item').remove();
        }
    });
    
    // ViaCEP
    document.addEventListener('input', async (e) => {
        if (e.target.classList.contains('cep-input')) {
            const cep = e.target.value.replace(/\D/g, '');
            if (cep.length === 8) {
                const propertyItem = e.target.closest('.property-item');
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    if (!data.erro) {
                        propertyItem.querySelector('[data-field="logradouro"]').value = data.logradouro;
                        propertyItem.querySelector('[data-field="bairro"]').value = data.bairro;
                        propertyItem.querySelector('[data-field="cidade"]').value = data.localidade;
                        // Garante UF como sigla (2 letras)
                        propertyItem.querySelector('[data-field="uf"]').value = (data.uf || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
                    }
                } catch (error) {
                    console.error("Erro ao buscar CEP:", error);
                }
            }
        } else if (e.target && e.target.matches('[data-field="uf"]')) {
            const ufEl = e.target;
            ufEl.value = (ufEl.value || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
        }
    });

    const loadClientData = async () => {
        if (!isEditMode) {
            addEmailHeader();
            addField(emailTemplate, emailsContainer);
            addTelefoneHeader();
            const newPhoneField = addField(telefoneTemplate, telefonesContainer);
            newPhoneField.querySelector('input').addEventListener('input', handleTelefoneInput);
            addProperty();
            return;
        }

        formTitle.textContent = 'Editar Cliente';
        document.title = 'Editar Cliente';

        try {
            const response = await authenticatedFetch(`/cliente?id=${clientId}`);
            if (!response.ok) throw new Error('Cliente não encontrado.');
            const clients = await response.json();
            if (clients.length === 0) throw new Error('Cliente não encontrado.');
            const client = clients[0];

            document.getElementById('nome').value = client.nome;
            document.getElementById('cpf_cnpj').value = client.cpf_cnpj;

            emailsContainer.innerHTML = '';
            telefonesContainer.innerHTML = '';
            propertiesContainer.innerHTML = '';
            
            if (client.emails && client.emails.length > 0) {
                addEmailHeader();
                client.emails.forEach(email => {
                    const newField = addField(emailTemplate, emailsContainer);
                    newField.querySelector('input').value = email.descricao;
                });
            }

            if (client.telefones && client.telefones.length > 0) {
                addTelefoneHeader();
                client.telefones.forEach(telefone => {
                    const newField = addField(telefoneTemplate, telefonesContainer);
                    const input = newField.querySelector('input');
                    input.value = telefone.descricao;
                    input.addEventListener('input', handleTelefoneInput);
                    input.dispatchEvent(new Event('input'));
                });
            }

            for (const prop of client.propriedades) {
                try {
                    const viaCepResponse = await fetch(`https://viacep.com.br/ws/${prop.endereco.cep}/json/`);
                    const viaCepData = await viaCepResponse.json();
                    if (!viaCepData.erro) {
                        prop.endereco.logradouro = viaCepData.logradouro;
                        prop.endereco.bairro = viaCepData.bairro;
                    }
                } catch (e) { console.error("Falha ao buscar CEP para edição", e) }
                addProperty(prop);
            }

        } catch (error) {
            formMessage.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const getNumericValue = (element) => {
            const value = element.value;
            return value ? parseFloat(value) : null;
        }

        const clientData = {
            nome: document.getElementById('nome').value,
            cpf_cnpj: document.getElementById('cpf_cnpj').value.replace(/\D/g, ''),
            emails: Array.from(emailsContainer.querySelectorAll('input')).map(input => ({ descricao: input.value })).filter(e => e.descricao.trim() !== ''),
            telefones: Array.from(telefonesContainer.querySelectorAll('input')).map(input => ({ descricao: input.value.replace(/\D/g, '') })).filter(t => t.descricao !== ''),
            propriedades: Array.from(propertiesContainer.querySelectorAll('.property-item')).map(item => {
                const enderecoRaw = {
                    cep: item.querySelector('[data-field="cep"]').value.replace(/\D/g, ''),
                    logradouro: item.querySelector('[data-field="logradouro"]').value,
                    numero: getNumericValue(item.querySelector('[data-field="numero"]')),
                    bairro: item.querySelector('[data-field="bairro"]').value,
                    cidade: item.querySelector('[data-field="cidade"]').value,
                    uf: item.querySelector('[data-field="uf"]').value,
                    lat: getNumericValue(item.querySelector('[data-field="lat"]')),
                    long: getNumericValue(item.querySelector('[data-field="long"]')),
                    complemento: item.querySelector('[data-field="complemento"]').value
                };

                const endereco = {};
                Object.entries(enderecoRaw).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && String(value).trim() !== '' && !Number.isNaN(value)) {
                        if (key === 'cidade' || key === 'uf') endereco[key] = { descricao: value };
                        else endereco[key] = value;
                    }
                });

                const property = { cadpro: item.querySelector('[data-field="cadpro"]').value.replace(/\D/g, '')};

                if (Object.keys(endereco).length > 0) property.endereco = endereco;
                if (item.dataset.propertyId) property.id = parseInt(item.dataset.propertyId, 10);
                if (item.dataset.addressId && property.endereco) property.endereco.id = parseInt(item.dataset.addressId, 10);

                return property;
            })
        };

        console.log(clientData)

        const method = isEditMode ? 'PUT' : 'POST';
        const url = '/cliente';
        if (isEditMode) {
            clientData.id = parseInt(clientId);
        }

        try {
            const response = await authenticatedFetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            });
            const result = await response.json();
            if (response.ok) {
                formMessage.innerHTML = `<div class="alert alert-success">Cliente salvo com sucesso!</div>`;
                localStorage.setItem('clienteAtualizado', 'true');
                setTimeout(() => {
                    if (isEditMode) {
                        window.location.href = `cliente-detalhes.html?id=${result.id || clientId}`;
                    } else {
                        window.location.href = 'tabela-cliente.html';
                    }
                }, 1000);

            } else {
                const errorMessage = Array.isArray(result.message) ? result.message.join('<br>') : (result.message || 'Erro desconhecido.');
                formMessage.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
            }
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            formMessage.innerHTML = `<div class="alert alert-danger">Erro de conexão ao salvar cliente.</div>`;
        }
    });

    loadClientData();
});