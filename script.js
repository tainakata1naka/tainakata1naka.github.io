// フォーム送信時のイベントリスナー
document.getElementById('reynoldsForm').addEventListener('submit', function(e) {
    e.preventDefault(); // フォームのデフォルト送信を防ぐ
  
    // 入力値の取得
    const velocity = parseFloat(document.getElementById('velocity').value);
    const dimension = parseFloat(document.getElementById('dimension').value);
    const kinematicViscosity = parseFloat(document.getElementById('kinematicViscosity').value);
  
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
  document.getElementById('clearHistory').addEventListener('click', function() {
    localStorage.removeItem('reynoldsHistory');
    displayHistory();
  });
  
  // ページ読み込み時に履歴を表示
  window.onload = displayHistory;
  