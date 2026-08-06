/* ============================================
   pages.js — 所有页面渲染函数
   ============================================ */

const Pages = {};

/* ---- 登录页 ---- */
Pages.login = function() {
  const el = document.getElementById('page-login');
  if (!el) return;

  let html = '<div class="login-page">';
  html += '<div class="login-logo">&#9749;</div>';
  html += '<div class="login-title">南城香协作终端</div>';
  html += '<div class="login-subtitle">门店协作管理平台</div>';

  // 手机号登录表单
  html += '<div class="phone-login-card">';
  html += '<div class="card-title">手机号登录</div>';
  html += '<div class="phone-input-group">';
  html += '<span class="phone-prefix">+86</span>';
  html += '<input type="tel" id="phone-input" class="phone-input" placeholder="请输入手机号" maxlength="11" value="' + (App._phoneLoginNumber || '') + '" oninput="Pages.onPhoneInput()">';
  html += '</div>';
  html += '<button class="sms-btn" id="sms-btn" onclick="Pages.doPhoneLogin()" disabled>登录</button>';
  html += '</div>';

  html += '<div class="login-divider"><span>或</span></div>';
  html += '<button class="skip-btn" onclick="App.quickLogin(); location.hash=\'#home\';">跳过登录，直接预览首页</button>';
  html += '</div>';
  el.innerHTML = html;
};

Pages._phoneLoginNumber = '';

Pages.onPhoneInput = function() {
  var phone = document.getElementById('phone-input').value.replace(/\D/g,'');
  var btn = document.getElementById('sms-btn');
  btn.disabled = phone.length !== 11;
  // 回车直接登录
  if (phone.length === 11) {
    document.getElementById('phone-input').onkeydown = function(e) {
      if (e.key === 'Enter') Pages.doPhoneLogin();
    };
  }
};

Pages.doPhoneLogin = function() {
  var phone = document.getElementById('phone-input').value.replace(/\D/g,'');
  if (phone.length !== 11) { App.toast('请输入完整手机号'); return; }
  Pages._phoneLoginNumber = phone;
  App._phoneLoginNumber = phone;

  // 按手机号匹配用户
  var users = App.getUsers();
  var user = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].phone === phone) {
      user = users[i];
      break;
    }
  }
  if (!user) {
    var seedUsers = App.seedData && App.seedData.users ? App.seedData.users : [];
    for (var j = 0; j < seedUsers.length; j++) {
      if (seedUsers[j].phone === phone) {
        user = seedUsers[j];
        break;
      }
    }
    if (!user) {
      App.toast('该手机号未注册，请联系管理员');
      return;
    }
  }
  if (App.login(user.id)) {
    App.toast('登录成功');
    location.hash = '#home';
  }
};

/* ---- 首页 ---- */
Pages.home = function() {
  const el = document.getElementById('page-home');
  if (!el) return;
  const user = App.currentUser;
  const stores = App.getStores();
  const penalties = App.getPenalties();
  const complaints = App.getComplaints();
  const onlineRecords = App.getOnlineRecords();
  const offlineRecords = App.getOfflineRecords();

  let html = '';

  /* 用户个人信息卡片 */
  var roleNames = App.Permissions.roleNames;
  var roleBadgeColors = App.Permissions.roleBadgeColors;
  html += '<div class="user-profile">';
  html += '<div class="user-avatar" style="background:' + (roleBadgeColors[user.role] || '#888') + '">' + (user.name || '?')[0] + '</div>';
  html += '<div class="user-info-text">';
  html += '<div class="user-name">' + (user.name || '未登录') + '</div>';
  html += '<div class="user-role">' + (roleNames[user.role] || user.role) + '</div>';
  if (user.store) {
    html += '<div class="user-shop">' + user.store + '</div>';
  } else if (user.area) {
    html += '<div class="user-shop">管辖区域：' + user.area + '</div>';
  }
  html += '</div>';
  html += '<div class="user-arrow" onclick="App.logout()" title="退出登录">\u{23FB}</div>';
  html += '</div>';

  if (user.role === '店长') {
    // 店长看自己门店
    const store = stores.find(s => s.id === user.storeId) || {};
    const storePenalties = penalties.filter(p => p.storeId === user.storeId);
    const storeComplaints = complaints.filter(c => c.storeId === user.storeId);
    const pendingPenalty = storePenalties.filter(p => p.status === '待补填').length;
    const pendingComplaint = storeComplaints.filter(c => c.status === '待处理').length;

    // 找门店得分（从线下稽核记录）
    const storeOffline = offlineRecords.filter(r => r.storeId === user.storeId);
    const latestScore = storeOffline.length > 0 ? storeOffline[storeOffline.length - 1].score : 85;

    html += '<div class="card">';
    html += '<div class="card-title">\u{1F3EA} ' + (store.name || '') + '</div>';
    const cls = latestScore >= 85 ? 'high' : (latestScore >= 70 ? 'mid' : 'low');
    html += '<div class="score-circle ' + cls + '">' + latestScore + '</div>';
    html += '<div style="text-align:center;color:var(--text-secondary);font-size:12px;">最新稽核得分</div>';
    html += '</div>';

    html += '<div class="stats-row">';
    html += '<div class="stat-card" onclick="location.hash=\'#penalty\'">';
    html += '<div class="stat-num" style="color:' + (pendingPenalty > 0 ? 'var(--status-overdue)' : 'var(--primary)') + '">' + pendingPenalty + '</div>';
    html += '<div class="stat-label">待处理处罚</div></div>';
    html += '<div class="stat-card" onclick="location.hash=\'#complaint\'">';
    html += '<div class="stat-num" style="color:' + (pendingComplaint > 0 ? 'var(--status-pending)' : 'var(--primary)') + '">' + pendingComplaint + '</div>';
    html += '<div class="stat-label">待处理差评</div></div>';
    html += '</div>';

    // 有待处理差评时醒目提示
    if (pendingComplaint > 0) {
      html += '<div class="alert-card" onclick="location.hash=\'#complaint\'">';
      html += '<span class="alert-icon">\u{1F514}</span>';
      html += '您有 <b>' + pendingComplaint + '</b> 条新差评待处理，请点击填写责任人并生成处罚';
      html += '</div>';
    }

    html += '<div class="quick-entries">';
    html += '<div class="quick-entry" onclick="location.hash=\'#inspection\'"><span class="qe-icon">\u{1F4CB}</span>检查记录</div>';
    html += '<div class="quick-entry" onclick="location.hash=\'#penalty\'"><span class="qe-icon">\u{26A0}</span>处罚登记</div>';
    html += '<div class="quick-entry" onclick="location.hash=\'#complaint\'"><span class="qe-icon">\u{1F4AC}</span>差评申诉</div>';
    html += '<div class="quick-entry" onclick="location.hash=\'#dashboard\'"><span class="qe-icon">\u{1F4CA}</span>数据看板</div>';
    html += '</div>';

  } else if (user.role === '线上稽核' || user.role === '线下稽核') {
    const todayRecords = user.role === '线上稽核'
      ? onlineRecords.filter(r => r.inspector === user.name)
      : offlineRecords.filter(r => r.inspector === user.name);
    const todayCount = todayRecords.length;

    html += '<div class="card">';
    html += '<div class="card-title">\u{1F4C5} 今日工作</div>';
    html += '<div class="stats-row">';
    html += '<div class="stat-card"><div class="stat-num">' + todayCount + '</div><div class="stat-label">今日提交</div></div>';
    html += '<div class="stat-card"><div class="stat-num">' + stores.length + '</div><div class="stat-label">管辖门店</div></div>';
    html += '</div></div>';

    html += '<div class="quick-entries">';
    if (user.role === '线上稽核') {
      html += '<div class="quick-entry" onclick="location.hash=\'#inspection\'"><span class="qe-icon">\u{1F4DD}</span>线上检查录入</div>';
    } else {
      html += '<div class="quick-entry" onclick="location.hash=\'#offline-inspect\'"><span class="qe-icon">\u{1F50D}</span>线下检查录入</div>';
    }
    html += '<div class="quick-entry" onclick="location.hash=\'#penalty\'"><span class="qe-icon">\u{26A0}</span>处罚登记</div>';
    html += '<div class="quick-entry" onclick="location.hash=\'#complaint\'"><span class="qe-icon">\u{1F4AC}</span>差评申诉</div>';
    html += '<div class="quick-entry" onclick="location.hash=\'#dashboard\'"><span class="qe-icon">\u{1F4CA}</span>数据看板</div>';
    html += '</div>';

  } else if (user.role === '总部' || user.role === '区域教练' || user.role === 'admin' || user.role === '客服' || user.role === '营运') {
    const totalPenalties = penalties.length;
    const donePenalties = penalties.filter(p => p.status === '已闭环').length;
    const totalComplaints = complaints.length;
    const appealedComplaints = complaints.filter(c => c.status === '已申诉' && c.appealResult === '通过').length;

    html += '<div class="stats-row">';
    html += '<div class="stat-card"><div class="stat-num">' + stores.length + '</div><div class="stat-label">门店总数</div></div>';
    html += '<div class="stat-card"><div class="stat-num">' + totalPenalties + '</div><div class="stat-label">处罚总数</div></div>';
    html += '</div>';

    html += '<div class="stats-row">';
    html += '<div class="stat-card"><div class="stat-num">' + donePenalties + '</div><div class="stat-label">已闭环处罚</div></div>';
    html += '<div class="stat-card"><div class="stat-num">' + totalComplaints + '</div><div class="stat-label">差评总数</div></div>';
    html += '</div>';

    html += '<div class="card">';
    html += '<div class="card-title">闭环率</div>';
    const closeRate = totalPenalties > 0 ? Math.round(donePenalties / totalPenalties * 100) : 0;
    html += '<div style="font-size:22px;font-weight:700;color:var(--primary)">' + closeRate + '%</div>';
    html += '<div class="progress-bar"><div class="progress-fill green" style="width:' + closeRate + '%"></div></div>';
    html += '</div>';

    html += '<div class="quick-entries">';
    html += '<div class="quick-entry" onclick="location.hash=\'#dashboard\'"><span class="qe-icon">\u{1F4CA}</span>领导看板</div>';
    html += '<div class="quick-entry" onclick="location.hash=\'#penalty\'"><span class="qe-icon">\u{26A0}</span>处罚管理</div>';
    html += '<div class="quick-entry" onclick="location.hash=\'#complaint\'"><span class="qe-icon">\u{1F4AC}</span>差评审核</div>';
    html += '<div class="quick-entry" onclick="location.hash=\'#inspection\'"><span class="qe-icon">\u{1F4CB}</span>检查记录</div>';
    if (user.role === '总部' || user.role === 'admin' || user.role === '客服') {
      html += '<div class="quick-entry" onclick="location.hash=\'#admin\'"><span class="qe-icon">\u{2699}</span>数据管理</div>';
    }
    html += '</div>';
  }

  el.innerHTML = html;
};

