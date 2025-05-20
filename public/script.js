document.getElementById('walletForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const walletList = document.getElementById('wallets').value.trim().split('\n').map(w => w.trim());
  await fetch('/api/wallets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallets: walletList })
  });
  loadData();
});

async function loadData() {
  const res = await fetch('/api/data');
  const data = await res.json();

  const thead = document.querySelector('#resultTable thead');
  const tbody = document.querySelector('#resultTable tbody');

  thead.innerHTML = '';
  tbody.innerHTML = '';

  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th>#</th><th>Address</th>' + data.history.map(h => \`<th>\${h.date}</th>\`).join('');
  thead.appendChild(headerRow);

  data.wallets.forEach((wallet, idx) => {
    const row = document.createElement('tr');
    let cells = \`<td>\${idx + 1}</td><td>\${wallet}</td>\`;
    data.history.forEach(h => {
      cells += \`<td>\${h.balances[idx] || 0}</td>\`;
    });
    row.innerHTML = cells;
    tbody.appendChild(row);
  });
}

loadData();
