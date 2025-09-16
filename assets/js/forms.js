$(document).ready(function() {
    if ($('#produtos').length) {
        $('#produtos').select2({
            placeholder: 'Selecione um ou mais produtos',
            theme: 'bootstrap-5'
        });
    }

    if ($('#metodo_pagamento').length) {
        $('#metodo_pagamento').select2({
            placeholder: 'Selecione um método de pagamento',
            theme: 'bootstrap-5',
            minimumResultsForSearch: Infinity 
        });
    }

    // máscara de CPF/CNPJ
    const handleCpfCnpjInput = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 14) value = value.substring(0, 14);
        if (value.length > 11) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
        } else {
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
        }
        e.target.value = value;
    };

    // máscara de Telefone
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

    // máscara de CEP
    const handleCepInput = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.substring(0, 8);
        value = value.replace(/^(\d{5})(\d{3}).*/, '$1-$2');
        e.target.value = value;
    };

    $(document.body).on('input', '#cpf_cnpj', handleCpfCnpjInput);
    $(document.body).on('input', '.telefone-input', handleTelefoneInput);
    $(document.body).on('input', '.cep-input', handleCepInput);

    // máscara de Latitude/Longitude (DD): aceita -, . e até 12 casas decimais
    const MAX_DECIMALS = 12;
    const sanitizeDecimalInput = (raw) => {
        if (raw == null) return '';
        let v = String(raw).replace(/,/g, '.');
        v = v.replace(/[^0-9.\-]/g, '');
        if (v.indexOf('-') > 0) v = v.replace(/-/g, '');
        if (v.lastIndexOf('-') > 0) v = v.replace(/-/g, '');
        if (v.indexOf('.') !== -1) {
            const parts = v.split('.');
            v = parts.shift() + '.' + parts.join('');
        }
        if (v.includes('.')) {
            const [i, d] = v.split('.');
            v = i + '.' + d.slice(0, MAX_DECIMALS);
        }
        if (v === '.' || v === '-.') v = v.replace('.', '0.');
        return v;
    };

    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    const formatUpToN = (num, n = MAX_DECIMALS) => {
        const s = Number(num).toFixed(n);
        return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
    };

    const ddPairRegex = /(-?\d+(?:[\.,]\d+)?)[\s,;]+(-?\d+(?:[\.,]\d+)?)/;
    const trySplitPairToFields = (el, value) => {
        const m = String(value || '').trim().match(ddPairRegex);
        if (!m) return false;
        const item = el.closest('.property-item');
        if (!item) return false;
        const latEl = item.querySelector('[data-field="lat"]');
        const longEl = item.querySelector('[data-field="long"]');
        if (!latEl || !longEl) return false;
        const latVal = sanitizeDecimalInput(m[1].replace(',', '.'));
        const longVal = sanitizeDecimalInput(m[2].replace(',', '.'));
        latEl.value = latVal;
        longEl.value = longVal;
        const latNum = parseFloat(latVal);
        const longNum = parseFloat(longVal);
        if (!isNaN(latNum)) latEl.value = formatUpToN(clamp(latNum, -90, 90));
        if (!isNaN(longNum)) longEl.value = formatUpToN(clamp(longNum, -180, 180));
        return true;
    };

    const handleLatInput = (e) => {
        if (trySplitPairToFields(e.target, e.target.value)) return;
        e.target.value = sanitizeDecimalInput(e.target.value);
    };
    const handleLongInput = (e) => {
        if (trySplitPairToFields(e.target, e.target.value)) return;
        e.target.value = sanitizeDecimalInput(e.target.value);
    };
    const finalizeLat = (e) => {
        const v = e.target.value.replace(',', '.');
        if (v === '' || v === '-' ) return;
        const n = parseFloat(v);
        if (!isNaN(n)) {
            e.target.value = formatUpToN(clamp(n, -90, 90));
        } else {
            e.target.value = '';
        }
    };
    const finalizeLong = (e) => {
        const v = e.target.value.replace(',', '.');
        if (v === '' || v === '-' ) return;
        const n = parseFloat(v);
        if (!isNaN(n)) {
            e.target.value = formatUpToN(clamp(n, -180, 180));
        } else {
            e.target.value = '';
        }
    };

    $(document.body).on('input', '[data-field="lat"]', handleLatInput);
    $(document.body).on('input', '[data-field="long"]', handleLongInput);
    $(document.body).on('blur', '[data-field="lat"]', finalizeLat);
    $(document.body).on('blur', '[data-field="long"]', finalizeLong);
    
    // botao canelar
    if ($('#btn-cancelar').length) {
        $('#btn-cancelar').on('click', function() {
            if (confirm('Ao cancelar, você perderá todo o progresso do formulário. Deseja realmente sair?')) {
                if (window.location.href.includes('ordem-servico-form.html')) {
                    window.location.href = 'tabela-os.html';
                } else if (window.location.href.includes('cliente-form.html')) {
                    window.location.href = 'tabela-cliente.html';
                } else if (window.location.href.includes('user-form.html')) {
                    window.location.href = 'tabela-user.html';
                } else if (window.location.href.includes('produto-form.html')) {
                    window.location.href = 'tabela-produto.html';
                } else if (window.location.href.includes('servico-form.html')) {
                    window.location.href = 'tabela-servico.html';
                } else {
                    window.location.href = 'index.html';
                }
            }
        });
    }
});

