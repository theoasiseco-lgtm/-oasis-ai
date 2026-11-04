const $=s=>document.querySelector(s);let entries=JSON.parse(localStorage.getItem('oasis_entries')||'[]');
function money(v){return '$'+Number(v).toFixed(2)}
function render(){let inc=entries.filter(x=>x.kind==='income').reduce((a,x)=>a+x.amount,0),exp=entries.filter(x=>x.kind==='expense').reduce((a,x)=>a+x.amount,0);$('#income').textContent=money(inc);$('#expense').textContent=money(exp);$('#balance').textContent=money(inc-exp);$('#transactions').innerHTML=entries.length?entries.slice().reverse().slice(0,12).map(x=>`<div class="tx"><span class="symbol ${x.kind==='income'?'in':'out'}">${x.kind==='income'?'＋':'－'}</span><div class="desc"><b>${escapeHtml(x.note|| (x.kind==='income'?'إيراد':'مصروف'))}</b><small>${new Date(x.date).toLocaleString('ar-CA')}</small></div><strong class="${x.kind==='income'?'green':'red'}">${x.kind==='income'?'+':'-'}${money(x.amount)}</strong></div>`).join(''):'<p class="empty">لا توجد حركات بعد.</p>'}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showToast(t){let e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2500)}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>{let id=b.dataset.page;document.querySelectorAll('.page').forEach(p=>p.classList.toggle('hidden',p.id!==id));document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('active',x.dataset.page===id));document.querySelectorAll('footer button').forEach(x=>x.classList.toggle('selected',x.dataset.page===id));window.scrollTo(0,0)}));
$('#entry').addEventListener('submit',e=>{e.preventDefault();let amount=Number($('#amount').value);if(!(amount>0))return;entries.push({kind:$('#kind').value,amount,note:$('#note').value.trim(),date:new Date().toISOString()});localStorage.setItem('oasis_entries',JSON.stringify(entries));e.target.reset();render();showToast('تم حفظ الحركة على هاتفك')});
$('#clear').addEventListener('click',()=>{if(confirm('هل تريد مسح كل الحركات المسجلة على هذا الهاتف؟')){entries=[];localStorage.setItem('oasis_entries','[]');render()}});
$('#notify').addEventListener('click',()=>showToast('التنبيهات ستُفعّل بعد ربط خدمة الإشعارات'));
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));render();
// Market quotes are requested through a server function; the secret API key is never sent to the browser.
const quoteButton = document.querySelector('#getQuote');
if (quoteButton) quoteButton.addEventListener('click', async () => {
  const symbol = document.querySelector('#symbol').value.trim().toUpperCase();
  const result = document.querySelector('#quoteResult');
  const status = document.querySelector('#marketStatus');
  if (!symbol) { result.textContent = 'اكتب رمز السهم أولاً.'; return; }
  result.textContent = 'جارٍ جلب السعر...';
  quoteButton.disabled = true;
  try {
    const response = await fetch(`/.netlify/functions/quote?symbol=${encodeURIComponent(symbol)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'تعذر جلب السعر.');
    result.innerHTML = `<b>${escapeHtml(data.name || data.symbol)}</b><div class="quotePrice">${escapeHtml(data.close)} ${escapeHtml(data.currency || '')}</div><small>${escapeHtml(data.exchange || '')} · ${escapeHtml(data.datetime || '')}</small><small>المصدر: Twelve Data</small>`;
    status.textContent = 'اتصال البيانات';
    status.classList.remove('warn');
  } catch (err) {
    result.textContent = err.message || 'تعذر الاتصال. تحقق من إعداد المفتاح وتغطية الرمز.';
  } finally { quoteButton.disabled = false; }
});
