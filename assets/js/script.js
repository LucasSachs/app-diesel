$(document).ready(function() {
    const btnRelatorioFinanceiro7Dias = document.getElementById('btnRelatorioFinanceiro7Dias')
    const btnRelatorioFinanceiro15Dias = document.getElementById('btnRelatorioFinanceiro15Dias')
    const btnRelatorioFinanceiro30Dias = document.getElementById('btnRelatorioFinanceiro30Dias')

    const btnRelatorioProdutos7Dias = document.getElementById('btnRelatorioProdutos7Dias')
    const btnRelatorioProdutos15Dias = document.getElementById('btnRelatorioProdutos15Dias')
    const btnRelatorioProdutos30Dias = document.getElementById('btnRelatorioProdutos30Dias')

    function formatCSVFinanceiro(payload) {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone  
  
        const formatBRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0))  
        const formatDate = iso => new Date(iso).toLocaleString('pt-BR', { timeZone: tz })  
  
        const rows = [['Data Inicial', 'Data Final', 'Valor Total', 'Valor Descolamento', 'Valor Deslocamento', 'Valor Produtos'], [  
            formatDate(payload.from),  
            formatDate(payload.to),  
            formatBRL(payload.total),  
            formatBRL(payload.totalDeslocamento),  
            formatBRL(payload.totalMo),  
            formatBRL(payload.totalProdutos),  
        ]]  
  
        const csv = rows.map(row => row.map(cell => {  
                const s = String(cell ?? '')  
                const needsQuotes = /[",;\n]/.test(s)  
                const escaped = s.replace(/"/g, '""')  
                
                return needsQuotes ? `"${escaped}"` : escaped  
            }).join(';')  
        ).join('\n')

        return csv
    }

    function formatCSVProdutos(payload) {
        console.log(payload)
    const formatBRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

    const headers = ['Nome', 'Quantidade', 'Total', 'Mínimo', 'Médio'];
    const rows = [headers];

    for (const produto of payload.produtos) {
        const linha = [
            produto.nome || '',
            produto.quantidade ?? '',
            formatBRL(produto.total),
            formatBRL(produto.minimo),
            formatBRL(produto.medio)
        ];
        rows.push(linha);
    }

    const csv = rows.map(row => Array.isArray(row) ? row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(';') : '' ).join('\n');

    return csv;
}


    function downloadRelatorio(csv) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })  
        const url = URL.createObjectURL(blob)  
        const a = document.createElement('a')  
        const nowLocal = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')  
        a.href = url  
        a.download = `relatorio-financeiro-${nowLocal}.csv`  
        document.body.appendChild(a)  
        a.click()  
        document.body.removeChild(a)  
        URL.revokeObjectURL(url)
    }
    
    btnRelatorioFinanceiro7Dias.addEventListener('click', async e => {  
        const response = await authenticatedFetch(`/relatorio/financeiro?days=7`);
        const payload = await response.json();

        const csv = formatCSVFinanceiro(payload)
        downloadRelatorio(csv)
    }) 
    
    btnRelatorioFinanceiro15Dias.addEventListener('click', async e => {  
        const response = await authenticatedFetch(`/relatorio/financeiro?days=15`);
        const payload = await response.json();

        const csv = formatCSVFinanceiro(payload)
        downloadRelatorio(csv)
    })  
    
    btnRelatorioFinanceiro30Dias.addEventListener('click', async e => {  
        const response = await authenticatedFetch(`/relatorio/financeiro?days=30`);
        const payload = await response.json();

        const csv = formatCSVFinanceiro(payload)
        downloadRelatorio(csv)
    })  
    
    btnRelatorioProdutos7Dias.addEventListener('click', async e => {  
        const response = await authenticatedFetch(`/relatorio/produtos?days=7`);
        const payload = await response.json();

        const csv = formatCSVProdutos(payload)
        downloadRelatorio(csv)
    })

    btnRelatorioProdutos15Dias.addEventListener('click', async e => {  
        const response = await authenticatedFetch(`/relatorio/produtos?days=15`);
        const payload = await response.json();

        const csv = formatCSVProdutos(payload)
        downloadRelatorio(csv)
    })

    btnRelatorioProdutos30Dias.addEventListener('click', async e => {  
        const response = await authenticatedFetch(`/relatorio/produtos?days=30`);
        const payload = await response.json();

        const csv = formatCSVProdutos(payload)
        downloadRelatorio(csv)
    })
});