/* ---- 数据管理页（总部专享：人员管理 + 导入导出） ---- */
Pages.admin = function() {
  var user = App.currentUser;
  if (user.role !== '总部' && user.role !== 'admin' && user.role !== '客服') {
    var el = document.getElementById('page-admin');
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128683;</div><div>仅总部管理员可访问此页面</div></div>';
    return;
  }

  var html = '';

  /* ===== 人员管理 ===== */
  var users = App.getUsers();
  html += '<div class="section-title">&#128101; 人员管理（' + users.length + '人）</div>';
  html += '<div class="action-bar">';
  html += '<button class="btn btn-primary" onclick="Pages._userForm()">+ 新增人员</button>';
  html += '</div>';

  if (users.length === 0) {
    html += '<div class="empty-state">暂无人员数据</div>';
  } else {
    html += '<div class="user-list">';
    var roleMap = App.Permissions.roleBadgeColors;
    users.forEach(function(u) {
      html += '<div class="user-row">';
      html += '<div class="user-info">';
      html += '<div class="user-name">' + u.name + '</div>';
      html += '<div class="user-meta">';
      html += '<span class="user-role-tag" style="background:' + (roleMap[u.role] || '#6b7280') + '">' + (App.Permissions.roleNames[u.role] || u.role) + '</span>';
      if (u.store) html += '<span class="user-store">' + u.store + '</span>';
      if (u.area) html += '<span class="user-area">' + u.area + '</span>';
      html += '<span class="user-phone">' + (u.phone || '') + '</span>';
      html += '</div></div>';
      html += '<div class="user-actions">';
      html += '<button class="btn btn-xs" onclick="Pages._userForm(\'' + u.id + '\')">编辑</button>';
      html += '<button class="btn btn-xs btn-danger" onclick="Pages._userDelete(\'' + u.id + '\',\'' + u.name + '\')">删除</button>';
      html += '</div></div>';
    });
    html += '</div>';
  }

  /* ===== 数据导入 ===== */
  html += '<div class="section-title" style="margin-top:24px">&#128229; 数据导入</div>';

  html += '<div class="card">';
  html += '<div class="card-title">导入人员</div>';
  html += '<div class="card-desc">XLS 格式：id, 姓名, 角色(总部/线上稽核/线下稽核/区域教练/店长), 区域/区, 门店ID, 门店名, 手机号</div>';
  html += '<div style="margin:8px 0"><button class="btn btn-xs btn-outline" onclick="App.downloadTemplate(\'users\')">下载人员模板</button></div>';
  html += '<input type="file" accept=".xls,.xlsx" onchange="App.importXLS(this, \'users\')" style="display:none" id="file-users">';
  html += '<button class="btn btn-primary" style="width:100%" onclick="document.getElementById(\'file-users\').click()">选择人员 XLS 并导入</button>';
  html += '</div>';

  html += '<div class="card">';
  html += '<div class="card-title">导入门店</div>';
  html += '<div class="card-desc">XLS 格式：门店ID, 门店名, 行政区, 行政区域, 经营区, 区域, 店长, 店长称谓, 经营模式</div>';
  html += '<div style="margin:8px 0"><button class="btn btn-xs btn-outline" onclick="App.downloadTemplate(\'stores\')">下载门店模板</button></div>';
  html += '<input type="file" accept=".xls,.xlsx" onchange="App.importXLS(this, \'stores\')" style="display:none" id="file-stores">';
  html += '<button class="btn btn-primary" style="width:100%" onclick="document.getElementById(\'file-stores\').click()">选择门店 XLS 并导入</button>';
  html += '</div>';

  /* ===== 数据导出 ===== */
  html += '<div class="section-title" style="margin-top:20px">&#128228; 数据导出</div>';

  html += '<div class="card">';
  html += '<div class="card-title">导出人员数据</div>';
  html += '<button class="btn btn-outline" style="width:100%" onclick="App.exportXLS(\'users\')">下载人员 XLS</button>';
  html += '</div>';

  html += '<div class="card">';
  html += '<div class="card-title">导出处罚数据</div>';
  html += '<button class="btn btn-outline" style="width:100%" onclick="App.exportXLS(\'penalties\')">下载处罚 XLS</button>';
  html += '</div>';

  html += '<div class="card">';
  html += '<div class="card-title">导出差评数据</div>';
  html += '<button class="btn btn-outline" style="width:100%" onclick="App.exportXLS(\'complaints\')">下载差评 XLS</button>';
  html += '</div>';

  html += '<div class="card">';
  html += '<div class="card-title">导出看板汇总</div>';
  html += '<button class="btn btn-outline" style="width:100%" onclick="App.exportXLS(\'dashboard\')">下载看板 XLS</button>';
  html += '</div>';

  document.getElementById('page-admin').innerHTML = html;
};

/* ---- 人员表单弹窗 ---- */
Pages._userForm = function(id) {
  var users = App.getUsers();
  var u = id ? users.find(function(x) { return x.id === id; }) : null;
  var isEdit = !!u;
  var title = isEdit ? '编辑人员' : '新增人员';

  var html = '<div class="modal-overlay" onclick="this.remove()"><div class="modal-box" onclick="event.stopPropagation()">';
  html += '<div class="modal-header"><h3>' + title + '</h3><span class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">&times;</span></div>';
  html += '<div class="modal-body">';

  html += '<div class="form-group"><label>姓名</label>';
  html += '<input type="text" id="uf-name" class="form-input" value="' + (u ? u.name || '' : '') + '" placeholder="如：张三"></div>';

  html += '<div class="form-group"><label>角色</label>';
  html += '<select id="uf-role" class="form-input">';
  ['总部', '线上稽核', '线下稽核', '区域教练', '店长', '客服', '营运'].forEach(function(r) {
    var sel = (u && u.role === r) ? ' selected' : '';
    html += '<option value="' + r + '"' + sel + '>' + r + '</option>';
  });
  html += '</select></div>';

  html += '<div class="form-group"><label>手机号</label>';
  html += '<input type="tel" id="uf-phone" class="form-input" value="' + (u ? u.phone || '' : '') + '" placeholder="用于登录"></div>';

  html += '<div class="form-group"><label>所属区域</label>';
  html += '<input type="text" id="uf-area" class="form-input" value="' + (u ? u.area || '' : '') + '" placeholder="区域教练填写，如：经营一区"></div>';

  html += '<div class="form-group"><label>绑定门店</label>';
  html += App.renderStoreSelect('uf-storeId', stores, u ? u.storeId : '', '输入门店名称搜索...');

  html += '</div>';
  html += '<div class="modal-footer">';
  html += '<button class="btn" onclick="this.closest(\'.modal-overlay\').remove()">取消</button>';
  html += '<button class="btn btn-primary" onclick="Pages._userSave(\'' + (isEdit ? id : '') + '\')">保存</button>';
  html += '</div>';
  html += '</div></div>';

  var div = document.createElement('div');
  div.innerHTML = html;
  var overlay = div.firstElementChild;
  document.body.appendChild(overlay);
  overlay.offsetHeight;
  overlay.classList.add('show');
  App.initStoreSelect('uf-storeId', App.getStores());
};

Pages._userSave = async function(id) {
  var name = (document.getElementById('uf-name') || {}).value || '';
  var role = (document.getElementById('uf-role') || {}).value || '店长';
  var phone = (document.getElementById('uf-phone') || {}).value || '';
  var area = (document.getElementById('uf-area') || {}).value || '';
  var storeId = App.getStoreSelectValue('uf-storeId');

  if (!name.trim()) return App.toast('请输入姓名');

  var storeName = '';
  if (storeId) {
    var stores = App.getStores();
    var s = stores.find(function(x) { return x.id === storeId; });
    if (s) storeName = s.name;
  }

  var data = { name: name.trim(), role: role, phone: phone.trim(), area: area.trim(), storeId: storeId, store: storeName };

  var overlay = document.querySelector('.modal-overlay');
  if (overlay) overlay.remove();

  if (id) {
    await App.updateUser(id, data);
  } else {
    await App.addUser(data);
  }
  Pages.admin();
};

