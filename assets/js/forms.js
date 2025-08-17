$(document).ready(function() {
    // INICIALIZAÇÃO DO SELECT2 (lib) PARA PRODUTOS
    $('#produtos').select2({
        placeholder: 'Selecione um ou mais produtos',
        theme: 'bootstrap-5'
    });

    // FUNÇÃO PARA CALCULAR O TOTAL DO SERVIÇO
    function calcularTotal() {
        // Pega os valores dos campos, tratando campos vazios como 0
        const maoDeObra = parseFloat($('#mao_obra').val()) || 0;
        const deslocamento = parseFloat($('#deslocamento').val()) || 0;
        const valorPorKm = parseFloat($('#valor_km').val()) || 0;

        // Calcula o custo do deslocamento
        const custoDeslocamento = deslocamento * valorPorKm;

        // Calcula o total
        const total = maoDeObra + custoDeslocamento;

        // Formata o valor como moeda brasileira (BRL) e atualiza o campo
        $('#total_servico').val(total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }

    // listener para recalcular o total sempre que um dos campos for alterado
    $('#mao_obra, #deslocamento, #valor_km').on('input', calcularTotal);
});