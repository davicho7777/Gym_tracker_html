document.addEventListener('DOMContentLoaded', function() {
    const exerciseTable = document.getElementById('exercise-table');
    const saveButton = document.getElementById('save-button');
    const prevWeekButton = document.getElementById('prev-week');
    const nextWeekButton = document.getElementById('next-week');
    const currentWeekSpan = document.getElementById('current-week');
    const weekDates = document.getElementById('week-dates');
    const printButton = document.getElementById('print-button');
    const editModal = document.getElementById('edit-modal');
    const closeModal = document.querySelector('#edit-modal .close');
    const newExerciseNameInput = document.getElementById('new-exercise-name');
    const saveExerciseNameButton = document.getElementById('save-exercise-name');

    let currentWeek = getCurrentWeek();
    let currentExercise = { day: '', index: 0 };

    const exercises = {
        day1: ["Press de Banca", "Fondos en Paralelas", "Elevaciones Laterales", "Extensiones de Tríceps"],
        day2: ["Sentadilla", "Prensa", "Curl de Piernas / Extensión de Piernas", "Elevación de Talones"],
        day3: ["Dominadas", "Remo con Barra", "Pull-over", "Curl con Barra"]
    };

    function getCurrentWeek() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
    }

    function updateWeekDates(week) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (startDate.getDay() + 1) + (week - 1) * 7);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        weekDates.textContent = `Del ${startDate.toLocaleDateString('es-ES', options)} al ${endDate.toLocaleDateString('es-ES', options)}`;
    }

    function generateExerciseRows(day, week) {
        return exercises[day].map((exercise, index) => `
        <tr>
            <td>
                <span class="edit-name" data-day="${day}" data-index="${index}">${getExerciseName(day, index)}</span>
                <br>
                ${[1, 2, 3].map(set => `
                    <label>Set ${set} <input type="checkbox" class="checkbox-${week}-${day}-${index}-set${set}"></label>
                `).join('')}
                <br>
                <label>Kilos <input type="number" class="number-${week}-${day}-${index}"></label>
            </td>
        </tr>
        `).join('');
    }

    function generateWeekTable(week) {
        return `
        <tr>
            ${['day1', 'day2', 'day3'].map(day => `
                <td><table>${generateExerciseRows(day, week)}</table></td>
            `).join('')}
        </tr>
        `;
    }

    function updateTable() {
        exerciseTable.innerHTML = generateWeekTable(currentWeek);
        currentWeekSpan.textContent = `Semana ${currentWeek}`;
        updateWeekDates(currentWeek);
        restoreInputs();
    }

    function saveTable() {
        saveInputs();
        alert('Progreso guardado con éxito!');
    }

    function saveInputs() {
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            localStorage.setItem(checkbox.className, checkbox.checked);
        });
        document.querySelectorAll('input[type="number"]').forEach(numberInput => {
            localStorage.setItem(numberInput.className, numberInput.value);
        });
    }

    function restoreInputs() {
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = localStorage.getItem(checkbox.className) === 'true';
        });
        document.querySelectorAll('input[type="number"]').forEach(numberInput => {
            numberInput.value = localStorage.getItem(numberInput.className) || '';
        });
    }

    function showEditModal(day, index) {
        currentExercise = { day, index };
        newExerciseNameInput.value = getExerciseName(day, index);
        editModal.style.display = 'block';
    }

    function getExerciseName(day, index) {
        return localStorage.getItem(`exercise-${currentWeek}-${day}-${index}`) || exercises[day][index];
    }

    function setExerciseName(day, index, name) {
        localStorage.setItem(`exercise-${currentWeek}-${day}-${index}`, name);
    }

    saveExerciseNameButton.addEventListener('click', () => {
        setExerciseName(currentExercise.day, currentExercise.index, newExerciseNameInput.value);
        updateTable();
        closeModal.click();
    });

    closeModal.addEventListener('click', () => editModal.style.display = 'none');
    saveButton.addEventListener('click', saveTable);
    prevWeekButton.addEventListener('click', () => currentWeek > 1 && updateTable(--currentWeek));
    nextWeekButton.addEventListener('click', () => updateTable(++currentWeek));

    printButton.addEventListener('click', printData);

    function printData() {
        let printContent = '<html><head><title>Datos Guardados</title></head><body>';
        printContent += `<h1>Datos Guardados</h1>`;

        for (let week = 1; week <= getCurrentWeek(); week++) {
            let weekHasData = false;
            let weekContent = `<h2>Semana ${week}</h2>`;

            ['day1', 'day2', 'day3'].forEach(day => {
                let dayHasData = false;
                let dayContent = `<h3>${day}</h3>`;

                exercises[day].forEach((exercise, index) => {
                    const sets = [1, 2, 3];
                    const setsValues = sets.map(set => 
                        localStorage.getItem(`checkbox-${week}-${day}-${index}-set${set}`) === 'true'
                    );
                    const kilos = localStorage.getItem(`number-${week}-${day}-${index}`) || '';

                    // Si algún set está marcado o se ha ingresado peso, cuenta como dato existente
                    if (setsValues.includes(true) || kilos) {
                        dayHasData = true;
                        dayContent += `<p>${getExerciseName(day, index)}:<br> Sets: ${setsValues.map((checked, i) => `Set ${i + 1}: ${checked ? 'Hecho' : 'No hecho'}`).join(', ')} <br> Kilos: ${kilos}</p>`;
                    }
                });

                // Agrega el contenido del día solo si tiene datos
                if (dayHasData) {
                    weekHasData = true;
                    weekContent += dayContent;
                }
            });

            // Agrega el contenido de la semana solo si tiene datos
            if (weekHasData) {
                printContent += weekContent;
            }
        }

        printContent += '</body></html>';

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }

    updateTable();
});
