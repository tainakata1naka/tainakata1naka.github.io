// ラジオボタンの選択肢に応じて入力フォームを切り替える
document.querySelectorAll('input[name="parameterType"]').forEach(radio => {
    radio.addEventListener('change', function () {
      const kinematicViscosityInput = document.getElementById('kinematicViscosityInput');
      const viscosityAndDensityInput = document.getElementById('viscosityAndDensityInput');
  
      if (this.value === 'kinematicViscosity') {
        kinematicViscosityInput.style.display = 'block';
        viscosityAndDensityInput.style.display = 'none';
      } else {
        kinematicViscosityInput.style.display = 'none';
        viscosityAndDensityInput.style.display = 'block';
      }
    });
  });
  
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
  document.getElementById('reynoldsForm').addEventListener('submit', function (e) {
    e.preventDefault(); // デフォルトのフォーム送信を防ぐ
  
    // 入力値の取得
    const velocity = parseFloat(document.getElementById('velocity').value);
    const dimension = parseFloat(document.getElementById('dimension').value);
    let kinematicViscosity;
  
    // 動粘度か粘度と密度から計算
    const selectedParameter = document.querySelector('input[name="parameterType"]:checked').value;
    if (selectedParameter === 'kinematicViscosity') {
      kinematicViscosity = parseFloat(document.getElementById('kinematicViscosity').value);
    } else {
      const viscosity = parseFloat(document.getElementById('viscosity').value);
      const density = parseFloat(document.getElementById('density').value);
      if (viscosity && density) {
        kinematicViscosity = viscosity / density;
      } else {
        alert('粘度と密度を入力してください。');
        return;
      }
    }
  
    // レイノルズ数の計算
    const reynoldsNumber = (velocity * dimension) / kinematicViscosity;
  
    // 結果の表示
    const resultElement = document.getElementById('result');
    resultElement.textContent = `レイノルズ数: ${reynoldsNumber.toFixed(2)}`;
  
    // 現在時刻の取得
    const timestamp = getFormattedTimestamp();
  
    // 履歴をローカルストレージに保存
    const history = JSON.parse(localStorage.getItem('reynoldsHistory')) || [];
    history.push({ reynolds: reynoldsNumber.toFixed(2), time: timestamp });
    localStorage.setItem('reynoldsHistory', JSON.stringify(history));
  
    // 履歴を更新表示
    displayHistory();
  });
  
  // 必須入力フィールドのチェック
  const velocity = document.getElementById('velocity');
  const dimension = document.getElementById('dimension');
  const kinematicViscosity = document.getElementById('kinematicViscosity');
  const viscosity = document.getElementById('viscosity');
  const density = document.getElementById('density');
  const calculateButton = document.getElementById('calculateButton');
  const kinematicViscosityInput = document.getElementById('kinematicViscosityInput');
  const viscosityAndDensityInput = document.getElementById('viscosityAndDensityInput');
  
  document.querySelectorAll('input[name="parameterType"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'kinematicViscosity') {
        kinematicViscosityInput.style.display = 'block';
        viscosityAndDensityInput.style.display = 'none';
      } else {
        kinematicViscosityInput.style.display = 'none';
        viscosityAndDensityInput.style.display = 'block';
      }
      validateInputs();
    });
  });
  
  // 入力内容の検証
  function validateInputs() {
    let isValid = velocity.value && dimension.value;
  
    if (kinematicViscosityInput.style.display === 'block') {
      isValid = isValid && kinematicViscosity.value;
    } else if (viscosityAndDensityInput.style.display === 'block') {
      isValid = isValid && viscosity.value && density.value;
    }
  
    calculateButton.disabled = !isValid;
  }
  
  // 入力フィールドの変更を監視
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', validateInputs);
  });
  
  // 履歴を表示する関数
  function displayHistory() {
    const history = JSON.parse(localStorage.getItem('reynoldsHistory')) || [];
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
          <th scope="col">レイノルズ数</th>
        </tr>`;
      table.appendChild(thead);
  
      // テーブルボディ
      const tbody = document.createElement('tbody');
      history.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><input type="checkbox" class="select-row" data-index="${index}"></td>
          <td>${entry.time}</td>
          <td>${entry.reynolds}</td>`;
        tbody.appendChild(row);
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
  
  // 選択された履歴を削除する関数
  document.getElementById('clearSelected').addEventListener('click', function () {
    const history = JSON.parse(localStorage.getItem('reynoldsHistory')) || [];
    const selectedItems = Array.from(document.querySelectorAll('.select-row:checked'));
    const selectedIndices = selectedItems.map(item => parseInt(item.dataset.index, 10));
  
    // 新しい履歴を保存
    const updatedHistory = history.filter((_, index) => !selectedIndices.includes(index));
    localStorage.setItem('reynoldsHistory', JSON.stringify(updatedHistory));
  
    // 履歴を更新表示
    displayHistory();
  });
  
  // ページ読み込み時に履歴を表示
  window.onload = displayHistory;
  