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

        // Calcula o custo do deslocamento (mais tarde adicionaremos à conta o valor unitário dos produtos)
        const custoDeslocamento = deslocamento * valorPorKm;

        // Calcula o total
        const total = maoDeObra + custoDeslocamento;

        // Formata o valor como moeda brasileira (BRL) e atualiza o campo
        $('#total_servico').val(total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }

    // listener para recalcular o total sempre que um dos campos for alterado
    $('#mao_obra, #deslocamento, #valor_km').on('input', calcularTotal);
});

document.addEventListener('DOMContentLoaded', function () {
            
            // Função para aplicar máscara de CPF/CNPJ
            const handleCpfCnpjInput = (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 14) {
                    value = value.substring(0, 14);
                }

                if (value.length > 11) {
                    // CNPJ
                    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
                } else {
                    // CPF
                    value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
                }
                e.target.value = value;
            };

            // Função para aplicar máscara de CEP
            const handleCepInput = (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 8) {
                    value = value.substring(0, 8);
                }
                value = value.replace(/^(\d{5})(\d{3}).*/, '$1-$2');
                e.target.value = value;
            };

            // Função para aplicar máscara de Telefone/Celular
            const handleTelefoneInput = (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }

                if (value.length > 10) {
                    // Celular (9 dígitos)
                    value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                } else if (value.length > 6) {
                    value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                } else if (value.length > 2) {
                    value = value.replace(/^(\d{2})(\d*)/, '($1) $2');
                } else {
                    value = value.replace(/^(\d*)/, '($1');
                }
                 e.target.value = value;
            };

            // Função para permitir apenas números
            const handleNumericInput = (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            };

            // Adiciona os event listeners nos campos
            document.getElementById('cpf_cnpj').addEventListener('input', handleCpfCnpjInput);
            document.getElementById('cep').addEventListener('input', handleCepInput);
            document.getElementById('telefone').addEventListener('input', handleTelefoneInput);
            
            // Campos que aceitam apenas números, sem formatação especial
            document.getElementById('numero').addEventListener('input', handleNumericInput);
            document.getElementById('cad_pro').addEventListener('input', handleNumericInput);

        });