Pages._userDelete = async function(id, name) {
  if (!confirm('确定删除「' + name + '」？此操作不可恢复。')) return;
  await App.deleteUser(id);
  Pages.admin();
};

/* ---- 门店检查页（线上组） ---- */
Pages.inspection = function() {
  const el = document.getElementById('page-inspection');
  if (!el) return;
  const user = App.currentUser;
  const stores = App.getStores();
  const records = App.getOnlineRecords();

  let html = '';

  if (!App.Permissions.canAccess(user.role, 'inspection')) {
    html += '<div class="empty-state"><div class="empty-icon">&#128683;</div><div>当前角色无权限访问此页面</div></div>';
    el.innerHTML = html;
    return;
  }

  // 表单
  html += '<div class="card"><div class="card-title">\u{1F4F7} 优化部稽核记录</div>';

  html += '<div class="form-group"><label class="form-label">项目类型</label>';
  html += '<select id="online-project" class="form-select">';
  ['稽核员日报', '线上差评点评', '公众号留言投诉', '电话投诉', '舆情检查记录个数', '个人洞察'].forEach(t => {
    html += '<option value="' + t + '">' + t + '</option>';
  });
  html += '</select></div>';

  // 拍照OCR区域
  html += '<div class="form-group"><label class="form-label">当日记录</label>';
  html += '<div class="ocr-area">';
  html += '<input type="file" id="ocr-camera" accept="image/*" capture="environment" style="display:none" onchange="Pages.onPhotoCapture(event)">';
  html += '<button class="btn btn-outline" onclick="document.getElementById(\'ocr-camera\').click()">\u{1F4F8} 拍照识别</button>';
  html += '<div id="ocr-preview" class="ocr-preview hidden"></div>';
  html += '<div id="ocr-status" class="ocr-status hidden"></div>';
  html += '</div>';
  html += '<textarea id="online-record" class="form-textarea" placeholder="拍照后自动识别，也可手动输入..."></textarea></div>';

  html += '<div class="form-group"><label class="form-label">反馈相关部门动作</label>';
  html += '<input id="online-feedback-dept" class="form-input" placeholder="如：群内曝光、邮件通知区域经理"></div>';

  html += '<div class="form-group"><label class="form-label">相关部门反馈</label>';
  html += '<input id="online-dept-feedback" class="form-input" placeholder="如：顾客已谅解、已整改"></div>';

  html += '<button class="btn btn-primary" onclick="Pages.submitOnline()">提交</button>';
  html += '</div>';

  // 已提交列表
  html += '<div class="card"><div class="card-title">\u{1F4CB} 已提交记录</div>';
  const userRecords = records.filter(r => r.inspector === user.name);
  if (userRecords.length === 0) {
    html += '<div class="empty-state"><div class="empty-icon">\u{1F4C4}</div>暂无记录</div>';
  } else {
    userRecords.slice().reverse().forEach(r => {
      html += '<div class="list-item">';
      html += '<div class="li-main">';
      html += '<div class="li-title">' + r.projectType + ' — ' + (r.store || '') + '</div>';
      html += '<div class="li-sub">' + r.date + ' | ' + (r.record || '').substring(0, 40) + '...</div>';
      html += '</div>';
      html += '</div>';
    });
  }
  html += '</div>';

  el.innerHTML = html;
};

// 照片捕获回调
Pages.onPhotoCapture = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 显示预览
  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById('ocr-preview');
    preview.innerHTML = '<img src="' + e.target.result + '" class="ocr-img"><button class="btn btn-primary ocr-detect-btn" onclick="Pages.doOCR(\'' + e.target.result + '\')">\u{1F50D} 开始识别文字</button>';
    preview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
};

// OCR 识别
Pages.doOCR = function(dataUrl) {
  const status = document.getElementById('ocr-status');
  status.innerHTML = '<span class="ocr-loading">\u23F3 正在识别文字...</span>';
  status.classList.remove('hidden');

  Tesseract.recognize(dataUrl, 'chi_sim+eng', {
    logger: function(m) {
      if (m.status === 'recognizing text') {
        status.innerHTML = '<span class="ocr-loading">\u23F3 识别中... ' + Math.round(m.progress * 100) + '%</span>';
      }
    }
  }).then(function(result) {
    const text = result.data.text.trim();
    document.getElementById('online-record').value = text;
    status.innerHTML = '<span class="ocr-done">\u2705 识别完成，可修改后提交</span>';
    App.toast('识别完成');
  }).catch(function(err) {
    status.innerHTML = '<span class="ocr-fail">\u274C 识别失败，请手动输入</span>';
    console.error('OCR error:', err);
  });
};

Pages.submitOnline = function() {
  const user = App.currentUser;
  const project = document.getElementById('online-project').value;
  const record = document.getElementById('online-record').value.trim();
  const feedbackDept = document.getElementById('online-feedback-dept').value.trim();
  const deptFeedback = document.getElementById('online-dept-feedback').value.trim();

  if (!record) { App.toast('请填写当日记录'); return; }

  const records = App.getOnlineRecords();
  const now = new Date();
  const dateStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');

  records.push({
    id: 'o' + Date.now(),
    inspector: user.name,
    storeId: user.storeId || '',
    store: user.store || '',
    projectType: project,
    record: record,
    feedbackDept: feedbackDept,
    deptFeedback: deptFeedback,
    date: dateStr
  });

  App.saveOnlineRecords(records);
  App.toast('提交成功');
  Pages.inspection();
};

/* ---- 线下门店检查页 ---- */
Pages['offline-inspect'] = function() {
  const el = document.getElementById('page-offline-inspect');
  if (!el) return;
  const stores = App.getStores();
  const records = App.getOfflineRecords();
  const user = App.currentUser;

  let html = '<div class="card"><div class="card-title">\u{1F50D} 线下门店检查</div>';

  html += '<div class="form-group"><label class="form-label">门店</label>';
  html += App.renderStoreSelect('offline-store', stores, '', '输入门店名称搜索...');

  html += '<div class="form-group"><label class="form-label">检查日期</label>';
  html += '<input id="offline-date" type="date" class="form-input" value="' + new Date().toISOString().split('T')[0] + '"></div>';

  html += '<div class="form-group"><label class="form-label">得分</label>';
  html += '<input id="offline-score" type="number" class="form-input" placeholder="0-100" min="0" max="100" value="85"></div>';

  html += '<div class="form-group"><label class="form-label">扣分项</label>';
  html += '<textarea id="offline-deductions" class="form-textarea" placeholder="详细列出扣分项目和分值..."></textarea></div>';

  html += '<div class="form-group"><label class="form-label">照片（模拟）</label>';
  html += '<input id="offline-photo" class="form-input" placeholder="暂不支持上传，此处留空"></div>';

  html += '<div class="form-group"><label class="form-label">备注</label>';
  html += '<textarea id="offline-note" class="form-textarea" placeholder="检查备注..."></textarea></div>';

  html += '<button class="btn btn-primary" onclick="Pages.submitOffline()">提交检查</button>';
  html += '</div>';

  // 已提交
  html += '<div class="card"><div class="card-title">提交记录</div>';
  if (records.length === 0) {
    html += '<div class="empty-state"><div class="empty-icon">\u{1F4C4}</div>暂无记录</div>';
  } else {
    records.slice().reverse().forEach(r => {
      html += '<div class="list-item">';
      html += '<div class="li-main">';
      html += '<div class="li-title">' + r.store + ' — 得分 ' + r.score + '</div>';
      html += '<div class="li-sub">' + r.date + ' | 稽核员: ' + r.inspector + '</div>';
      html += '</div></div>';
    });
  }
  html += '</div>';

  el.innerHTML = html;
  App.initStoreSelect('offline-store', App.getStores());
};

Pages.submitOffline = function() {
  const user = App.currentUser;
  const storeId = App.getStoreSelectValue('offline-store');
  const store = App.getStores().find(s => s.id === storeId);
  const date = document.getElementById('offline-date').value;
  const score = parseInt(document.getElementById('offline-score').value);
  const deductions = document.getElementById('offline-deductions').value.trim();
  const photo = document.getElementById('offline-photo').value.trim();
  const note = document.getElementById('offline-note').value.trim();

  if (!storeId || !date || isNaN(score)) { App.toast('请完善必填项'); return; }

  const records = App.getOfflineRecords();
  records.push({
    id: 'of' + Date.now(),
    inspector: user.name,
    storeId: storeId,
    store: store ? store.name : '',
    date: date,
    score: score,
    deductions: deductions,
    photo: photo,
    note: note
  });

  App.saveOfflineRecords(records);
  App.toast('提交成功');
  Pages['offline-inspect']();
};

