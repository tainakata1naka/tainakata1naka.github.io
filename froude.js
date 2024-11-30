// 日時をYYYY/MM/DD hh:mm:ss形式にフォーマットする関数
function getFormattedTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

// フォーム送信時のイベントリスナー
document.getElementById('froudeForm').addEventListener('submit', function (e) {
    e.preventDefault(); // デフォルトのフォーム送信を防ぐ

    // 入力値の取得
    const velocity = parseFloat(document.getElementById('velocity').value);
    const dimension = parseFloat(document.getElementById('dimension').value);
    const memo = document.getElementById('memo').value; // メモの取得
    const gravitationalAcceleration = 9.80665;

    // フルード数の計算
    const froudeNumber = velocity / Math.sqrt(dimension * gravitationalAcceleration);

    // 結果の表示
    const resultElement = document.getElementById('result');
    resultElement.textContent = `フルード数: ${froudeNumber.toFixed(2)}`;

    // 現在時刻の取得
    const timestamp = getFormattedTimestamp();

    // 履歴をローカルストレージに保存
    const history = JSON.parse(localStorage.getItem('froudeHistory')) || [];
    history.push({ froude: froudeNumber.toFixed(2), time: timestamp, memo: memo });
    localStorage.setItem('froudeHistory', JSON.stringify(history));

    // 履歴を更新表示
    displayHistory();
});


// 入力フィールドの正の実数チェックを追加
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.setAttribute('min', '0.0000000001'); // 正の実数を指定（0を除外）
    input.setAttribute('step', 'any'); // 任意の小数を許可
    input.addEventListener('input', function () {
        const value = parseFloat(this.value);
        if (isNaN(value) || value <= 0) {
            this.setCustomValidity('正の実数を入力してください。');
        } else {
            this.setCustomValidity('');
        }
    });
});

// 必須入力フィールドのチェック
function validateInputs() {
    const velocity = document.getElementById('velocity').value;
    const dimension = document.getElementById('dimension').value;
    const calculateButton = document.getElementById('calculateButton');
    const isValid = velocity > 0 && dimension > 0;

    calculateButton.disabled = !isValid;
}

// 入力フィールドの変更を監視
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', validateInputs);
});

// 履歴を表示する関数
function displayHistory() {
    const history = JSON.parse(localStorage.getItem('froudeHistory')) || [];
    const historyElement = document.getElementById('history');

    // 履歴テーブルのクリア
    historyElement.innerHTML = '';

    if (history.length > 0) {
        const table = document.createElement('table');
        table.classList.add('table', 'table-striped', 'table-hover', 'mb-3');

        // テーブルヘッダー
        const thead = document.createElement('thead');
        thead.innerHTML = `
        <tr>
            <th scope="col"><input type="checkbox" id="selectAll"></th>
            <th scope="col">計算時刻</th>
            <th scope="col">フルード数</th>
            <th scope="col">メモ</th>
        </tr>`;
        table.appendChild(thead);

        // テーブルボディ
        const tbody = document.createElement('tbody');
        history.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td><input type="checkbox" class="select-row" data-index="${index}"></td>
            <td>${entry.time}</td>
            <td>${entry.froude}</td>
            <td>${entry.memo || 'なし'}</td>`;
            tbody.appendChild(row);

            // 行クリック時のチェックボックス選択/解除イベント
            row.addEventListener('click', function (event) {
                if (event.target.tagName !== 'INPUT') {
                    const checkbox = row.querySelector('.select-row');
                    checkbox.checked = !checkbox.checked;
                    updateClearButtonState();
                }
            });
        });

        table.appendChild(tbody);
        historyElement.appendChild(table);

        // 全選択チェックボックスのイベントリスナー
        document.getElementById('selectAll').addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('.select-row');
            checkboxes.forEach(checkbox => (checkbox.checked = this.checked));
            updateClearButtonState();
        });

        // 個別チェックボックスの状態が変更されたときのイベントリスナー
        document.querySelectorAll('.select-row').forEach(checkbox =>
            checkbox.addEventListener('change', updateClearButtonState)
        );
    } else {
        historyElement.innerHTML = '<p class="text-muted">履歴はありません。</p>';
    }

    // 削除ボタンの状態を更新
    updateClearButtonState();
}

// 削除ボタンの状態を更新する関数
function updateClearButtonState() {
    const selectedItems = document.querySelectorAll('.select-row:checked');
    const clearButton = document.getElementById('clearSelected');
    clearButton.disabled = selectedItems.length === 0;
}


// 削除ボタンの状態を更新する関数
function updateClearButtonState() {
    const selectedItems = document.querySelectorAll('.select-row:checked');
    const clearButton = document.getElementById('clearSelected');
    clearButton.disabled = selectedItems.length === 0;
}

// 選択された履歴を削除する関数
document.getElementById('clearSelected').addEventListener('click', function () {
    const history = JSON.parse(localStorage.getItem('froudeHistory')) || [];
    const selectedItems = Array.from(document.querySelectorAll('.select-row:checked'));
    const selectedIndices = selectedItems.map(item => parseInt(item.dataset.index, 10));

    // 新しい履歴を保存
    const updatedHistory = history.filter((_, index) => !selectedIndices.includes(index));
    localStorage.setItem('froudeHistory', JSON.stringify(updatedHistory));

    // 履歴を更新表示
    displayHistory();
});

// ページ読み込み時に履歴を表示
window.onload = displayHistory;
