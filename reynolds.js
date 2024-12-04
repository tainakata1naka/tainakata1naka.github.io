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

// 層流か乱流を判定する関数
function getFlowType(reynoldsNumber) {
  return reynoldsNumber <= 2300 ? '層流' : '乱流';
}

// 有効数字を計算する関数
function countSignificantFigures(value) {
  if (isNaN(value) || value === 0) return 0;
  const normalized = Number(value).toExponential();
  const significantPart = normalized.split('e')[0].replace('.', '').replace('-', '');
  return significantPart.length;
}

// 入力値から最大の有効数字を計算する関数
function getMaxSignificantFigures() {
  const velocityValue = parseFloat(document.getElementById('velocity').value);
  const dimensionValue = parseFloat(document.getElementById('dimension').value);
  const kinematicViscosityValue = parseFloat(document.getElementById('kinematicViscosity').value);
  const viscosityValue = parseFloat(document.getElementById('viscosity').value);
  const densityValue = parseFloat(document.getElementById('density').value);

  // 入力値の有効数字を計算
  const significantFigures = [
    countSignificantFigures(velocityValue),
    countSignificantFigures(dimensionValue),
  ];

  // 動粘度が選択されている場合
  if (document.getElementById('kinematicViscosityInput').style.display === 'block') {
    significantFigures.push(countSignificantFigures(kinematicViscosityValue));
  }
  // 粘度と密度が選択されている場合
  else if (document.getElementById('viscosityAndDensityInput').style.display === 'block') {
    significantFigures.push(countSignificantFigures(viscosityValue));
    significantFigures.push(countSignificantFigures(densityValue));
  }

  // 有効数字の最大値を返す
  return Math.max(...significantFigures);
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

  // 最大有効数字を取得
  const maxSigFigs = getMaxSignificantFigures();

  // 有効数字に基づいてレイノルズ数をフォーマット
  const formattedReynoldsNumber = reynoldsNumber.toPrecision(maxSigFigs);

  // メモの取得
  const memo = document.getElementById('memo').value;

  // 層流または乱流を判定
  const flowType = reynoldsNumber <= 2300 ? "層流" : "乱流";

  // 現在時刻の取得
  const timestamp = getFormattedTimestamp();

  // 履歴をローカルストレージに保存
  const history = JSON.parse(localStorage.getItem('reynoldsHistory')) || [];
  history.push({ reynolds: formattedReynoldsNumber, flowType, time: timestamp, memo });
  localStorage.setItem('reynoldsHistory', JSON.stringify(history));

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
const velocity = document.getElementById('velocity');
const dimension = document.getElementById('dimension');
const kinematicViscosity = document.getElementById('kinematicViscosity');
const viscosity = document.getElementById('viscosity');
const density = document.getElementById('density');
const calculateButton = document.getElementById('calculateButton');
const kinematicViscosityInput = document.getElementById('kinematicViscosityInput');
const viscosityAndDensityInput = document.getElementById('viscosityAndDensityInput');
const kinematicViscosityOption = document.getElementById('kinematicViscosityOption'); // 動粘度選択ラジオボタン
const viscosityAndDensityOption = document.getElementById('viscosityAndDensityOption'); // 粘度 & 密度選択ラジオボタン

// 入力フィールドの検証
function validateInputs() {
  let isValid = velocity.value > 0 && dimension.value > 0;

  // 動粘度が選択されている場合、動粘度の入力が有効かチェック
  if (kinematicViscosityInput.style.display === 'block') {
    isValid = isValid && kinematicViscosity.value > 0;
  } 
  // 粘度と密度が選択されている場合、粘度と密度の両方の入力が有効かチェック
  else if (viscosityAndDensityInput.style.display === 'block') {
    isValid = isValid && viscosity.value > 0 && density.value > 0;
  }

  // 計算ボタンの有効・無効を設定
  calculateButton.disabled = !isValid;
}

// 入力フィールドの変更を監視
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', validateInputs);
});

// 動粘度と粘度・密度の選択肢が変更された場合の処理
kinematicViscosityOption.addEventListener('change', () => {
  if (kinematicViscosityOption.checked) {
    // 動粘度が選択された場合
    kinematicViscosityInput.style.display = 'block';
    viscosityAndDensityInput.style.display = 'none';
  }
  // 入力を検証
  validateInputs();
});

viscosityAndDensityOption.addEventListener('change', () => {
  if (viscosityAndDensityOption.checked) {
    // 粘度と密度が選択された場合
    kinematicViscosityInput.style.display = 'none';
    viscosityAndDensityInput.style.display = 'block';
  }
  // 入力を検証
  validateInputs();
});

// 初期状態でボタンの状態をチェック
window.addEventListener('load', () => {
  if (kinematicViscosityOption.checked) {
    // 最初に動粘度が選択されている場合
    kinematicViscosityInput.style.display = 'block';
    viscosityAndDensityInput.style.display = 'none';
  } else if (viscosityAndDensityOption.checked) {
    // 最初に粘度と密度が選択されている場合
    kinematicViscosityInput.style.display = 'none';
    viscosityAndDensityInput.style.display = 'block';
  }
  // 初期状態での検証を実行
  validateInputs();
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
        <th scope="col">流体の状態</th>
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
        <td>${entry.reynolds}</td>
        <td>${entry.flowType}</td>
        <td>${entry.memo || ''}</td>`;

      // 行にクリックイベントを追加
      row.addEventListener('click', function (e) {
        if (!e.target.closest('input')) { // チェックボックス自体のクリックは除外
          const checkbox = this.querySelector('.select-row');
          checkbox.checked = !checkbox.checked;
          updateClearButtonState();
        }
      });

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

  // 新しい履歴を作成
  const updatedHistory = history.filter((_, index) => !selectedIndices.includes(index));
  localStorage.setItem('reynoldsHistory', JSON.stringify(updatedHistory));

  displayHistory(); // 履歴を再表示
});

// 履歴を表示
displayHistory();
