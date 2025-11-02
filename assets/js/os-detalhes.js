document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const osId = params.get('id');

    const loadingIndicator = document.getElementById('loading-indicator');
    const detailsContainer = document.getElementById('details-container');

    if (!osId) {
        detailsContainer.innerHTML = '<div class="alert alert-danger">ID da Ordem de Serviço não fornecido.</div>';
        loadingIndicator.classList.add('d-none');
        detailsContainer.classList.remove('d-none');
        return;
    }

    const formatCurrency = (value) => {
        const numberValue = parseFloat(value);
        if (isNaN(numberValue)) return 'R$ 0,00';
        return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    try {
        const response = await authenticatedFetch(`/ordem-servico/${osId}`);
        if (!response.ok) {
            throw new Error('Ordem de Serviço não encontrada.');
        }
    const data = await response.json();
    const os = Array.isArray(data) ? data[0] : data;
        
        // Preencher Informações
    document.getElementById('os-id').textContent = os.id;
    document.title = `Detalhes da OS #${os.id}`;

    // Cliente e Propriedade
    const cliente = os.propriedade?.cliente || {};
    const propriedade = os.propriedade || {};
    const endereco = propriedade.endereco || {};
    const cidade = endereco.cidade || {};
    const uf = endereco.uf || {};
    document.getElementById('cliente-nome').textContent = cliente.nome || 'Não informado';
    document.getElementById('cliente-cpfcnpj').textContent = cliente.cpf_cnpj || 'Não informado';
    document.getElementById('propriedade-descricao').textContent = propriedade.descricao || 'Não informada';
    document.getElementById('propriedade-cadpro').textContent = propriedade.cadpro || 'N/A';
    const endLogradouro = document.getElementById('end-logradouro');
    const endBairro = document.getElementById('end-bairro');
    const endCidadeUf = document.getElementById('end-cidade-uf');
        const endCep = document.getElementById('end-cep');
        const endNumero = document.getElementById('end-numero');
    const endComplemento = document.getElementById('end-complemento');
    const endCoord = document.getElementById('end-coord');

        const setEnderecoFields = (end) => {
            const c = end?.cidade?.descricao;
            const u = end?.uf?.descricao;
            const cidadeUfStr = [c, u].filter(Boolean).join(' - ') || '-';
            const cepRaw = end?.cep ?? '';
            const onlyDigits = String(cepRaw).replace(/\D/g, '');
            const cepDigits = onlyDigits.length === 8 ? onlyDigits : '';
            const cepStr = cepDigits
                ? cepDigits.replace(/(\d{5})(\d{3})/, '$1-$2')
                : (cepRaw || '-');
            if (endLogradouro) endLogradouro.textContent = end?.logradouro || '-';
            if (endBairro) endBairro.textContent = end?.bairro || '-';
            if (endCidadeUf) endCidadeUf.textContent = cidadeUfStr;
            if (endCep) endCep.textContent = cepStr;
            if (endNumero) endNumero.textContent = (end?.numero ?? '-');
            if (endComplemento) endComplemento.textContent = end?.complemento || '-';
            if (endCoord) {
                const lat = typeof end?.lat === 'number' ? end.lat : (end?.lat ? Number(end.lat) : null);
                const lng = typeof end?.long === 'number' ? end.long : (end?.long ? Number(end.long) : null);
                if (lat != null && !isNaN(lat) && lng != null && !isNaN(lng)) {
                    const coordText = `${lat.toFixed(8)}, ${lng.toFixed(8)}`;
                    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                    endCoord.innerHTML = `<a href="${mapsUrl}" target="_blank" class="text-decoration-none">${coordText} <i class="fas fa-external-link-alt ms-1"></i></a>`;
                } else {
                    endCoord.textContent = '-';
                }
            }
            return { cep: cepDigits };
        };

    const initial = setEnderecoFields(endereco);

        const maybeFillFromViaCep = async (cepLike) => {
            let digits = String(cepLike ?? '').replace(/\D/g, '');
            if (digits.length !== 8 && endCep?.textContent) {
                const fromLabel = String(endCep.textContent).replace(/\D/g, '');
                if (fromLabel) digits = fromLabel;
            }
            const needsLogradouro = endLogradouro && (endLogradouro.textContent === '-' || endLogradouro.textContent.trim() === '');
            const needsBairro = endBairro && (endBairro.textContent === '-' || endBairro.textContent.trim() === '');
            const needsCidadeUf = endCidadeUf && (endCidadeUf.textContent === '-' || endCidadeUf.textContent.trim() === '');
            if (digits.length !== 8 || (!needsLogradouro && !needsBairro && !needsCidadeUf)) return;
            try {
                const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
                if (!res.ok) return;
                const data = await res.json();
                if (data?.erro) return;
                if (endLogradouro && needsLogradouro) endLogradouro.textContent = data.logradouro || endLogradouro.textContent || '-';
                if (endBairro && needsBairro) endBairro.textContent = data.bairro || endBairro.textContent || '-';
                if (endCidadeUf && needsCidadeUf) {
                    const loc = data.localidade || '';
                    const ufSigla = data.uf || '';
                    const cidadeUfStr = [loc, ufSigla].filter(Boolean).join(' - ') || '-';
                    endCidadeUf.textContent = cidadeUfStr;
                }
            } catch (e) {
            }
        };
        await maybeFillFromViaCep(initial.cep);

        const needsLB = (endLogradouro && (endLogradouro.textContent === '-' || endLogradouro.textContent.trim() === ''))
            || (endBairro && (endBairro.textContent === '-' || endBairro.textContent.trim() === ''));
        const hasCep = initial.cep && initial.cep.length === 8;
        if (needsLB && !hasCep) {
            try {
                if (cliente?.id && propriedade?.id) {
                    const cliRes = await authenticatedFetch(`/cliente?id=${cliente.id}`);
                    if (cliRes?.ok) {
                        const cliData = await cliRes.json();
                        const cli = Array.isArray(cliData) ? cliData[0] : cliData;
                        const prop = cli?.propriedades?.find(p => Number(p.id) === Number(propriedade.id));
                        if (prop?.endereco) {
                            const { cep } = setEnderecoFields(prop.endereco);
                            await maybeFillFromViaCep(cep);
                        }
                    }
                } else if (propriedade?.id || os?.propriedade_id) {
                    const allCliRes = await authenticatedFetch('/cliente');
                    if (allCliRes?.ok) {
                        const list = await allCliRes.json();
                        const pid = Number(propriedade?.id || os?.propriedade_id);
                        let found;
                        for (const c of (Array.isArray(list) ? list : [list])) {
                            found = c?.propriedades?.find(p => Number(p.id) === pid);
                            if (found) break;
                        }
                        if (found?.endereco) {
                            const { cep } = setEnderecoFields(found.endereco);
                            await maybeFillFromViaCep(cep);
                        }
                    }
                }
            } catch {}
        }

        if (!cidade?.descricao) {
            if (cliente?.id && propriedade?.id) {
                try {
                    const cliRes = await authenticatedFetch(`/cliente?id=${cliente.id}`);
                    if (cliRes?.ok) {
                        const cliData = await cliRes.json();
                        const cli = Array.isArray(cliData) ? cliData[0] : cliData;
                        const prop = cli?.propriedades?.find(p => Number(p.id) === Number(propriedade.id));
                        if (prop?.endereco) {
                            const { cep } = setEnderecoFields(prop.endereco);
                            await maybeFillFromViaCep(cep);
                        }
                    }
                } catch {}
            }
            if (endCidadeUf?.textContent === '-' && (propriedade?.id || os?.propriedade_id)) {
                try {
                    const allCliRes = await authenticatedFetch('/cliente');
                    if (allCliRes?.ok) {
                        const list = await allCliRes.json();
                        const pid = Number(propriedade?.id || os?.propriedade_id);
                        let found;
                        for (const c of (Array.isArray(list) ? list : [list])) {
                            found = c?.propriedades?.find(p => Number(p.id) === pid);
                            if (found) break;
                        }
                        if (found?.endereco) {
                            const { cep } = setEnderecoFields(found.endereco);
                            await maybeFillFromViaCep(cep);
                        }
                    }
                } catch {}
            }
        }
        
        const statusEl = document.getElementById('os-status');
    statusEl.textContent = os.status || 'Não informado';
    statusEl.classList.remove('bg-success','bg-warning','bg-secondary','bg-danger');
    statusEl.classList.add(
        os.status === 'Concluida' ? 'bg-success' : 
        os.status === 'Em andamento' ? 'bg-warning' : 
        os.status === 'Cancelada' ? 'bg-danger' : 
        'bg-secondary'
    );
    const responsaveis = (os.usuarios && os.usuarios.length) ? os.usuarios.map(u => u.nome).join(', ') : 'Não informado';
    document.getElementById('os-responsavel').textContent = responsaveis;
    document.getElementById('os-data').textContent = formatDate(os.created_at);

        const servicosList = document.getElementById('servicos-list');
        servicosList.innerHTML = '';
        if (os.servicos && os.servicos.length > 0) {
            os.servicos.forEach(servico => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = servico.nome;
                servicosList.appendChild(li);
            });
        } else {
            servicosList.innerHTML = '<li class="list-group-item text-muted">Nenhum serviço prestado.</li>';
        }

        const produtosList = document.getElementById('produtos-list');
        produtosList.innerHTML = '';
        let totalProdutos = 0;
        if (os.ordem_servico_produtos && os.ordem_servico_produtos.length > 0) {
            os.ordem_servico_produtos.forEach(item => {
                const subtotal = item.quantidade * item.valor;
                totalProdutos += subtotal;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.produto?.nome || '-'}</td>
                    <td class="text-center">${item.quantidade}</td>
                    <td class="text-end">${formatCurrency(item.valor)}</td>
                    <td class="text-end">${formatCurrency(subtotal)}</td>
                `;
                produtosList.appendChild(tr);
            });
        } else {
            produtosList.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum produto utilizado.</td></tr>';
        }

    // Financeiro
    const valorMO = Number(os.valor_mo) || 0;
    const valorDeslocamento = Number(os.valor_deslocamento) || 0;
    const valorTotalOS = Number(totalProdutos) + valorMO + valorDeslocamento;

        document.getElementById('valor-mo').textContent = formatCurrency(valorMO);
        document.getElementById('valor-deslocamento').textContent = formatCurrency(valorDeslocamento);
        document.getElementById('valor-produtos').textContent = formatCurrency(totalProdutos);
        document.getElementById('valor-total').textContent = formatCurrency(valorTotalOS);
        
        // Verifica se o botão de editar existe (não existe na página de funcionário)
        const editBtn = document.getElementById('edit-btn');
        if (editBtn) {
            editBtn.href = `ordem-servico-form.html?id=${os.id}`;
        }

        const descEl = document.getElementById('os-descricao');
        if (descEl) {
            descEl.textContent = (os.descricao && os.descricao.trim()) ? os.descricao : 'Nenhuma observação cadastrada.';
        }

    } catch (error) {
        detailsContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    } finally {
        loadingIndicator.classList.add('d-none');
        detailsContainer.classList.remove('d-none');
    }
});
