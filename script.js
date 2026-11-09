// 名片只使用本機資料，不需登入，也不會將聯絡資料傳給其他服務。
const contact = {
  name: '葉卿琳',
  englishName: 'Chris Yeh',
  organization: '中華浸信會大村福音傳播協會',
  committee: '社區關懷委員會',
  title: '副祕書長',
  phone: '0911897911',
  email: 'cly0618@gmail.com',
  address: '新北市新店區民權路161號5樓',
  education: '台北醫學大學智慧醫療管理30+專班'
};
const statusText = document.getElementById('status');
const contactText = [
  `${contact.name} ${contact.englishName}`,
  contact.organization,
  `${contact.committee} ${contact.title}`,
  `手機：${contact.phone}`,
  `電子郵件：${contact.email}`,
  `地址：${contact.address}`,
  `學歷：${contact.education}`
].join('\n');
document.getElementById('year').textContent = new Date().getFullYear();

// 通訊錄使用標準電子名片格式；標點與換行須先轉義，避免欄位被誤判。
function escapeCard(text) {
  return text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}
function makeCard() {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeCard('葉')};${escapeCard('卿琳')};;;`,
    `FN:${escapeCard(contact.name + ' ' + contact.englishName)}`,
    `ORG:${escapeCard(contact.organization)};${escapeCard(contact.committee)}`,
    `TITLE:${escapeCard(contact.title)}`,
    `TEL;TYPE=CELL:${contact.phone}`,
    `EMAIL;TYPE=INTERNET:${contact.email}`,
    `ADR;TYPE=WORK:;;${escapeCard(contact.address)};;;;`,
    `NOTE:${escapeCard('英文姓名：' + contact.englishName + '\n學歷：' + contact.education)}`,
    'END:VCARD'
  ];
  // 長欄位依位元組折行，保留中文字元完整，方便不同手機通訊錄匯入。
  const encoder = new TextEncoder();
  return lines.map(line => {
    let result = '', chunk = '', bytes = 0;
    for (const character of line) {
      const length = encoder.encode(character).length;
      if (bytes + length > 75) { result += chunk + '\r\n'; chunk = ' '; bytes = 1; }
      chunk += character; bytes += length;
    }
    return result + chunk;
  }).join('\r\n') + '\r\n';
}
document.getElementById('save-contact').addEventListener('click', () => {
  const file = new Blob([makeCard()], {type: 'text/vcard;charset=utf-8'});
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = '葉卿琳-聯絡人.vcf';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  statusText.textContent = '已準備聯絡人檔案，請開啟下載檔案並匯入通訊錄。';
});
const copyDialog = document.getElementById('copy-dialog');
document.getElementById('copy-contact').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(contactText);
    statusText.textContent = '聯絡資料已複製，可貼上分享給親友。';
  } catch {
    // 直接點開本機網頁時，部分瀏覽器不允許剪貼簿操作，提供手動複製。
    const field = document.getElementById('contact-text');
    field.value = contactText;
    copyDialog.showModal();
    field.focus();
    field.select();
  }
});
document.getElementById('close-dialog').addEventListener('click', () => copyDialog.close());
