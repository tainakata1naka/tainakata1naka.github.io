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
    const timestamp = new Date().toLocaleString();
  
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
  
    // 履歴リストのクリア
    historyElement.innerHTML = '';
    if (history.length > 0) {
      const list = document.createElement('ul');
      history.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.time}: レイノルズ数 ${entry.reynolds}`;
        list.appendChild(listItem);
      });
      historyElement.appendChild(list);
    } else {
      historyElement.textContent = '履歴はありません。';
    }
  }
  
  // 履歴削除ボタンのイベントリスナー
  document.getElementById('clearHistory').addEventListener('click', function () {
    localStorage.removeItem('reynoldsHistory');
    displayHistory();
  });
  
  // ページ読み込み時に履歴を表示
  window.onload = displayHistory;
  