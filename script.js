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

    let deleteMode = false;
    let deletedSeats = new Set();
    let previousRows = null;
    let previousColumns = null;

    generateBtn.addEventListener('click', generateSeatingChart);
    deleteToggleBtn.addEventListener('click', toggleDeleteMode);

    function toggleDeleteMode() {
        deleteMode = !deleteMode;
        deleteToggleBtn.textContent = deleteMode ? '削除モード: ON' : '削除モード: OFF';
        deleteToggleBtn.classList.toggle('active', deleteMode);
        seatingChart.classList.toggle('delete-mode', deleteMode);
    }

    function generateSeatingChart() {
        // 入力値を取得
        const peopleCount = parseInt(peopleCountInput.value);
        const rows = parseInt(rowsInput.value);
        const columns = parseInt(columnsInput.value);

        // 入力値の検証
        if (!validateInputs(peopleCount, rows, columns)) {
            return;
        }

        // エラーメッセージをクリア
        hideError();

        // 削除された座席の行列が変更された場合のみクリア
        if (previousRows !== null && previousColumns !== null) {
            if (previousRows !== rows || previousColumns !== columns) {
                deletedSeats.clear();
            }
        }
        
        // 現在の行列サイズを保存
        previousRows = rows;
        previousColumns = columns;

        // 座席の総数を計算
        const totalSeats = rows * columns;

        // 人のリストを作成（1から人数まで）
        const people = Array.from({ length: peopleCount }, (_, i) => i + 1);

        // 人をシャッフル
        shuffleArray(people);

        // 座席表を作成
        createSeatingChart(rows, columns, people, totalSeats);
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

    function createSeatingChart(rows, columns, people, totalSeats) {
        // 座席表をクリア
        seatingChart.innerHTML = '';

        // グリッドのスタイルを設定
        seatingChart.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

        // 座席を作成
        let seatIndex = 0;
        let assignedPeopleIndex = 0;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const seat = document.createElement('div');
                seat.className = 'seat';
                const seatId = `${row}-${col}`;
                seat.dataset.seatId = seatId;

                if (deletedSeats.has(seatId)) {
                    // 削除された座席
                    seat.classList.add('deleted');
                    seat.textContent = '削除済';
                } else if (assignedPeopleIndex < people.length) {
                    // 人を座席に割り当て
                    seat.classList.add('occupied');
                    seat.textContent = `${people[assignedPeopleIndex]}番`;
                    assignedPeopleIndex++;
                } else {
                    // 空席
                    seat.classList.add('empty');
                    seat.textContent = '空席';
                }

                // クリックイベントを追加
                seat.addEventListener('click', handleSeatClick);

                seatingChart.appendChild(seat);
                seatIndex++;
            }
        }

        // 座席に収まらなかった人を表示
        const availableSeats = totalSeats - deletedSeats.size;
        if (people.length > availableSeats) {
            showUnassignedPeople(people.slice(availableSeats));
        } else {
            hideUnassignedPeople();
        }
    }

    function handleSeatClick(event) {
        if (!deleteMode) return;

        const seat = event.target;
        const seatId = seat.dataset.seatId;

        if (seat.classList.contains('deleted')) {
            // 削除を取り消す
            deletedSeats.delete(seatId);
            reassignSeats();
        } else {
            // 座席を削除
            deletedSeats.add(seatId);
            seat.classList.add('deleted');
            seat.classList.remove('occupied', 'empty');
            seat.textContent = '削除済';
            reassignSeats();
        }
    }

    function reassignSeats() {
        const peopleCount = parseInt(peopleCountInput.value);
        const rows = parseInt(rowsInput.value);
        const columns = parseInt(columnsInput.value);
        const totalSeats = rows * columns;

        // 人のリストを作成（1から人数まで）
        const people = Array.from({ length: peopleCount }, (_, i) => i + 1);

        // 人をシャッフル（ランダムに配置）
        shuffleArray(people);

        // 座席表を再作成
        createSeatingChart(rows, columns, people, totalSeats);
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

    // 初期状態で座席表を生成
    generateSeatingChart();
});