document.addEventListener('DOMContentLoaded', () => {
    const userNameDisplay = document.getElementById('user-name-display');

    if (userNameDisplay) {
        const userData = getUserData();

        if (userData && userData.name) {
            const fullName = userData.name;
            const firstName = fullName.split(' ')[0];

            userNameDisplay.textContent = firstName;
        }
    }
});