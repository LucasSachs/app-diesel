$(document).ready(function() {
    const btnDownloadFinanceiro = document.getElementById('btnDownloadFinanceiro')  
    const btnDownloadProdutos = document.getElementById('btnDownloadProdutos')  
    
    btnDownloadFinanceiro.addEventListener('click', async e => {  
        const response = await authenticatedFetch(`/relatorio/financeiro?months=1`);
        const payload = await response.json();

        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone  
  
        const formatBRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0))  
        const formatDate = iso => new Date(iso).toLocaleString('pt-BR', { timeZone: tz })  
  
        const rows = [  
            ['Data Inicial', 'Data Final', 'Valor Total', 'Valor Descolamento', 'Valor Deslocamento', 'Valor Produtos'],  
            [  
            formatDate(payload.from),  
            formatDate(payload.to),  
            formatBRL(payload.total),  
            formatBRL(payload.totalDeslocamento),  
            formatBRL(payload.totalMo),  
            formatBRL(payload.totalProdutos),  
            ],  
        ]  
  
        const csv = rows.map(row => row  
            .map(cell => {  
                const s = String(cell ?? '')  
                const needsQuotes = /[",;\n]/.test(s)  
                const escaped = s.replace(/"/g, '""')  
                
                return needsQuotes ? `"${escaped}"` : escaped  
            }).join(';')  
        ).join('\n')  
  
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
    })  
    
    btnDownloadProdutos.addEventListener('click', e => {  
        // handle produtos download  
    })
});
