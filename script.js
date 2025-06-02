document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const deleteToggleBtn = document.getElementById('deleteToggleBtn');
    const peopleCountInput = document.getElementById('peopleCount');
    const rowsInput = document.getElementById('rows');
    const columnsInput = document.getElementById('columns');
    const seatingChart = document.getElementById('seatingChart');
    const errorMessage = document.getElementById('errorMessage');
    const unassignedSection = document.getElementById('unassignedPeople');
    const unassignedList = document.getElementById('unassignedList');

    // State management
    let deleteMode = false;
    let deletedSeats = new Set();
    let currentRows = 0;
    let currentColumns = 0;
    let isInitialized = false;

    // Event listeners
    generateBtn.addEventListener('click', handleGenerateClick);
    deleteToggleBtn.addEventListener('click', toggleDeleteMode);

    function toggleDeleteMode() {
        deleteMode = !deleteMode;
        deleteToggleBtn.textContent = deleteMode ? '削除モード: ON' : '削除モード: OFF';
        deleteToggleBtn.classList.toggle('active', deleteMode);
        seatingChart.classList.toggle('delete-mode', deleteMode);
    }

    function handleGenerateClick() {
        const peopleCount = parseInt(peopleCountInput.value);
        const rows = parseInt(rowsInput.value);
        const columns = parseInt(columnsInput.value);

        // Validate inputs
        if (!validateInputs(peopleCount, rows, columns)) {
            return;
        }

        hideError();

        // Check if grid size changed
        const gridSizeChanged = rows !== currentRows || columns !== currentColumns;

        // Only clear deleted seats if grid size changed
        if (gridSizeChanged) {
            deletedSeats.clear();
            currentRows = rows;
            currentColumns = columns;
        }

        // Generate the seating chart
        generateSeatingChart(peopleCount, rows, columns);
    }

    function generateSeatingChart(peopleCount, rows, columns) {
        // Clear the seating chart
        seatingChart.innerHTML = '';
        seatingChart.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

        // Calculate available seats (total minus deleted)
        const totalSeats = rows * columns;
        const availableSeatsArray = [];

        // Create all seats and identify available ones
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const seatId = `${row}-${col}`;
                if (!deletedSeats.has(seatId)) {
                    availableSeatsArray.push(seatId);
                }
            }
        }

        // Create shuffled people array
        const people = Array.from({ length: peopleCount }, (_, i) => i + 1);
        shuffleArray(people);

        // Assign people to available seats
        const seatAssignments = new Map();
        const assignedCount = Math.min(people.length, availableSeatsArray.length);
        
        for (let i = 0; i < assignedCount; i++) {
            seatAssignments.set(availableSeatsArray[i], people[i]);
        }

        // Create the visual seats
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const seat = createSeat(row, col, seatAssignments);
                seatingChart.appendChild(seat);
            }
        }

        // Handle unassigned people
        if (people.length > availableSeatsArray.length) {
            showUnassignedPeople(people.slice(availableSeatsArray.length));
        } else {
            hideUnassignedPeople();
        }

        isInitialized = true;
    }

    function createSeat(row, col, seatAssignments) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        const seatId = `${row}-${col}`;
        seat.dataset.seatId = seatId;

        if (deletedSeats.has(seatId)) {
            // Deleted seat
            seat.classList.add('deleted');
            seat.textContent = '削除済';
        } else if (seatAssignments.has(seatId)) {
            // Occupied seat
            seat.classList.add('occupied');
            seat.textContent = `${seatAssignments.get(seatId)}番`;
        } else {
            // Empty seat
            seat.classList.add('empty');
            seat.textContent = '空席';
        }

        // Add click event listener
        seat.addEventListener('click', handleSeatClick);

        return seat;
    }

    function handleSeatClick(event) {
        if (!deleteMode || !isInitialized) return;

        const seat = event.target;
        const seatId = seat.dataset.seatId;

        if (seat.classList.contains('deleted')) {
            // Restore the seat
            deletedSeats.delete(seatId);
        } else {
            // Delete the seat
            deletedSeats.add(seatId);
        }

        // Regenerate with current people count
        const peopleCount = parseInt(peopleCountInput.value);
        const rows = parseInt(rowsInput.value);
        const columns = parseInt(columnsInput.value);
        generateSeatingChart(peopleCount, rows, columns);
    }

    function validateInputs(peopleCount, rows, columns) {
        if (isNaN(peopleCount) || peopleCount < 1 || peopleCount > 100) {
            showError('人数は1〜100の範囲で入力してください。');
            return false;
        }

        if (isNaN(rows) || rows < 1 || rows > 20) {
            showError('行数は1〜20の範囲で入力してください。');
            return false;
        }

        if (isNaN(columns) || columns < 1 || columns > 20) {
            showError('列数は1〜20の範囲で入力してください。');
            return false;
        }

        return true;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function showUnassignedPeople(unassignedPeople) {
        unassignedSection.style.display = 'block';
        unassignedList.innerHTML = '';

        unassignedPeople.forEach(person => {
            const personElement = document.createElement('div');
            personElement.className = 'unassigned-person';
            personElement.textContent = `${person}番`;
            unassignedList.appendChild(personElement);
        });
    }

    function hideUnassignedPeople() {
        unassignedSection.style.display = 'none';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
    }

    // Initialize with default values
    handleGenerateClick();
});