/* ---- 处罚登记页 ---- */
Pages.penalty = function() {
  const el = document.getElementById('page-penalty');
  if (!el) return;
  const user = App.currentUser;
  const stores = App.getStores();
  const penalties = App.getPenalties();
  const districts = [...new Set(stores.map(s => s.district))];

  let html = '';

  if (!App.Permissions.canAccess(user.role, 'penalty')) {
    html += '<div class="empty-state"><div class="empty-icon">&#128683;</div><div>当前角色无权限访问此页面</div></div>';
    el.innerHTML = html;
    return;
  }

  if (App.Permissions.canAccess(user.role, 'penalty') && user.role !== '店长') {
    // 完整表单 — 22个字段
    html += '<div class="card"><div class="card-title">\u{26A0} 处罚登记</div>';

    html += '<div class="form-group"><label class="form-label">区域</label>';
    html += '<select id="pen-region" class="form-select" onchange="Pages.penaltyRegionChange()">';
    html += '<option value="">请选择</option>';
    districts.forEach(d => { html += '<option value="' + d + '">' + d + '</option>'; });
    html += '</select></div>';

    html += '<div class="form-group"><label class="form-label">门店</label>';
    html += App.renderStoreSelect('pen-store', stores, '', '输入门店名称搜索...');

    html += '<div class="form-group"><label class="form-label">门店第一负责人</label>';
    html += '<input id="pen-manager" class="form-input" placeholder="自动填充"></div>';

    html += '<div class="form-group"><label class="form-label">发生日期</label>';
    html += '<input id="pen-event-date" type="date" class="form-input"></div>';

    html += '<div class="form-group"><label class="form-label">具体事件</label>';
    html += '<textarea id="pen-event" class="form-textarea" placeholder="事件描述..."></textarea></div>';

    html += '<div class="form-group"><label class="form-label">营运部调查结果</label>';
    html += '<textarea id="pen-survey" class="form-textarea" placeholder="调查结论..."></textarea></div>';

    html += '<div class="form-group"><label class="form-label">建议处罚方案</label>';
    html += '<input id="pen-suggestion" class="form-input" placeholder="处罚建议"></div>';

    html += '<div class="form-group"><label class="form-label">稽核人员</label>';
    html += '<input id="pen-inspector" class="form-input" value="' + user.name + '"></div>';

    html += '<div class="form-group"><label class="form-label">奖惩制度条款</label>';
    html += '<input id="pen-policy" class="form-input" placeholder="如：新奖惩制度第X条"></div>';

    html += '<div class="form-group"><label class="form-label">当事人姓名</label>';
    html += '<input id="pen-person-name" class="form-input"></div>';

    html += '<div class="form-group"><label class="form-label">惩处等级</label>';
    html += '<select id="pen-level" class="form-select">';
    ['一级批评教育', '二级书面警告', '三级降职降薪', '经济处罚'].forEach(l => {
      html += '<option value="' + l + '">' + l + '</option>';
    });
    html += '</select></div>';

    html += '<div class="form-group"><label class="form-label">违纪类型</label>';
    html += '<select id="pen-type" class="form-select">';
    ['纪律类', '管理失职', '食品安全', '运营类'].forEach(t => {
      html += '<option value="' + t + '">' + t + '</option>';
    });
    html += '</select></div>';

    html += '<div class="form-group"><label class="form-label">经济处罚-当事人</label>';
    html += '<input id="pen-eco-person" class="form-input" placeholder="金额或取消奖金"></div>';

    html += '<div class="form-group"><label class="form-label">经济处罚-店长</label>';
    html += '<input id="pen-eco-manager" class="form-input" placeholder="金额或取消奖金"></div>';

    html += '<div class="form-group"><label class="form-label">来源</label>';
    html += '<input id="pen-source" class="form-input" placeholder="现场稽核/线上差评/店长上报..."></div>';

    html += '<button class="btn btn-primary" onclick="Pages.submitPenalty()">提交处罚记录</button>';
    html += '</div>';
  }

  // 列表
  let listPenalties = penalties;
  if (user.role === '店长') {
    listPenalties = penalties.filter(p => p.storeId === user.storeId);
  } else if (user.role === '区域教练') {
    listPenalties = penalties.filter(p => {
      const s = stores.find(x => x.name === p.store);
      return s && s.region === user.area;
    });
  }

  html += '<div class="card"><div class="card-title">\u{1F4CB} 处罚记录（共 ' + listPenalties.length + ' 条）</div>';
  if (listPenalties.length === 0) {
    html += '<div class="empty-state"><div class="empty-icon">\u{2705}</div>暂无处罚记录</div>';
  } else {
    listPenalties.slice().reverse().forEach(p => {
      let tagClass = 'tag-pending';
      if (p.status === '已闭环') tagClass = 'tag-done';
      else if (p.status === '超时') tagClass = 'tag-overdue';
      html += '<div class="list-item" onclick="Pages.showPenaltyDetail(\'' + p.id + '\')">';
      html += '<div class="li-main">';
      html += '<div class="li-title">' + p.store + ' | ' + p.event + '</div>';
      html += '<div class="li-sub">' + p.eventDate + ' | <span class="tag ' + tagClass + '">' + p.status + '</span></div>';
      html += '</div></div>';
    });
  }
  html += '</div>';

  el.innerHTML = html;
  App.initStoreSelect('pen-store', stores, function(sid) {
    var s = App.getStores().find(function(x) { return x.id === sid; });
    document.getElementById('pen-manager').value = s ? (s.managerTitle ? s.managerTitle + s.manager : s.manager) : '';
  });
};

Pages.penaltyRegionChange = function() {
  const region = document.getElementById('pen-region').value;
  const allStores = App.getStores();
  const filtered = region ? allStores.filter(s => s.district === region) : allStores;
  App.resetStoreSelect('pen-store');
  App.initStoreSelect('pen-store', filtered, function(sid) {
    var s = App.getStores().find(function(x) { return x.id === sid; });
    document.getElementById('pen-manager').value = s ? (s.managerTitle ? s.managerTitle + s.manager : s.manager) : '';
  });
};

Pages.submitPenalty = function() {
  const storeId = App.getStoreSelectValue('pen-store');
  const storeData = App.getStores().find(s => s.id === storeId);
  const storeName = storeData ? storeData.name : '';

  const penalties = App.getPenalties();
  penalties.push({
    id: 'p' + Date.now(),
    storeId: storeId,
    store: storeName,
    region: storeData ? storeData.region : '',
    district: storeData ? storeData.district : '',
    manager: document.getElementById('pen-manager').value || (storeData ? storeData.manager : ''),
    eventDate: document.getElementById('pen-event-date').value,
    event: document.getElementById('pen-event').value.trim(),
    category: document.getElementById('pen-type').value,
    level: document.getElementById('pen-level').value,
    source: document.getElementById('pen-source').value.trim(),
    inspector: document.getElementById('pen-inspector').value.trim(),
    personName: document.getElementById('pen-person-name').value.trim(),
    personLevel: document.getElementById('pen-level').value,
    personType: document.getElementById('pen-type').value,
    penaltyPerson: document.getElementById('pen-eco-person').value.trim(),
    penaltyManager: document.getElementById('pen-eco-manager').value.trim(),
    survey: document.getElementById('pen-survey').value.trim(),
    suggestion: document.getElementById('pen-suggestion').value.trim(),
    policyRef: document.getElementById('pen-policy').value.trim(),
    dutyPerson: '', dutyManager: '', dutyValue: '', dutyCoach: '',
    status: '待补填'
  });

  App.savePenalties(penalties);
  App.toast('处罚记录已提交');
  Pages.penalty();
};

Pages.showPenaltyDetail = function(id) {
  const penalties = App.getPenalties();
  const p = penalties.find(x => x.id === id);
  if (!p) return;

  let html = '<div class="modal-box">';
  html += '<div class="modal-title">处罚详情</div>';
  html += '<p><b>门店：</b>' + p.store + '</p>';
  html += '<p><b>日期：</b>' + p.eventDate + '</p>';
  html += '<p><b>事件：</b>' + p.event + '</p>';
  html += '<p><b>等级：</b><span class="tag tag-pending">' + p.level + '</span></p>';
  html += '<p><b>类型：</b>' + p.category + '</p>';
  html += '<p><b>状态：</b><span class="tag ' + (p.status === '已闭环' ? 'tag-done' : (p.status === '超时' ? 'tag-overdue' : 'tag-pending')) + '">' + p.status + '</span></p>';
  if (p.survey) html += '<p><b>调查结果：</b>' + p.survey + '</p>';
  if (p.policyRef) html += '<p><b>制度条款：</b>' + p.policyRef + '</p>';

  if (p.status === '待补填') {
    html += '<hr style="margin:12px 0;border-color:var(--border)">';
    html += '<div class="form-group"><label class="form-label">责任人</label><input id="detail-duty-person" class="form-input" value="' + (p.dutyPerson || '') + '"></div>';
    html += '<div class="form-group"><label class="form-label">整改措施</label><textarea id="detail-duty-value" class="form-textarea">' + (p.dutyValue || '') + '</textarea></div>';
    html += '<button class="btn btn-success btn-sm" style="margin-right:8px" onclick="Pages.closePenalty(\'' + id + '\')">标记已闭环</button>';
  }

  html += '<button class="btn btn-outline btn-sm" style="margin-top:10px" onclick="document.getElementById(\'modal-overlay\').classList.remove(\'show\')">关闭</button>';
  html += '</div>';

  const modal = document.getElementById('modal-overlay');
  modal.querySelector('.modal-box').outerHTML = html;
  modal.classList.add('show');
};

