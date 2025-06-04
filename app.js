    document.addEventListener('DOMContentLoaded', function() {
      // Color menu logic
      let selectedColor = null;
      const colorMenu = document.getElementById('colorMenu');
      const colorTarget = document.getElementById('colorTarget');
      const applyColorBtn = document.getElementById('applyColorBtn');
      document.querySelectorAll('.color-swatch').forEach(s => {
        s.addEventListener('click', e => {
          selectedColor = s.style.backgroundColor;
          colorMenu.style.top = e.pageY + 'px';
          colorMenu.style.left = e.pageX + 'px';
          colorMenu.style.display = 'block';
        });
      });
      applyColorBtn.addEventListener('click', () => {
        const target = colorTarget.value;
        switch(target) {
          case 'body-bg': document.body.style.backgroundColor = selectedColor; break;
          case 'body-border': document.body.style.borderColor = selectedColor; break;
          case 'body-text': document.body.style.color = selectedColor; break;
          case 'h1-color': document.querySelectorAll('h1, h2').forEach(h=>h.style.color = selectedColor); break;
          case 'info-bg': document.querySelector('.info').style.backgroundColor = selectedColor; break;
          case 'info-text': document.querySelector('.info').style.color = selectedColor; break;
          case 'cell-border': document.querySelectorAll('th, td').forEach(c=>c.style.borderColor = selectedColor); break;
          case 'thead-bg': document.querySelector('thead').style.backgroundColor = selectedColor; break;
          case 'row-even-bg': document.querySelectorAll('tbody tr:nth-child(even) td').forEach(r=>r.style.backgroundColor = selectedColor); break;
          case 'row-odd-bg': document.querySelectorAll('tbody tr:nth-child(odd) td').forEach(r=>r.style.backgroundColor = selectedColor); break;
          case 'input-bg': document.querySelectorAll('input[type=number]').forEach(i=>i.style.backgroundColor = selectedColor); break;
          case 'input-border': document.querySelectorAll('input[type=number]').forEach(i=>i.style.borderColor = selectedColor); break;
          case 'input-text': document.querySelectorAll('input[type=number]').forEach(i=>i.style.color = selectedColor); break;
          case 'month-header-color': document.querySelectorAll('.month-header').forEach(m=>m.style.color = selectedColor); break;
          case 'detail-bg': document.querySelectorAll('.detail-column').forEach(d=>d.style.backgroundColor = selectedColor); break;
          case 'add-btn-bg': document.querySelectorAll('.add-detail-btn').forEach(b=>b.style.backgroundColor = selectedColor); break;
          case 'switch-bg': document.querySelector('.switch-btn').style.backgroundColor = selectedColor; break;
          case 'switch-text': document.querySelector('.switch-btn').style.color = selectedColor; break;
          case 'export-link-bg': exportLink.style.backgroundColor = selectedColor; break;
          case 'export-link-text': exportLink.style.color = selectedColor; break;
          case 'import-btn-bg': importBtn.style.backgroundColor = selectedColor; break;
          case 'import-btn-text': importBtn.style.color = selectedColor; break;
          case 'table-shadow-color': document.querySelector('table').style.boxShadow = `0 2px 16px ${selectedColor}`; break;
        }
        colorMenu.style.display = 'none';
      });
      document.addEventListener('click', e => {
        if (!colorMenu.contains(e.target) && !e.target.classList.contains('color-swatch')) {
          colorMenu.style.display = 'none';
        }
      });
      const saveState = s => localStorage.setItem('budget', JSON.stringify(s));
      const loadState = () => JSON.parse(localStorage.getItem('budget')||'{}');
      const state = loadState();

      // Elements
      const tablePage = document.getElementById('tablePage');
      const secondPage = document.getElementById('secondPage');
      const switchBtn = document.querySelector('.switch-btn');
      const exportLink = document.getElementById('exportLink');
      const importBtn = document.getElementById('importBtn');
      const fileInput = document.getElementById('fileInput');
      const tableBody = document.getElementById('tableBody');
      const exBody = document.getElementById('exampleBody');

      // Toggle pages
      switchBtn.addEventListener('click', () => {
        if (tablePage.style.display !== 'none') {
          tablePage.style.display = 'none';
          secondPage.style.display = 'block';
        } else {
          secondPage.style.display = 'none';
          tablePage.style.display = 'block';
        }
      });
      tablePage.style.display = 'block'; secondPage.style.display = 'none';

      // Export JSON
      exportLink.addEventListener('click', function(e) {
        e.preventDefault();
        const json = JSON.stringify(state, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        this.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });

      // Import JSON
      importBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', function() {
        const file = this.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
          try { Object.assign(state, JSON.parse(e.target.result)); saveState(state); location.reload(); }
          catch { alert('Błędny plik JSON'); }
        };
        reader.readAsText(file);
      });

      // Main table logic
      const months = ['Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
      const RENT = 500, INITIAL_DEBT = 5700;
      let carry = 0;

      window.addDetail = function(i, type) {
        const cont = document.getElementById(`det-${type}-${i}`);
        const div = document.createElement('div'); div.className = 'detail-entry';
        div.innerHTML = `<input type="text" placeholder="Nazwa"><input type="number" value="0" onchange="sumDetails(${i},'${type}')">`;
        cont.appendChild(div);
      };

      window.sumDetails = function(i, type) {
        const vals = Array.from(document.querySelectorAll(`#det-${type}-${i} input[type=number]`))
          .map(el => +el.value || 0);
        document.getElementById(`${type}-${i}`).value = vals.reduce((a,b)=>a+b,0);
        recalc();
      };

      function recalc() {
        let debt = INITIAL_DEBT; carry = 0;
        months.forEach((_, i) => {
          if (i>=1 && i<=6) debt += 1000;
          const inc = +document.getElementById(`inc-${i}`).value || 0;
          const food = +document.getElementById(`food-${i}`).value || 0;
          const extra = +document.getElementById(`extra-${i}`).value || 0;
          const repEl = document.getElementById(`rep-${i}`);
          const base = carry + inc;
          document.getElementById(`bud-${i}`).value = base;
          const repayDefault = Math.max(0, Math.round((base-RENT)*0.3));
          if (document.activeElement !== repEl) repEl.value = repayDefault;
          const repay = +repEl.value || 0;
          const rest = base - (RENT + repay + food + extra);
          debt = Math.max(0, debt - repay);
          document.getElementById(`deb-${i}`).value = debt;
          document.getElementById(`res-${i}`).value = rest;
          carry = rest;
        }); state.debt = debt; saveState(state);
      }

      // Build main table
      months.forEach((m,i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="month-header">${m}</td>
          <td><input type="number" disabled id="bud-${i}"></td>
          <td><input type="number" id="inc-${i}" value="0"></td>
          <td><input type="number" disabled id="food-${i}" value="0"></td>
          <td><input type="number" disabled id="extra-${i}" value="0"></td>
          <td><input type="number" id="rep-${i}" value="0"></td>
          <td><input type="number" disabled id="deb-${i}" value="${i===0?INITIAL_DEBT:0}"></td>
          <td><input type="number" disabled id="res-${i}" value="0"></td>
        `;
        const dr = document.createElement('tr'); dr.className = 'details-row';
        dr.innerHTML = `
          <td colspan="8"><div class="detail-columns">
            <div class="detail-column"><strong>Jedzenie</strong><div id="det-food-${i}"/></div><button class="add-detail-btn" onclick="addDetail(${i},'food')">+ Dodaj</button></div>
            <div class="detail-column"><strong>Inne wydatki</strong><div id="det-extra-${i}"/></div><button class="add-detail-btn" onclick="addDetail(${i},'extra')">+ Dodaj</button></div>
          </div></td>
        `;
        tableBody.append(tr, dr);
      });
      tableBody.querySelectorAll('.month-header').forEach((cell,idx)=>cell.addEventListener('click',()=>{
        const dr=tableBody.children[idx*2+1]; dr.style.display = dr.style.display==='table-row'?'none':'table-row';
      }));
      tableBody.addEventListener('input', recalc);
      recalc();

      // Example table logic
      const exMonths=['Czerwiec','Lipiec','Sierpień']; let exCarry=0;
      state.example = state.example||[];
      window.addDetailEx = function(i) {
        const cont=document.getElementById(`ex-det-${i}`);
        const div=document.createElement('div'); div.className='detail-entry';
        div.innerHTML = `<input type="text" placeholder="Nazwa"><input type="number" value="0" onchange="sumDetailsEx(${i})">`;
        cont.append(div);
      };
      window.sumDetailsEx = function(i) {
        const vals=Array.from(document.querySelectorAll(`#ex-det-${i} input[type=number]`)).map(e=>+e.value||0);
        document.getElementById(`ex-food-${i}`).value=vals.reduce((a,b)=>a+b,0);
        recalcEx();
      };
      function recalcEx(){ exCarry=0; exMonths.forEach((_,i)=>{
        const inc=+document.getElementById(`ex-inc-${i}`).value||0;
        const food=+document.getElementById(`ex-food-${i}`).value||0;
        const base=exCarry+inc; document.getElementById(`ex-bud-${i}`).value=base;
        exCarry=base-food;
      }); state.example = exMonths.map((_,i)=>({inc:document.getElementById(`ex-inc-${i}`).value,food:document.getElementById(`ex-food-${i}`).value})); saveState(state); }
      exMonths.forEach((m,i)=>{
        const row=document.createElement('tr'); row.innerHTML=`
          <td class="month-header">${m}</td>
          <td><input type="number" disabled id="ex-bud-${i}" value="0"></td>
          <td><input type="number" id="ex-inc-${i}" value="${state.example[i]?.inc||0}" onchange="recalcEx()"></td>
          <td><input type="number" disabled id="ex-food-${i}" value="${state.example[i]?.food||0}"></td>
        `;
        const dr=document.createElement('tr'); dr.className='details-row';
        dr.innerHTML=`<td colspan="4"><div class="detail-columns"><div class="detail-column"><strong>Jedzenie</strong><div id="ex-det-${i}"></div><button class="add-detail-btn" onclick="addDetailEx(${i})">+ Dodaj</button></div></div></td>`;
        exBody.append(row, dr);
      });
      document.querySelectorAll('#exampleBody .month-header').forEach((c,i)=>c.addEventListener('click',()=>{
        const dr=exBody.children[i*2+1]; dr.style.display=dr.style.display==='table-row'?'none':'table-row';
      }));
      recalcEx();
    });
