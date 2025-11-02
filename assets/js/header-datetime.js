// Atualiza data e hora no header
function updateDateTime() {
    const datetimeElement = document.getElementById('header-datetime');
    
    if (datetimeElement) {
        const now = new Date();
        
        // Formatar data
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateStr = now.toLocaleDateString('pt-BR', dateOptions);
        
        // Formatar hora
        const timeStr = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        datetimeElement.innerHTML = `
            <div class="date">${dateStr}</div>
            <div class="time">${timeStr}</div>
        `;
    }
}

// Atualizar a cada segundo
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
});