Pages.closePenalty = function(id) {
  const penalties = App.getPenalties();
  const p = penalties.find(x => x.id === id);
  if (p) {
    p.status = '已闭环';
    p.dutyPerson = document.getElementById('detail-duty-person').value;
    p.dutyValue = document.getElementById('detail-duty-value').value;
    App.savePenalties(penalties);
  }
  App.toast('已标记为闭环');
  document.getElementById('modal-overlay').classList.remove('show');
  Pages.penalty();
};

/* ---- 差评申诉页 ---- */
Pages.complaint = function() {
  const el = document.getElementById('page-complaint');
  if (!el) return;
  const user = App.currentUser;
  const stores = App.getStores();
  const complaints = App.getComplaints();

  let html = '';

  if (!App.Permissions.canAccess(user.role, 'complaint')) {
    html += '<div class="empty-state"><div class="empty-icon">&#128683;</div><div>当前角色无权限访问此页面</div></div>';
    el.innerHTML = html;
    return;
  }

  // 表单
  html += '<div class="card"><div class="card-title">\u{1F4AC} 差评录入</div>';

  html += '<div class="form-group"><label class="form-label">门店</label>';
  html += App.renderStoreSelect('comp-store', stores, '', '输入门店名称搜索...');

  html += '<div class="form-group"><label class="form-label">日期</label>';
  html += '<input id="comp-date" type="date" class="form-input" value="' + new Date().toISOString().split('T')[0] + '"></div>';

  html += '<div class="form-group"><label class="form-label">餐段</label>';
  html += '<select id="comp-meal" class="form-select">';
  ['早餐', '午餐', '晚餐', '未知'].forEach(m => { html += '<option>' + m + '</option>'; });
  html += '</select></div>';

  html += '<div class="form-group"><label class="form-label">投诉内容</label>';
  html += '<textarea id="comp-content" class="form-textarea" placeholder="顾客投诉摘要..."></textarea></div>';

  html += '<div class="form-group"><label class="form-label">机会点</label>';
  html += '<input id="comp-opportunity" class="form-input" placeholder="如：口味标准化/服务培训"></div>';

  html += '<div class="form-group"><label class="form-label">平台</label>';
  html += '<select id="comp-platform" class="form-select">';
  ['点评', '公众号'].forEach(p => { html += '<option>' + p + '</option>'; });
  html += '</select></div>';

  html += '<div class="form-group"><label class="form-label">责任人</label>';
  html += '<input id="comp-responsible" class="form-input" placeholder="责任人姓名"></div>';

  html += '<button class="btn btn-primary" onclick="Pages.submitComplaint()">提交</button>';
  html += '</div>';

  // 列表
  let listComplaints = complaints;
  if (user.role === '店长') {
    listComplaints = complaints.filter(c => c.storeId === user.storeId);
  } else if (user.role === '区域教练' && user.area) {
    listComplaints = complaints.filter(c => stores.filter(s => s.region === user.area).some(s => s.id === c.storeId));
  }

  html += '<div class="card"><div class="card-title">差评列表（共 ' + listComplaints.length + ' 条）</div>';
  if (listComplaints.length === 0) {
    html += '<div class="empty-state"><div class="empty-icon">\u{1F4AD}</div>暂无差评</div>';
  } else {
    listComplaints.slice().reverse().forEach(c => {
      let tagClass = 'tag-pending';
      if (c.status === '待处理') tagClass = 'tag-warning';
      else if (c.status === '已处理') tagClass = 'tag-done';
      else if (c.status === '已申诉' && c.appealResult === '通过') tagClass = 'tag-done';
      else if (c.status === '已驳回') tagClass = 'tag-overdue';

      html += '<div class="list-item" onclick="Pages.showComplaintDetail(\'' + c.id + '\')">';
      html += '<div class="li-main">';
      html += '<div class="li-title">' + c.store + ' | ' + c.content.substring(0, 30) + '...</div>';
      html += '<div class="li-sub">' + c.date + ' | <span class="tag ' + tagClass + '">' + c.status + '</span></div>';
      html += '</div></div>';
    });
  }
  html += '</div>';

  el.innerHTML = html;
  App.initStoreSelect('comp-store', stores);
};

Pages.submitComplaint = function() {
  const storeId = App.getStoreSelectValue('comp-store');
  const store = App.getStores().find(s => s.id === storeId);
  const complaints = App.getComplaints();

  complaints.push({
    id: 'c' + Date.now(),
    storeId: storeId,
    store: store ? store.name : '',
    date: document.getElementById('comp-date').value,
    meal: document.getElementById('comp-meal').value,
    content: document.getElementById('comp-content').value.trim(),
    opportunity: document.getElementById('comp-opportunity').value.trim(),
    platform: document.getElementById('comp-platform').value,
    responsible: document.getElementById('comp-responsible').value.trim(),
    responsibleTitle: '',
    dutyManager: store ? store.manager : '',
    status: '待处理',
    appealContent: '',
    appealResult: ''
  });

  App.saveComplaints(complaints);
  App.toast('差评已录入');
  Pages.complaint();
};

Pages.showComplaintDetail = function(id) {
  const complaints = App.getComplaints();
  const c = complaints.find(x => x.id === id);
  if (!c) return;

  let html = '<div class="modal-box">';
  html += '<div class="modal-title">差评详情</div>';
  html += '<p><b>门店：</b>' + c.store + '</p>';
  html += '<p><b>日期：</b>' + c.date + ' | ' + c.meal + '</p>';
  html += '<p><b>平台：</b>' + c.platform + '</p>';
  html += '<p><b>内容：</b>' + c.content + '</p>';
  html += '<p><b>机会点：</b>' + c.opportunity + '</p>';
  html += '<p><b>责任人：</b>' + c.responsible + '</p>';
  html += '<p><b>状态：</b>' + c.status + '</p>';

  if (c.appealContent) html += '<p><b>申诉材料：</b>' + c.appealContent + '</p>';
  if (c.appealResult) html += '<p><b>审核结果：</b>' + c.appealResult + '</p>';

  const user = App.currentUser;

  /* 待处理差评 → 店长填写责任人并生成处罚 */
  if (c.status === '待处理' && user.role === '店长') {
    html += '<hr style="margin:12px 0;border-color:var(--border)">';
    html += '<div class="form-group"><label class="form-label">确认责任人</label><input id="detail-duty-name" class="form-input" value="' + (c.responsible || '') + '" placeholder="责任人姓名"></div>';
    html += '<div class="form-group"><label class="form-label">责任人类型</label><select id="detail-duty-type" class="form-select"><option>店长</option><option>小时工</option><option>正式员工</option><option>管理者</option></select></div>';
    html += '<div class="form-group"><label class="form-label">处罚等级</label><select id="detail-duty-level" class="form-select"><option>一级批评教育</option><option>二级书面警告</option><option>三级降职降薪</option><option>经济处罚</option></select></div>';
    html += '<div class="form-group"><label class="form-label">经济处罚金额（元）</label><input id="detail-duty-amount" class="form-input" placeholder="如：200"></div>';
    html += '<div class="form-group"><label class="form-label">调查结论</label><textarea id="detail-duty-survey" class="form-textarea" placeholder="简要描述调查结果..."></textarea></div>';
    html += '<button class="btn btn-primary btn-sm" style="width:100%" onclick="Pages.resolveComplaint(\'' + id + '\')">确认责任人并生成处罚</button>';
  }

  /* 申诉流程 */
  if (c.status === '待申诉' && (user.role === '店长' || user.role === '总部' || user.role === '客服' || user.role === '营运')) {
    html += '<hr style="margin:12px 0;border-color:var(--border)">';
    html += '<div class="form-group"><label class="form-label">申诉内容</label><textarea id="detail-appeal" class="form-textarea" placeholder="申诉理由和材料..."></textarea></div>';
    if (user.role === '店长') {
      html += '<button class="btn btn-primary btn-sm" onclick="Pages.submitAppeal(\'' + id + '\')">提交申诉</button>';
    } else {
      html += '<button class="btn btn-success btn-sm" style="margin-right:8px" onclick="Pages.reviewAppeal(\'' + id + '\',\'通过\')">审核通过</button>';
      html += '<button class="btn btn-danger btn-sm" onclick="Pages.reviewAppeal(\'' + id + '\',\'驳回\')">驳回</button>';
    }
  }

  html += '<button class="btn btn-outline btn-sm" style="margin-top:10px" onclick="document.getElementById(\'modal-overlay\').classList.remove(\'show\')">关闭</button>';
  html += '</div>';

  const modal = document.getElementById('modal-overlay');
  modal.querySelector('.modal-box').outerHTML = html;
  modal.classList.add('show');
};

/* ---- 店长处理差评：填责任人并生成处罚 ---- */
Pages.resolveComplaint = function(id) {
  var complaints = App.getComplaints();
  var c = complaints.find(function(x) { return x.id === id; });
  if (!c) return;

  var dutyName = document.getElementById('detail-duty-name').value.trim();
  var dutyType = document.getElementById('detail-duty-type').value;
  var dutyLevel = document.getElementById('detail-duty-level').value;
  var dutyAmount = document.getElementById('detail-duty-amount').value.trim();
  var dutySurvey = document.getElementById('detail-duty-survey').value.trim();

  if (!dutyName) { App.toast('请填写责任人'); return; }

  // 更新差评状态
  c.responsible = dutyName;
  c.responsibleTitle = dutyType;
  c.status = '已处理';
  App.saveComplaints(complaints);

  // 自动生成处罚记录
  var stores = App.getStores();
  var store = stores.find(function(s) { return s.id === c.storeId; }) || {};
  var penalties = App.getPenalties();
  penalties.push({
    id: 'p' + Date.now(),
    storeId: c.storeId,
    store: c.store,
    region: store.region || '',
    district: store.district || '',
    manager: store.manager || '',
    eventDate: c.date,
    event: '差评：' + c.content.substring(0, 40),
    category: dutyType,
    level: dutyLevel,
    source: '线上差评',
    inspector: App.currentUser.name,
    personName: dutyName,
    personLevel: dutyLevel,
    personType: dutyType,
    penaltyPerson: dutyAmount,
    penaltyManager: '',
    survey: dutySurvey || '差评核查',
    suggestion: dutyLevel + (dutyAmount ? '，经济处罚' + dutyAmount + '元' : ''),
    policyRef: '差评处理流程',
    dutyPerson: dutyName,
    dutyManager: store.manager || '',
    dutyValue: dutyAmount,
    dutyCoach: '',
    status: '已闭环'
  });
  App.savePenalties(penalties);

  App.toast('已生成处罚记录');
  document.getElementById('modal-overlay').classList.remove('show');
  Pages.complaint();
};

Pages.submitAppeal = function(id) {
  const complaints = App.getComplaints();
  const c = complaints.find(x => x.id === id);
  if (c) {
    c.status = '申诉中';
    c.appealContent = document.getElementById('detail-appeal').value;
    App.saveComplaints(complaints);
  }
  App.toast('申诉已提交');
  document.getElementById('modal-overlay').classList.remove('show');
  Pages.complaint();
};

Pages.reviewAppeal = function(id, result) {
  const complaints = App.getComplaints();
  const c = complaints.find(x => x.id === id);
  if (c) {
    c.status = result === '通过' ? '已申诉' : '已驳回';
    c.appealResult = result;
    if (!c.appealContent) c.appealContent = document.getElementById('detail-appeal') ? document.getElementById('detail-appeal').value : '';
    App.saveComplaints(complaints);
  }
  App.toast('审核' + result);
  document.getElementById('modal-overlay').classList.remove('show');
  Pages.complaint();
};

/* ---- 领导看板页 ---- */
Pages.dashboardMode = Pages.dashboardMode || 'mtd';

Pages.dashboard = function() {
  const el = document.getElementById('page-dashboard');
  if (!el) return;
  const user = App.currentUser;

  if (!App.Permissions.canAccess(user.role, 'dashboard')) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128683;</div><div>当前角色无权限访问此页面</div></div>';
    return;
  }

  const today = '2026-08-01';
  const mode = Pages.dashboardMode;
  const isToday = mode === 'today';

  const stores = App.getStores();
  const allPenalties = App.getPenalties();
  const allComplaints = App.getComplaints();
  const allOffline = App.getOfflineRecords();

  const penalties = isToday ? allPenalties.filter(p => p.eventDate === today) : allPenalties;
  const complaints = isToday ? allComplaints.filter(c => c.date === today) : allComplaints;
  const offlineRecords = isToday ? allOffline.filter(r => r.date === today) : allOffline;

  const totalPenalties = penalties.length;
  const donePenalties = penalties.filter(p => p.status === '已闭环').length;
  const overduePenalties = penalties.filter(p => p.status === '超时').length;
  const pendingPenalties = totalPenalties - donePenalties - overduePenalties;
  const closeRate = totalPenalties > 0 ? Math.round(donePenalties / totalPenalties * 100) : 0;
  const totalStores = stores.length;
  const totalComplaints = complaints.length;
  const doneComplaints = complaints.filter(c => c.status !== '待申诉').length;
  const appealRate = totalComplaints > 0 ? Math.round(doneComplaints / totalComplaints * 100) : 0;

  // 门店得分排名
  const storeScores = {};
  offlineRecords.forEach(r => {
    if (!storeScores[r.store]) storeScores[r.store] = [];
    storeScores[r.store].push(r.score);
  });
  const ranking = Object.keys(storeScores).map(name => {
    const avg = Math.round(storeScores[name].reduce((a,b)=>a+b,0) / storeScores[name].length);
    return { name, avg };
  }).sort((a,b) => b.avg - a.avg);

  let html = '';

  // 今日/MTD 切换
  html += '<div class="db-toggle-bar">';
  html += '<button class="db-toggle-btn' + (mode==='today'?' active':'') + '" onclick="Pages.switchDashboard(\'today\')">今日</button>';
  html += '<button class="db-toggle-btn' + (mode==='mtd'?' active':'') + '" onclick="Pages.switchDashboard(\'mtd\')">全月 MTD</button>';
  html += '</div>';

  // KPI 卡片区
  html += '<div class="db-kpi-grid">';
  html += dbKpiCard('门店总数', totalStores, '家', '#6366f1', 'M12 20l-8-8-4 4');
  html += dbKpiCard('闭环率', closeRate, '%', '#10b981', 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z');
  html += dbKpiCard('申诉率', appealRate, '%', '#f59e0b', 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122');
  html += dbKpiCard('待处理', pendingPenalties + overduePenalties, '项', '#ef4444', 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z');
  html += '</div>';

  // 闭环率环形图
  html += '<div class="db-card-3d" onclick="showClosureDetail(\'' + mode + '\')">';
  html += '<div class="db-card-title" style="display:flex;justify-content:space-between">闭环追踪 <span style="font-size:10px;color:#6366f1">点击查看明细 \u203A</span></div>';
  html += '<div class="db-ring-wrap">';
  html += '<div class="db-ring" style="--p:' + closeRate + ';--c:#10b981">';
  html += '<div class="db-ring-inner"><span class="db-ring-val">' + closeRate + '%</span><span class="db-ring-sub">' + donePenalties + '/' + totalPenalties + '</span></div>';
  html += '</div></div>';
  html += '<div class="db-ring-legend"><span><i style="background:#10b981"></i>已闭环 ' + donePenalties + '</span><span><i style="background:#ef4444"></i>超时 ' + overduePenalties + '</span><span><i style="background:#f59e0b"></i>待补填 ' + pendingPenalties + '</span></div>';
  html += '</div>';

  // 门店排名柱状图
  html += '<div class="db-card-3d">';
  html += '<div class="db-card-title">门店得分 Top 5</div>';
  html += '<div class="db-bar-chart">';
  ranking.slice(0,5).forEach((item, i) => {
    const h = item.avg;
    const colors = [
      'linear-gradient(180deg, #6366f1, #818cf8)',
      'linear-gradient(180deg, #8b5cf6, #a78bfa)',
      'linear-gradient(180deg, #10b981, #34d399)',
      'linear-gradient(180deg, #f59e0b, #fbbf24)',
      'linear-gradient(180deg, #ec4899, #f472b6)'
    ];
    html += '<div class="db-bar-col"><div class="db-bar-val">' + item.avg + '</div><div class="db-bar" style="height:' + h + 'px;background:' + colors[i] + '"></div><div class="db-bar-label">' + item.name.slice(0,3) + '</div></div>';
  });
  html += '</div></div>';

  // 处罚 / 差评
  html += '<div class="db-card-3d">';
  html += '<div class="db-card-title">处罚 vs 差评</div>';
  html += '<div class="db-vs-row">';
  html += '<div class="db-vs-item" onclick="location.hash=\'#penalty\'" style="cursor:pointer;background:#fef2f2"><div class="db-vs-num" style="color:#ec4899">' + totalPenalties + '</div><div class="db-vs-label">处罚总数 \u203A</div></div>';
  html += '<div class="db-vs-item" onclick="location.hash=\'#complaint\'" style="cursor:pointer;background:#eef2ff"><div class="db-vs-num" style="color:#6366f1">' + totalComplaints + '</div><div class="db-vs-label">差评总数 \u203A</div></div>';
  html += '</div></div>';

  // 整改率
  html += '<div class="db-card-3d">';
  html += '<div class="db-card-title">整改率</div>';
  html += '<div class="db-gauge">';
  html += '<div class="db-gauge-fill" style="width:' + closeRate + '%"></div>';
  html += '<div class="db-gauge-label">' + closeRate + '%</div>';
  html += '</div></div>';

  // 门店排名表
  html += '<div class="db-card-3d">';
  html += '<div class="db-card-title">门店排名</div>';
  ranking.forEach((item, i) => {
    const medal = i===0?'\u{1F947}':i===1?'\u{1F948}':i===2?'\u{1F949}':'';
    html += '<div class="db-rank-row"><span class="db-rank-idx">' + (i+1) + '</span><span>' + medal + ' ' + item.name + '</span><span class="db-rank-score">' + item.avg + '</span></div>';
  });
  html += '</div>';

  el.innerHTML = html;
};

Pages.switchDashboard = function(mode) {
  Pages.dashboardMode = mode;
  Pages.dashboard();
};

function dbKpiCard(title, value, unit, color, iconPath) {
  return '<div class="db-kpi-card"><div class="db-kpi-icon" style="background:' + color + '20;color:' + color + '"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="' + iconPath + '"/></svg></div><div class="db-kpi-body"><div class="db-kpi-title">' + title + '</div><div class="db-kpi-val" style="color:' + color + '">' + value + '<small>' + unit + '</small></div></div></div>';
}

/* ---- 闭环追踪明细弹窗 ---- */
function showClosureDetail(mode) {
  var today = '2026-08-01';
  var allPenalties = App.getPenalties();
  var penalties = (mode === 'today') ? allPenalties.filter(function(p) { return p.eventDate === today; }) : allPenalties;
  var closed = penalties.filter(function(p) { return p.status === '已闭环'; });
  var overdue = penalties.filter(function(p) { return p.status === '超时'; });
  var pending = penalties.filter(function(p) { return p.status === '待补填'; });

  var html = '<div class="closure-overlay" onclick="this.remove()"><div class="closure-modal" onclick="event.stopPropagation()">';
  html += '<div class="closure-close" onclick="this.parentElement.parentElement.remove()">&times;</div>';
  html += '<div class="closure-title">闭环追踪明细</div>';

  function section(color, label, items) {
    var s = '<div class="closure-section"><div class="closure-section-hd" style="color:' + color + '"><span class="closure-dot" style="background:' + color + '"></span>' + label + '（' + items.length + '）</div>';
    if (!items.length) { s += '<div class="closure-empty">暂无</div>'; }
    else {
      items.forEach(function(p) {
        s += '<div class="closure-row" onclick="closeModalAndGo(\'#penalty\')"><span class="closure-store">' + p.store + '</span><span class="closure-event">' + p.event + '</span><span class="closure-date">' + (p.eventDate || '') + '</span></div>';
      });
    }
    s += '</div>';
    return s;
  }

  html += section('#10b981', '已闭环', closed);
  html += section('#ef4444', '超时', overdue);
  html += section('#f59e0b', '待补填', pending);
  html += '</div></div>';

  var div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div.firstElementChild);
}

function closeModalAndGo(hash) {
  var overlay = document.querySelector('.closure-overlay');
  if (overlay) overlay.remove();
  location.hash = hash;
}

/* ==================== 通知模板 ==================== */
Pages.template = function() {
  var container = document.getElementById('page-template');
  var templates = App.dataCache.notices || [];
  var html = '<div class="template-page">';

  // 头部统计
  html += '<div class="stats-row">';
  html += '<div class="stat-item"><span class="stat-num">' + templates.length + '</span><span class="stat-label">模板总数</span></div>';
  html += '</div>';

  // 操作栏
  html += '<div class="action-bar">';
  html += '<button class="btn btn-primary" onclick="Pages._templateForm()">+ 新建模板</button>';
  html += '</div>';

  // 模板列表
  if (templates.length === 0) {
    html += '<div class="empty-state">暂无通知模板，点击上方按钮创建</div>';
  } else {
    html += '<div class="template-list">';
    templates.forEach(function(t, i) {
      var typeLabel = t.type === 'penalty' ? '处罚通知' : t.type === 'inspect' ? '检查通知' : t.type === 'complaint' ? '申诉通知' : '通用通知';
      var typeColor = t.type === 'penalty' ? '#ef4444' : t.type === 'inspect' ? '#3b82f6' : t.type === 'complaint' ? '#f59e0b' : '#6b7280';
      html += '<div class="template-card">';
      html += '<div class="template-head">';
      html += '<span class="template-name">' + (t.name || '未命名') + '</span>';
      html += '<span class="template-type" style="background:' + typeColor + '">' + typeLabel + '</span>';
      html += '</div>';
      html += '<div class="template-preview">' + (t.content || '').replace(/\{(\w+)\}/g, '<em>{$1}</em>') + '</div>';
      html += '<div class="template-actions">';
      html += '<button class="btn btn-sm" onclick="Pages._templateForm(' + i + ')">编辑</button>';
      html += '<button class="btn btn-sm btn-danger" onclick="Pages._templateDelete(' + i + ')">删除</button>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
};

Pages._templateForm = function(index) {
  var templates = App.dataCache.notices || [];
  var t = (index !== undefined && index >= 0) ? templates[index] : null;
  var isEdit = !!t;
  var title = isEdit ? '编辑模板' : '新建模板';

  var html = '<div class="modal-overlay" onclick="this.remove()"><div class="modal-box" onclick="event.stopPropagation()">';
  html += '<div class="modal-header"><h3>' + title + '</h3><span class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">&times;</span></div>';
  html += '<div class="modal-body">';

  // 模板名称
  html += '<div class="form-group"><label>模板名称</label>';
  html += '<input type="text" id="tpl-name" class="form-input" value="' + (t ? t.name || '' : '') + '" placeholder="如：处罚通知-门店"></div>';

  // 类型选择
  html += '<div class="form-group"><label>适用场景</label>';
  html += '<select id="tpl-type" class="form-input">';
  var types = [
    { v: 'penalty', l: '处罚通知' },
    { v: 'inspect', l: '检查通知' },
    { v: 'complaint', l: '申诉通知' },
    { v: 'general', l: '通用通知' }
  ];
  types.forEach(function(ty) {
    var sel = (t && t.type === ty.v) ? ' selected' : '';
    html += '<option value="' + ty.v + '"' + sel + '>' + ty.l + '</option>';
  });
  html += '</select></div>';

  // 模板内容
  html += '<div class="form-group"><label>模板内容 <span class="hint">可用变量：{门店名称} {日期} {检查人} {扣分项} {处罚金额} {申诉内容}</span></label>';
  html += '<textarea id="tpl-content" class="form-input" rows="8" placeholder="如：{门店名称} 于 {日期} 被检查发现 {扣分项}，处罚 {处罚金额} 元...">' + (t ? t.content || '' : '') + '</textarea></div>';

  // 预览
  html += '<div class="form-group"><label>变量说明</label>';
  html += '<div class="var-hints">';
  html += '<code>{门店名称}</code><code>{日期}</code><code>{检查人}</code><code>{扣分项}</code>';
  html += '<code>{处罚金额}</code><code>{申诉内容}</code><code>{检查得分}</code><code>{整改期限}</code>';
  html += '</div></div>';

  html += '</div>';
  html += '<div class="modal-footer">';
  html += '<button class="btn" onclick="this.closest(\'.modal-overlay\').remove()">取消</button>';
  html += '<button class="btn btn-primary" onclick="Pages._templateSave(' + (isEdit ? index : -1) + ')">保存</button>';
  html += '</div>';
  html += '</div></div>';

  var div = document.createElement('div');
  div.innerHTML = html;
  var overlay = div.firstElementChild;
  document.body.appendChild(overlay);
  overlay.offsetHeight;
  overlay.classList.add('show');
};

Pages._templateSave = function(index) {
  var name = (document.getElementById('tpl-name') || {}).value || '';
  var type = (document.getElementById('tpl-type') || {}).value || 'general';
  var content = (document.getElementById('tpl-content') || {}).value || '';

  if (!name.trim()) return App.toast('请输入模板名称');
  if (!content.trim()) return App.toast('请输入模板内容');

  var templates = App.dataCache.notices || [];
  var tpl = { name: name.trim(), type: type, content: content.trim() };

  if (index >= 0) {
    templates[index] = tpl;
  } else {
    templates.push(tpl);
  }

  App.dataCache.notices = templates;
  localStorage.setItem('nanchengxiang_notices', JSON.stringify(templates));
  App.toast(index >= 0 ? '模板已更新' : '模板已创建');

  var overlay = document.querySelector('.modal-overlay');
  if (overlay) overlay.remove();
  Pages.template();
};

Pages._templateDelete = function(index) {
  if (!confirm('确定删除该模板？')) return;
  var templates = App.dataCache.notices || [];
  templates.splice(index, 1);
  App.dataCache.notices = templates;
  localStorage.setItem('nanchengxiang_notices', JSON.stringify(templates));
  App.toast('模板已删除');
  Pages.template();
};

/* ==================== 任务发布 ==================== */
Pages.task = function() {
  var el = document.getElementById('page-task');
  if (!el) return;
  el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128203;</div><div>建设中</div></div>';
};

/* ==================== 稽核员日报 ==================== */
Pages._dailyMode = 'fill'; // 'fill' | 'board'

Pages.daily = function() {
  var el = document.getElementById('page-daily');
  if (!el) return;
  var user = App.currentUser;
  var stores = App.getStores();
  var reports = App.getDailyReports();
  var mode = Pages._dailyMode;
  var now = new Date();
  var today = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');

  var html = '';

  if (!App.Permissions.canAccess(user.role, 'daily')) {
    html += '<div class="empty-state"><div class="empty-icon">&#128683;</div><div>当前角色无权限访问此页面</div></div>';
    el.innerHTML = html;
    return;
  }

  // 模式切换
  html += '<div class="daily-mode-bar">';
  html += '<button class="daily-mode-btn' + (mode==='fill'?' active':'') + '" onclick="Pages._switchDaily(\'fill\')">填写日报</button>';
  html += '<button class="daily-mode-btn' + (mode==='board'?' active':'') + '" onclick="Pages._switchDaily(\'board\')">日报看板</button>';
  html += '</div>';

  if (mode === 'fill') {
    // ===== 填写日报 =====
    html += '<div class="card">';
    html += '<div class="card-title">稽核员日报</div>';

    html += '<div class="daily-meta">';
    html += '<span>稽核员：<b>' + user.name + '</b></span>';
    html += '<span>日期：<b>' + today + '</b></span>';
    html += '</div>';

    html += '<div class="form-group"><label class="form-label">稽核类型</label>';
    html += '<div class="daily-type-radios">';
    html += '<label class="radio-label"><input type="radio" name="daily-type" value="online" checked onchange="Pages._dailyTypeChange()"> 线上稽核</label>';
    html += '<label class="radio-label"><input type="radio" name="daily-type" value="offline" onchange="Pages._dailyTypeChange()"> 线下稽核</label>';
    html += '</div></div>';

    html += '<div id="daily-items-container">';
    html += Pages._dailyRow(1);
    html += '</div>';

    html += '<button class="daily-add-btn" id="daily-add-btn" onclick="Pages._dailyAddRow()">+ 添加门店</button>';
    html += '<button class="btn btn-primary" style="margin-top:12px" onclick="Pages.submitDaily()">提交日报</button>';
    html += '</div>';

    // 已提交列表
    var userReports = reports.filter(function(r) { return r.inspector === user.name; }).reverse();
    html += '<div class="card"><div class="card-title">已提交日报（' + userReports.length + '）</div>';
    if (userReports.length === 0) {
      html += '<div class="empty-state"><div class="empty-icon">&#128196;</div>暂无日报</div>';
    } else {
      userReports.forEach(function(r) {
        var typeLabel = r.type === 'online' ? '线上' : '线下';
        html += '<div class="list-item" onclick="Pages._toggleDailyDetail(\'' + r.id + '\')">';
        html += '<div class="li-main">';
        html += '<div class="li-title">' + r.date + ' | ' + typeLabel + '稽核 | ' + (r.items||[]).length + '家门店</div>';
        html += '<div class="li-sub">稽核员：' + r.inspector + '</div>';
        html += '</div></div>';
        html += '<div id="daily-detail-' + r.id + '" class="daily-detail" style="display:none">';
        (r.items||[]).forEach(function(item) {
          html += '<div class="daily-detail-row"><span class="ddr-store">' + item.store + '</span><span class="ddr-score">' + item.score + '分</span><span class="ddr-findings">' + (item.findings||'无') + '</span></div>';
        });
        html += '</div>';
      });
    }
    html += '</div>';

  } else {
    // ===== 日报看板 =====
    html += Pages._renderDailyBoard(reports, stores);
  }

  el.innerHTML = html;
  App.initStoreSelect('daily-store-1', App.getStores());
};

Pages._switchDaily = function(mode) {
  Pages._dailyMode = mode;
  Pages.daily();
};

Pages._dailyRow = function(index) {
  var stores = App.getStores();
  var html = '<div class="daily-row" id="daily-row-' + index + '">';
  html += App.renderStoreSelect('daily-store-' + index, stores, '', '搜索门店...');
  html += '<input type="number" class="form-input daily-score" id="daily-score-' + index + '" placeholder="得分" min="0" max="100">';
  html += '<input type="text" class="form-input daily-findings" id="daily-findings-' + index + '" placeholder="发现问题">';
  if (index > 1) {
    html += '<button class="daily-del-btn" onclick="Pages._dailyRemoveRow(' + index + ')">&#10005;</button>';
  }
  html += '</div>';
  return html;
};

Pages._dailyTypeChange = function() {
  var type = document.querySelector('input[name="daily-type"]:checked').value;
  var max = type === 'online' ? 8 : 5;
  var currentRows = document.querySelectorAll('.daily-row').length;
  var btn = document.getElementById('daily-add-btn');
  if (btn) btn.disabled = currentRows >= max;
};

Pages._dailyAddRow = function() {
  var type = document.querySelector('input[name="daily-type"]:checked').value;
  var max = type === 'online' ? 8 : 5;
  var rows = document.querySelectorAll('.daily-row');
  if (rows.length >= max) return;
  var nextIndex = rows.length + 1;
  var html = Pages._dailyRow(nextIndex);
  var container = document.getElementById('daily-items-container');
  var div = document.createElement('div');
  div.innerHTML = html;
  container.appendChild(div.firstElementChild);
  App.initStoreSelect('daily-store-' + nextIndex, App.getStores());
  if (rows.length + 1 >= max) {
    document.getElementById('daily-add-btn').disabled = true;
  }
};

Pages._dailyRemoveRow = function(index) {
  var row = document.getElementById('daily-row-' + index);
  if (row) row.remove();
  var type = document.querySelector('input[name="daily-type"]:checked').value;
  var max = type === 'online' ? 8 : 5;
  var currentRows = document.querySelectorAll('.daily-row').length;
  var btn = document.getElementById('daily-add-btn');
  if (btn) btn.disabled = currentRows >= max;
};

Pages.submitDaily = function() {
  var user = App.currentUser;
  var typeEl = document.querySelector('input[name="daily-type"]:checked');
  var type = typeEl ? typeEl.value : 'online';
  var now = new Date();
  var date = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');

  var items = [];
  var rows = document.querySelectorAll('.daily-row');
  for (var i = 0; i < rows.length; i++) {
    var idx = i + 1;
    var storeId = App.getStoreSelectValue('daily-store-' + idx);
    var storeData = App.getStores().find(function(s) { return s.id === storeId; });
    var store = storeData ? storeData.name : '';
    var scoreEl = document.getElementById('daily-score-' + idx);
    var findingsEl = document.getElementById('daily-findings-' + idx);
    var score = scoreEl ? parseInt(scoreEl.value) : NaN;
    var findings = findingsEl ? findingsEl.value.trim() : '';
    if (!store) { App.toast('第' + idx + '行请选择门店'); return; }
    if (isNaN(score) || score < 0 || score > 100) { App.toast('第' + idx + '行得分需在0-100之间'); return; }
    items.push({ store: store, score: score, findings: findings });
  }

  if (items.length === 0) { App.toast('请至少添加一条门店记录'); return; }

  var reports = App.getDailyReports();
  reports.push({
    id: 'dr' + Date.now(),
    inspector: user.name,
    date: date,
    type: type,
    items: items
  });

  App.saveDailyReports(reports);
  App.toast('日报已提交');
  Pages.daily();
};

Pages._toggleDailyDetail = function(id) {
  var el = document.getElementById('daily-detail-' + id);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }
};

/* ===== 日报看板渲染 ===== */
Pages._dailyBoardPeriod = 'all'; // 'week' | 'month' | 'all'

Pages._renderDailyBoard = function(reports, stores) {
  var html = '';
  var now = new Date();

  // 时间筛选
  html += '<div class="db-toggle-bar">';
  html += '<button class="db-toggle-btn' + (Pages._dailyBoardPeriod==='week'?' active':'') + '" onclick="Pages._switchBoardPeriod(\'week\')">本周</button>';
  html += '<button class="db-toggle-btn' + (Pages._dailyBoardPeriod==='month'?' active':'') + '" onclick="Pages._switchBoardPeriod(\'month\')">本月</button>';
  html += '<button class="db-toggle-btn' + (Pages._dailyBoardPeriod==='all'?' active':'') + '" onclick="Pages._switchBoardPeriod(\'all\')">全部</button>';
  html += '</div>';

  // 按period过滤
  var filtered = reports;
  if (Pages._dailyBoardPeriod === 'week') {
    var weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0,0,0,0);
    filtered = reports.filter(function(r) { return new Date(r.date) >= weekStart; });
  } else if (Pages._dailyBoardPeriod === 'month') {
    var monthStart = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-01';
    filtered = reports.filter(function(r) { return r.date >= monthStart; });
  }

  // 按稽核员分组
  var groups = {};
  filtered.forEach(function(r) {
    if (!groups[r.inspector]) groups[r.inspector] = [];
    groups[r.inspector].push(r);
  });

  var inspectorNames = Object.keys(groups).sort();
  if (inspectorNames.length === 0) {
    html += '<div class="empty-state"><div class="empty-icon">&#128202;</div>暂无日报数据</div>';
    return html;
  }

  inspectorNames.forEach(function(name) {
    var grp = groups[name];
    var totalShops = 0;
    grp.forEach(function(r) { totalShops += (r.items||[]).length; });

    html += '<div class="board-inspector-card" onclick="Pages._toggleBoardDetail(\'' + name.replace(/'/g, "\\'") + '\')">';
    html += '<div class="bic-header">';
    html += '<div class="bic-avatar">' + (name||'?')[0] + '</div>';
    html += '<div class="bic-info">';
    html += '<div class="bic-name">' + name + '</div>';
    html += '<div class="bic-stats">日报 ' + grp.length + ' 份 | 累计检查 ' + totalShops + ' 家门店</div>';
    html += '</div><div class="bic-arrow">&#9660;</div>';
    html += '</div>';

    html += '<div class="board-detail-table" id="board-detail-' + name.replace(/'/g, "\\'") + '" style="display:none">';
    html += '<table class="m-table">';
    html += '<thead><tr><th>日期</th><th>类型</th><th>门店</th><th>得分</th><th>发现问题</th></tr></thead>';
    html += '<tbody>';
    grp.forEach(function(r) {
      var typeLabel = r.type === 'online' ? '线上' : '线下';
      (r.items||[]).forEach(function(item) {
        html += '<tr><td>' + r.date + '</td><td>' + typeLabel + '</td><td>' + item.store + '</td><td>' + item.score + '</td><td>' + (item.findings||'') + '</td></tr>';
      });
    });
    html += '</tbody></table></div></div>';
  });

  return html;
};

Pages._switchBoardPeriod = function(period) {
  Pages._dailyBoardPeriod = period;
  Pages.daily();
};

Pages._toggleBoardDetail = function(name) {
  var el = document.getElementById('board-detail-' + name);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }
};
