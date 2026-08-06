(() => {
  "use strict";

  const STORAGE_KEY = "netwater-ehs-data-v1";
  const LEGACY_DEMO_STORAGE_KEY = "halo-ehs-demo-data-v1";
  const NAMEBOOK_STORAGE_KEY = "netwater-ehs-person-namebook-v1";

  const seedData = {
    tools: [],
    energy: [],
    certificates: [],
    waste: [],
    chemicals: [],
    inspections: []
  };

  // 手持式电动工具标准检查项(来自方太 FT[通用]OT-ZD 317-04b 检查记录表)。
  // 原表把检查责任人签字、检查结论和修复情况作为独立行处理，下面只登记
  // 有“检查项目名称/检查要求”两列的六个检查项目，避免把原表行合并成一行。
  const INSPECTION_ITEMS = [
    { key: "appearance_mark", group: "外观检查", name: "标志检查", standard: "有认证标志、产品合格证或检查合格标志" },
    { key: "appearance_shell", group: "外观检查", name: "外壳、手柄、按键检查", standard: "完好无损" },
    { key: "appearance_guard", group: "外观检查", name: "机械防护装置检查", standard: "完好" },
    { key: "appearance_rotation", group: "外观检查", name: "工具转动部分", standard: "转动灵活、轻快，无阻滞现象" },
    { key: "pro_cable", group: "专业检查", name: "电源插头、开关、电源线、保护接地线（PE）、电气保护装置检查", standard: "完好无缺损，连接正确（每半年）" },
    { key: "pro_insulation", group: "专业检查", name: "绝缘电阻测量", standard: "Ⅰ类：≥2MΩ\nⅡ类：≥7MΩ" }
  ];

  const moduleConfigs = {
    tools: {
      title: "手持电动工具",
      eyebrow: "Equipment Safety",
      description: "按照 FT[通用]OT-ZD 317-03b 维护手持式电动工具台账。",
      icon: "ph-wrench",
      primary: ["code", "name"],
      columns: [
        ["code", "编 号"], ["name", "名 称"], ["model", "型 号"], ["dept", "使用部门"], ["owner", "责任人"], ["received", "领用时间"], ["scrapped", "报废时间"], ["category", "工具类别"]
      ],
      fields: [
        ["code", "编号", "text", "请输入工具编号"], ["name", "名称", "text", "请输入工具名称"], ["model", "型号", "text", "请输入规格/型号"], ["dept", "使用部门", "text", "请输入使用部门"], ["owner", "责任人", "text", "请输入责任人"], ["received", "领用时间", "date"], ["scrapped", "报废时间", "date"], ["category", "工具类别", "text", "请输入工具类别"]
      ],
      stats(rows) {
        const active = rows.filter(row => !row.scrapped).length;
        const scrapped = rows.filter(row => Boolean(row.scrapped)).length;
        return [["工具总数", rows.length, "ph-toolbox", "台账中登记的工具"], ["在用工具", active, "ph-check-circle", "尚未填写报废时间"], ["已报废", scrapped, "ph-archive", "已填写报废时间"]];
      }
    },
    energy: {
      title: "能源数据",
      eyebrow: "Energy Intelligence",
      description: "集中记录水、电、气等能源读数与月度变化。",
      icon: "ph-lightning",
      primary: ["meter", "area"],
      columns: [["meter", "计量点"], ["type", "能源类型"], ["area", "区域"], ["period", "统计周期"], ["value", "本期用量"], ["compare", "环比"], ["status", "状态"]],
      fields: [["meter", "计量点名称", "text", "请输入计量点名称"], ["type", "能源类型", "select", ["用电", "用水", "天然气", "蒸汽"]], ["area", "所属区域", "text", "请输入所属区域"], ["period", "统计周期", "month"], ["value", "本期用量", "number", "请输入数值"], ["unit", "计量单位", "text", "请输入计量单位"], ["compare", "环比变化", "text", "请输入环比变化"], ["status", "数据状态", "select", ["已抄表", "需复核"]]],
      stats(rows) { return [["计量点", rows.length, "ph-gauge", "本月已纳入统计"], ["已完成抄表", count(rows, "status", "已抄表"), "ph-check-circle", "数据已经确认"], ["需要复核", count(rows, "status", "需复核"), "ph-magnifying-glass", "存在异常波动"]]; }
    },
    certificates: {
      title: "人员证件",
      eyebrow: "Workforce Compliance",
      description: "管理健康证、叉车证、电工证和驾驶证有效期。",
      icon: "ph-identification-card",
      primary: ["person", "employee"],
      columns: [["person", "人员"], ["type", "证件类型"], ["number", "证件编号"], ["dept", "所属部门"], ["expiry", "有效期至"], ["status", "状态"]],
      fields: [["person", "人员姓名", "person", "请输入姓名"], ["employee", "员工编号", "text", "请输入员工编号"], ["type", "证件类型", "select", ["健康证", "叉车证", "电工证", "驾驶证"]], ["number", "证件编号", "text", "请输入证件编号"], ["dept", "所属部门", "text", "请输入部门"], ["expiry", "有效期至", "date"], ["status", "证件状态", "select", ["有效", "即将到期", "已过期"]]],
      stats(rows) { return [["证件总数", rows.length, "ph-cards", "四类人员证件"], ["即将到期", count(rows, "status", "即将到期"), "ph-clock-countdown", "建议提前办理复审"], ["已经过期", count(rows, "status", "已过期"), "ph-warning-octagon", "需要立即处理"]]; }
    },
    waste: {
      title: "危废存量",
      eyebrow: "Hazardous Waste",
      description: "跟踪危险废物种类、库位、库存与处置状态。",
      icon: "ph-recycle",
      primary: ["name", "category"],
      columns: [["name", "危废名称"], ["code", "废物类别"], ["location", "存放位置"], ["quantity", "当前存量"], ["capacity", "库容占比"], ["updated", "最近更新"], ["status", "状态"]],
      fields: [["name", "危废名称", "text", "请输入危废名称"], ["code", "废物类别", "text", "请输入废物类别"], ["category", "废物代码", "text", "请输入废物代码"], ["location", "存放位置", "text", "请输入存放位置"], ["quantity", "当前存量", "number", "请输入数值"], ["unit", "单位", "select", ["吨", "千克", "桶"]], ["capacity", "库容占比", "text", "请输入库容占比"], ["updated", "更新日期", "date"], ["status", "当前状态", "select", ["正常", "接近上限", "待处置"]]],
      stats(rows) { return [["危废种类", rows.length, "ph-recycle", "当前在库类别"], ["库存总量", `${sum(rows, "quantity").toFixed(2)} 吨`, "ph-scales", "按当前台账汇总"], ["库存预警", count(rows, "status", "接近上限"), "ph-warning", "库容超过预警阈值"]]; }
    },
    chemicals: {
      title: "化学品管理",
      eyebrow: "Chemical Safety",
      description: "维护化学品台账、SDS 信息、库存及储存位置。",
      icon: "ph-flask",
      primary: ["name", "cas"],
      columns: [["name", "化学品"], ["category", "危险类别"], ["location", "存放位置"], ["quantity", "库存数量"], ["sds", "SDS 更新日期"], ["status", "状态"]],
      fields: [["name", "化学品名称", "text", "请输入名称"], ["cas", "CAS 编号", "text", "请输入 CAS 编号"], ["category", "危险类别", "text", "请输入危险类别"], ["location", "存放位置", "text", "请输入存放位置"], ["quantity", "库存数量", "number", "请输入数值"], ["unit", "单位", "select", ["L", "kg", "桶"]], ["sds", "SDS 更新日期", "date"], ["status", "库存状态", "select", ["在库", "低库存", "待复核"]]],
      stats(rows) { return [["化学品种类", rows.length, "ph-flask", "当前登记品种"], ["SDS 覆盖率", `${rows.length ? Math.round(rows.filter(row => row.sds).length / rows.length * 100) : 0}%`, "ph-file-text", "已建立 SDS 档案"], ["需要关注", rows.filter(r => r.status !== "在库").length, "ph-warning", "低库存或待复核"]]; }
    },
    inspections: {
      title: "工具巡检",
      eyebrow: "Equipment Inspection",
      description: "依据标准检查项记录手持电动工具的领用与周期巡检结果。",
      icon: "ph-clipboard-text",
      primary: ["toolRef", "inspector"],
      columns: [["toolRef", "工具编号"], ["toolName", "工具名称"], ["dept", "工厂/部门"], ["period", "检查周期"], ["date", "检查日期"], ["inspector", "检查责任人"], ["conclusion", "检查结论"]],
      fields: [
        ["toolName", "工具名称", "text", "请输入工具名称"], ["dept", "工厂/部门", "text", "请输入工厂或部门"], ["toolRef", "工具编号", "text", "请输入被检工具的编号"],
        ["manufacturer", "制造单位", "text", "请输入制造单位"], ["model", "规格/型号", "text", "请输入规格或型号"], ["serialNo", "出厂编号", "text", "请输入出厂编号"], ["mfgDate", "制造日期", "date"],
        ["manageDept", "管理部门", "text", "请输入管理部门"], ["category", "工具类别", "text", "类"], ["period", "检查周期", "text", "6个月"],
        ["inspector", "检查责任人", "text", "请输入检查责任人"], ["date", "检查日期", "date"],
        ["", "外观检查", "heading"],
        ...INSPECTION_ITEMS.filter(item => item.group === "外观检查").map(item => [item.key, item.name, "select", ["合格", "不合格", "未检"]]),
        ["", "专业检查", "heading"],
        ...INSPECTION_ITEMS.filter(item => item.group === "专业检查").map(item => [item.key, item.name, "select", ["合格", "不合格", "未检"]]),
        ["conclusion", "检查结论", "select", ["良好", "需修复", "需报废"]]
      ],
      stats(rows) {
        const completed = rows.filter(r => r.inspector && r.date).length;
        const pending = rows.length - completed;
        const passRate = rows.length ? Math.round(rows.filter(r => r.conclusion === "良好").length / rows.length * 100) : 0;
        return [["巡检次数", rows.length, "ph-clipboard-text", "已建立的检查记录"], ["已完成", completed, "ph-check-circle", "已填写检查责任人和日期"], ["待补录", pending, "ph-warning", "仍需补充表内信息"]];
      }
    }
  };

  // 可打印的方太原表模板:声明每个业务模块对应哪张原表。
  // 只有在此配置的模块,详情抽屉才会显示「打印」按钮。
  const printTemplates = {
    tools: { title: "手持式电动工具台帐", code: "FT[通用]OT-ZD 317-03b", landscape: true, render: renderToolsLedger },
    inspections: { title: "手持式电动工具检查记录表", code: "FT[通用]OT-ZD 317-04b", landscape: false, render: renderInspectionSheet }
  };

  // 支持「方太原表当输入界面」的模块:进入模块直接看到台账表版式,在格子里填写,填完折叠成卡片。
  const FORM_MODULES = {
    tools: {
      layout: "ledger",
      title: "手持式电动工具台帐",
      code: "FT[通用]OT-ZD 317-03b",
      company: "宁波方太厨具有限公司",
      sheetColumns: [
        { key: "no", label: "序号", width: "5%", readonly: true },
        { key: "code", label: "编 号", width: "10%" },
        { key: "name", label: "名 称", width: "12%" },
        { key: "model", label: "型 号", width: "14%" },
        { key: "dept", label: "使用部门", width: "13%" },
        { key: "owner", label: "责任人", width: "9%" },
        { key: "received", label: "领用时间", width: "11%", type: "date" },
        { key: "scrapped", label: "报废时间", width: "12%", type: "date" },
        { key: "category", label: "工具类别", width: "9%" }
      ],
      cardSummary: ["name", "code", "owner", "dept"],
      // 台账原表只有这 9 列(含序号)，不再附加“最近检查/下次检查/状态”等虚拟字段。
      extraFields: []
    },
    inspections: {
      layout: "inspection",
      title: "手持式电动工具检查记录表",
      code: "FT[通用]OT-ZD 317-04b",
      company: "宁波方太厨具有限公司",
      // 抬头区的键值对字段(工具名称/编号/部门/检查人/检查日期/检查周期)
      headerFields: [
        { key: "toolName", label: "工具名称", width: "30%" },
        { key: "dept", label: "工厂/部门", width: "30%" },
        { key: "toolRef", label: "工具编号", width: "30%" },
        { key: "manufacturer", label: "制造单位", width: "30%", optional: true },
        { key: "model", label: "规格/型号", width: "20%" },
        { key: "serialNo", label: "出厂编号", width: "20%", optional: true },
        { key: "mfgDate", label: "制造日期", width: "20%", type: "date", optional: true },
        { key: "dept", label: "管理部门", width: "20%" },
        { key: "category", label: "工具类别", width: "15%", preset: "类" },
        { key: "period", label: "检查周期", width: "15%", preset: "6个月" }
      ],
      cardSummary: ["toolRef", "toolName", "inspector", "date"]
    }
  };

  // 把一条工具记录填进台账表(317-03b)版式:仅填第 1 行,其余 15 行留空,忠于原表。
  function renderToolsLedger(record) {
    const rows = Array.from({ length: 16 }, (_, index) => {
      if (index > 0) return `<tr>${Array.from({ length: 9 }, () => '<td class="print-table__cell"></td>').join("")}</tr>`;
      const cells = [
        "1", record.code || "", record.name || "", record.model || "", record.dept || "",
        record.owner || "", formatDateValue(record.received, "date"), formatDateValue(record.scrapped, "date"), record.category || ""
      ];
      return `<tr>${cells.map(value => `<td class="print-table__cell print-table__cell--filled">${escapeHtml(value)}</td>`).join("")}</tr>`;
    }).join("");
    return `
      <section class="print-sheet print-sheet--landscape">
        <header class="print-sheet__title">
          <p>宁波方太厨具有限公司</p>
          <h1>手持式电动工具台帐</h1>
          <p class="print-sheet__code">FT[通用]OT-ZD 317-03b</p>
        </header>
        <table class="print-table">
          <colgroup><col style="width:6%"><col style="width:10%"><col style="width:11%"><col style="width:15%"><col style="width:14%"><col style="width:9%"><col style="width:10%"><col style="width:12%"><col style="width:9%"></colgroup>
          <thead><tr>${["序号", "编 号", "名 称", "型 号", "使用部门", "责任人", "领用时间", "报废时间", "工具类别"].map(text => `<th class="print-table__head">${text}</th>`).join("")}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`;
  }

  // 把一条巡检记录填进检查记录表(317-04b)版式。
  function renderInspectionSheet(record) {
    const appearanceItems = INSPECTION_ITEMS.filter(item => item.group === "外观检查");
    const proItems = INSPECTION_ITEMS.filter(item => item.group === "专业检查");
    const v = key => escapeHtml(record?.[key] ?? "");
    const text = value => escapeHtml(value ?? "").replace(/\n/g, "<br>");
    const groupText = group => group === "外观检查" ? "外观<br>检查" : escapeHtml(group);
    const slot = (key, colspan = 1) => `<td class="print-table__cell print-table__cell--filled"${colspan > 1 ? ` colspan="${colspan}"` : ""}>${v(key)}</td>`;

    // 原表 14 列:序号 | 检查项目名称(含分组列) | 检查要求 | 领用检查 | 4 个半年度填写位。
    const checkRow = (item, no) => `<tr>
      <td class="print-table__cell print-table__cell--center">${no}</td>
      <td class="print-table__cell print-table__cell--group">${groupText(item.group)}</td>
      <td class="print-table__cell" colspan="2">${text(item.name)}</td>
      <td class="print-table__cell" colspan="2">${text(item.standard)}</td>
      ${slot(`${item.key}__use`, 2)}
      ${slot(`${item.key}__h1`, 2)}
      ${slot(`${item.key}__h2`)}
      ${slot(`${item.key}__h3`, 2)}
      ${slot(`${item.key}__h4`)}
    </tr>`;
    const signRow = (no, label, group = "专业检查") => `<tr>
      <td class="print-table__cell print-table__cell--center">${no}</td>
      <td class="print-table__cell print-table__cell--group">${groupText(group)}</td>
      <td class="print-table__cell" colspan="4">${text(label)}</td>
      ${slot(`${label === "检查责任人签字" && no === "6" ? "appearance_sign" : label.startsWith("不合格项目") ? "repair" : "pro_sign"}__use`, 2)}
      ${slot(`${label === "检查责任人签字" && no === "6" ? "appearance_sign" : label.startsWith("不合格项目") ? "repair" : "pro_sign"}__h1`, 2)}
      ${slot(`${label === "检查责任人签字" && no === "6" ? "appearance_sign" : label.startsWith("不合格项目") ? "repair" : "pro_sign"}__h2`)}
      ${slot(`${label === "检查责任人签字" && no === "6" ? "appearance_sign" : label.startsWith("不合格项目") ? "repair" : "pro_sign"}__h3`, 2)}
      ${slot(`${label === "检查责任人签字" && no === "6" ? "appearance_sign" : label.startsWith("不合格项目") ? "repair" : "pro_sign"}__h4`)}
    </tr>`;
    const conclusionRow = `<tr>
      <td class="print-table__cell print-table__cell--center">7</td>
      <td class="print-table__cell print-table__cell--group">${groupText("专业检查")}</td>
      <td class="print-table__cell" colspan="4">检查结论（良好/需修复/需报废）</td>
      ${slot("conclusion__use", 2)}${slot("conclusion__h1", 2)}${slot("conclusion__h2")}${slot("conclusion__h3", 2)}${slot("conclusion__h4")}
    </tr>`;

    const bodyRows = [
      checkRow(appearanceItems[0], "1"),
      checkRow(appearanceItems[1], "2"),
      checkRow(appearanceItems[2], "3"),
      checkRow(appearanceItems[3], "4"),
      signRow("6", "检查责任人签字", "外观检查"),
      checkRow(proItems[0], "5"),
      checkRow(proItems[1], "6"),
      conclusionRow,
      signRow("8", "不合格项目修复（是/否），没有不填。"),
      signRow("9", "检查责任人签字")
    ].join("");
    const mfgDate = formatDateValue(record?.mfgDate, "date") || "年   月   日";
    const inspectionDate = formatDateValue(record?.date, "date") || "年   月   日";

    return `
      <section class="print-sheet">
        <header class="print-sheet__title">
          <p>宁波方太厨具有限公司</p>
          <h1>手持式电动工具检查记录表</h1>
          <p class="print-sheet__code">FT[通用]OT-ZD 317-04b</p>
        </header>
        <table class="print-table">
          <colgroup><col style="width:5.32%"><col style="width:6.38%"><col style="width:1.63%"><col style="width:14.32%"><col style="width:3.91%"><col style="width:12.05%"><col style="width:2.54%"><col style="width:8.78%"><col style="width:6.76%"><col style="width:4.56%"><col style="width:11.32%"><col style="width:.4%"><col style="width:10.93%"><col style="width:11.11%"></colgroup>
          <tbody>
            <tr>
              <td class="print-table__label" colspan="3">工具名称</td>
              <td class="print-table__cell print-table__cell--filled" colspan="4">${v("toolName")}</td>
              <td class="print-table__label" colspan="2">工厂/部门</td>
              <td class="print-table__cell print-table__cell--filled" colspan="5">${v("dept")}</td>
            </tr>
            <tr>
              <td class="print-table__label" colspan="3">工具编号</td>
              <td class="print-table__cell print-table__cell--filled" colspan="4">${v("toolRef")}</td>
              <td class="print-table__label" colspan="2">制造单位</td>
              <td class="print-table__cell print-table__cell--filled" colspan="5">${v("manufacturer")}</td>
            </tr>
            <tr>
              <td class="print-table__label" colspan="3">规格/型号</td>
              <td class="print-table__cell print-table__cell--filled" colspan="2">${v("model")}</td>
              <td class="print-table__label" colspan="2">出厂编号</td>
              <td class="print-table__cell print-table__cell--filled" colspan="2">${v("serialNo")}</td>
              <td class="print-table__label" colspan="3">制造日期</td>
              <td class="print-table__cell print-table__cell--filled" colspan="2">${text(mfgDate)}</td>
            </tr>
            <tr>
              <td class="print-table__label" colspan="3">管理部门</td>
              <td class="print-table__cell print-table__cell--filled" colspan="2">${v("manageDept")}</td>
              <td class="print-table__label" colspan="2">工具类别</td>
              <td class="print-table__cell print-table__cell--filled print-table__cell--center" colspan="2">${v("category") || "类"}</td>
              <td class="print-table__label" colspan="3">检查周期</td>
              <td class="print-table__cell print-table__cell--filled print-table__cell--center" colspan="2">${v("period") || "6个月"}</td>
            </tr>
            <tr><td class="print-table__band" colspan="14">检查记录</td></tr>
            <tr>
              <th class="print-table__head print-table__cell--center">序号</th>
              <th class="print-table__head" colspan="3">检查项目名称</th>
              <th class="print-table__head" colspan="2">检查要求</th>
              <th class="print-table__head" colspan="2">领用检查（是/否）/日期</th>
              <th class="print-table__head" colspan="2">半年度检查（是/否）/日期</th>
              <th class="print-table__head">半年度检查（是/否）/日期</th>
              <th class="print-table__head" colspan="2">半年度检查（是/否）/日期</th>
              <th class="print-table__head">半年度检查（是/否）/日期</th>
            </tr>
            ${bodyRows}
          </tbody>
        </table>
        <div class="print-sheet__sign"><span>检查人：${v("inspector")}</span><span>检查日期：${inspectionDate}</span></div>
      </section>`;
  }

  let data = loadData();
  let savedPeople = loadNameBook();
  syncNameBookFromData();
  let currentRoute = "overview";
  let currentQuery = "";
  let currentStatus = "all";
  let editingId = null;
  let formExpandedId = null;     // 台账填写视图中当前展开编辑的记录 id
  let formViewMode = "form";     // FORM_MODULES 模块的视图: "form"(台账填写) | "list"(全部列表)
  let inspectionSelectedId = null; // 巡检模块只展开当前选中的一张表
  let inspectionListQuery = "";   // 巡检记录目录内的快速搜索词
  let lastDeleted = null;
  let toastActionHandler = null;
  let lastFocusedElement = null;
  let activeDateControl = null;
  let datePickerElement = null;
  let activeSelectControl = null;
  let activePersonControl = null;
  let confirmReturnFocus = null;

  const pageContent = document.querySelector("#pageContent");
  const searchInput = document.querySelector("#globalSearch");
  const searchPanel = document.querySelector("#searchPanel");
  const searchClearButton = document.querySelector("#searchClearButton");
  const modal = document.querySelector("#recordModal");
  const recordForm = document.querySelector("#recordForm");
  const modalFields = document.querySelector("#modalFields");
  const sidebar = document.querySelector("#sidebar");
  const detailDrawer = document.querySelector("#detailDrawer");
  const detailBackdrop = document.querySelector("#detailBackdrop");
  const confirmModal = document.querySelector("#confirmModal");
  const notificationPanel = document.querySelector("#notificationPanel");
  const helpPanel = document.querySelector("#helpPanel");
  const toastAction = document.querySelector("#toastAction");
  let toastTimer;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function loadData() {
    try {
      localStorage.removeItem(LEGACY_DEMO_STORAGE_KEY);
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...clone(seedData), ...JSON.parse(saved) } : clone(seedData);
    } catch {
      return clone(seedData);
    }
  }

  function loadNameBook() {
    try {
      const saved = JSON.parse(localStorage.getItem(NAMEBOOK_STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? [...new Set(saved.map(name => String(name).trim()).filter(Boolean))].slice(0, 80) : [];
    } catch {
      return [];
    }
  }

  function saveNameBook() {
    localStorage.setItem(NAMEBOOK_STORAGE_KEY, JSON.stringify(savedPeople.slice(0, 80)));
  }

  function syncNameBookFromData() {
    const existingNames = (data.certificates || []).map(row => String(row.person || "").trim()).filter(Boolean);
    savedPeople = [...new Set([...savedPeople, ...existingNames])].slice(0, 80);
    saveNameBook();
  }

  function rememberPersonName(value) {
    const name = String(value || "").trim();
    if (!name) return;
    savedPeople = [name, ...savedPeople.filter(item => item !== name)].slice(0, 80);
    saveNameBook();
  }

  function personNameSuggestions(query = "") {
    const normalizedQuery = String(query || "").trim().toLowerCase();
    return savedPeople.filter(name => !normalizedQuery || name.toLowerCase().includes(normalizedQuery)).slice(0, 8);
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    updateNavCounts();
  }

  function updateNavCounts() {
    const counts = {
      tools: data.tools.filter(row => ["code", "name", "dept", "owner"].some(key => !String(row[key] || "").trim())).length,
      certificates: data.certificates.filter(row => row.status !== "有效").length,
      waste: data.waste.filter(row => row.status === "接近上限").length,
      inspections: data.inspections.filter(row => !String(row.toolRef || "").trim() || !String(row.inspector || "").trim() || !row.date).length
    };
    Object.entries(counts).forEach(([route, value]) => {
      const badge = document.querySelector(`[data-nav-count="${route}"]`);
      if (badge) {
        badge.textContent = value;
        badge.hidden = value === 0;
      }
    });
  }

  function count(rows, key, value) { return rows.filter(row => row[key] === value).length; }
  function sum(rows, key) { return rows.reduce((total, row) => total + (Number.parseFloat(String(row[key]).replace(/,/g, "")) || 0), 0); }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }

  function pad2(value) { return String(value).padStart(2, "0"); }

  function parseDateValue(value, type = "date") {
    const pattern = type === "month" ? /^(\d{4})-(\d{2})$/ : /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = pattern.exec(String(value || ""));
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = type === "month" ? 1 : Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
  }

  function toDateValue(date, type = "date") {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const month = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
    return type === "month" ? month : `${month}-${pad2(date.getDate())}`;
  }

  function normalizeDateValue(value, type = "date") {
    return toDateValue(parseDateValue(value, type), type);
  }

  function formatDateValue(value, type = "date") {
    const date = parseDateValue(value, type);
    if (!date) return "";
    return type === "month"
      ? `${date.getFullYear()}年${date.getMonth() + 1}月`
      : `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function displayFieldValue(config, key, value) {
    const field = config.fields.find(item => item[0] === key);
    return field && ["date", "month"].includes(field[2]) ? formatDateValue(value, field[2]) : String(value ?? "");
  }

  function dateShortcutValue(type, shortcut) {
    const today = new Date();
    if (type === "month") {
      const offset = { previous: -1, current: 0, next: 1 }[shortcut];
      if (offset === undefined) return "";
      return toDateValue(new Date(today.getFullYear(), today.getMonth() + offset, 1), "month");
    }
    const offset = { today: 0, tomorrow: 1, plus7: 7, plus30: 30 }[shortcut];
    if (offset === undefined) return "";
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    date.setDate(date.getDate() + offset);
    return toDateValue(date, "date");
  }

  function renderDateField(name, label, type, value = "", { className = "", required = true } = {}) {
    const normalized = normalizeDateValue(value, type);
    const view = normalized ? normalized.slice(0, 7) : toDateValue(new Date(), "month");
    const placeholder = type === "month" ? "请选择月份" : "请选择日期";
    const shortcuts = type === "month"
      ? [["previous", "上月"], ["current", "本月"], ["next", "下月"]]
      : [["today", "今天"], ["tomorrow", "明天"], ["plus7", "7天后"], ["plus30", "30天后"]];
    return `
      <label class="hp-field hp-field--date ${escapeHtml(className)}">
        <span class="hp-label">${escapeHtml(label)}</span>
        <span class="date-control" data-date-control data-date-type="${type}" data-date-value="${escapeHtml(normalized)}" data-date-view="${escapeHtml(view)}">
          <span class="date-control__input-wrap">
            <input class="hp-input date-control__display" name="${escapeHtml(name)}" type="text" value="${escapeHtml(formatDateValue(normalized, type))}" placeholder="${placeholder}" readonly${required ? " required" : ""} aria-haspopup="dialog" aria-expanded="false" data-date-display autocomplete="off" inputmode="none" />
            <button class="date-control__button" type="button" data-date-trigger aria-label="打开${escapeHtml(label)}选择器"><i class="ph ph-calendar-blank"></i></button>
          </span>
          <span class="date-shortcuts" aria-label="${escapeHtml(label)}快捷选择">
            ${shortcuts.map(([shortcut, text]) => `<button class="date-shortcut" type="button" data-date-shortcut="${shortcut}">${text}</button>`).join("")}
          </span>
        </span>
      </label>`;
  }

  function ensureDatePicker() {
    if (!datePickerElement) {
      datePickerElement = document.createElement("div");
      datePickerElement.className = "date-picker";
      datePickerElement.hidden = true;
      datePickerElement.setAttribute("role", "dialog");
      document.body.appendChild(datePickerElement);
    }
    return datePickerElement;
  }

  function viewDateForControl(control) {
    const type = control.dataset.dateType;
    return parseDateValue(control.dataset.dateView, "month") || parseDateValue(control.dataset.dateValue, type) || new Date();
  }

  function renderDatePicker(control) {
    const picker = ensureDatePicker();
    const type = control.dataset.dateType;
    const viewDate = viewDateForControl(control);
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
    const selectedValue = control.dataset.dateValue || "";
    const headerLabel = type === "month" ? `${year}年` : `${year}年${month}月`;
    const navLabel = type === "month" ? "年份" : "月份";
    let content = "";

    if (type === "month") {
      const months = Array.from({ length: 12 }, (_, index) => {
        const value = `${year}-${pad2(index + 1)}`;
        const selected = value === selectedValue ? " is-selected" : "";
        return `<button type="button" class="date-picker__month${selected}" data-date-month="${value}" aria-label="${year}年${index + 1}月">${index + 1}月</button>`;
      }).join("");
      content = `<div class="date-picker__months">${months}</div>`;
    } else {
      const firstDay = new Date(year, month - 1, 1);
      const leading = firstDay.getDay();
      const daysInMonth = new Date(year, month, 0).getDate();
      const todayValue = toDateValue(new Date(), "date");
      const blanks = Array.from({ length: leading }, () => '<span class="date-picker__blank" aria-hidden="true"></span>').join("");
      const days = Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const value = `${year}-${pad2(month)}-${pad2(day)}`;
        const selected = value === selectedValue ? " is-selected" : "";
        const today = value === todayValue ? " is-today" : "";
        return `<button type="button" class="date-picker__day${selected}${today}" data-date-day="${value}" aria-label="${formatDateValue(value, "date")}">${day}</button>`;
      }).join("");
      content = `<div class="date-picker__weekdays">${["日", "一", "二", "三", "四", "五", "六"].map(day => `<span>${day}</span>`).join("")}</div><div class="date-picker__grid">${blanks}${days}</div>`;
    }

    picker.innerHTML = `<div class="date-picker__header"><button type="button" class="date-picker__nav" data-date-nav="-1" aria-label="上一个${navLabel}"><i class="ph ph-caret-left"></i></button><strong>${headerLabel}</strong><button type="button" class="date-picker__nav" data-date-nav="1" aria-label="下一个${navLabel}"><i class="ph ph-caret-right"></i></button></div>${content}`;
    picker.setAttribute("aria-label", type === "month" ? "月份选择器" : "日期选择器");
    picker.hidden = false;
    positionDatePicker();
  }

  function positionDatePicker() {
    if (!datePickerElement || datePickerElement.hidden || !activeDateControl) return;
    const rect = activeDateControl.getBoundingClientRect();
    const width = Math.min(320, Math.max(220, window.innerWidth - 24));
    const height = datePickerElement.offsetHeight;
    const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - width - 12));
    let top = rect.bottom + 8;
    if (top + height > window.innerHeight - 12 && rect.top - height - 8 >= 12) top = rect.top - height - 8;
    datePickerElement.style.width = `${width}px`;
    datePickerElement.style.left = `${left}px`;
    datePickerElement.style.top = `${top}px`;
  }

  function closeDatePickers() {
    document.querySelectorAll("[data-date-control].is-open").forEach(control => {
      control.classList.remove("is-open");
      control.querySelector("[data-date-display]")?.setAttribute("aria-expanded", "false");
    });
    if (datePickerElement) datePickerElement.hidden = true;
    activeDateControl = null;
  }

  function openDatePicker(control) {
    if (activeDateControl === control && datePickerElement && !datePickerElement.hidden) {
      closeDatePickers();
      return;
    }
    closeDatePickers();
    activeDateControl = control;
    control.classList.add("is-open");
    control.querySelector("[data-date-display]")?.setAttribute("aria-expanded", "true");
    renderDatePicker(control);
  }

  function toggleDatePicker(control) { openDatePicker(control); }

  function shiftDateView(control, amount) {
    if (!control) return;
    const type = control.dataset.dateType;
    const current = viewDateForControl(control);
    const next = new Date(current.getFullYear(), current.getMonth(), 1);
    if (type === "month") next.setFullYear(next.getFullYear() + amount);
    else next.setMonth(next.getMonth() + amount);
    control.dataset.dateView = toDateValue(next, "month");
    renderDatePicker(control);
  }

  function setDateControlValue(control, value) {
    if (!control) return;
    const type = control.dataset.dateType;
    const normalized = normalizeDateValue(value, type);
    control.dataset.dateValue = normalized;
    control.dataset.dateView = normalized ? normalized.slice(0, 7) : toDateValue(new Date(), "month");
    const display = control.querySelector("[data-date-display]");
    if (display) {
      display.value = formatDateValue(normalized, type);
      display.classList.toggle("has-value", Boolean(normalized));
    }
  }

  function persistFormDateControl(control) {
    const row = control?.closest("[data-form-row]");
    if (!row || !FORM_MODULES[currentRoute]) return;
    const name = control.querySelector("[data-date-display]")?.name;
    if (!name) return;
    const recordId = row.dataset.formRow || "draft";
    const record = ensureFormRecord(currentRoute, recordId);
    if (record) {
      record[name] = control.dataset.dateValue || "";
      saveData();
    }
  }

  function selectDateValue(value) {
    const control = activeDateControl;
    if (!control) return;
    setDateControlValue(control, value);
    persistFormDateControl(control);
    closeDatePickers();
    control.querySelector("[data-date-display]")?.focus();
  }

  function applyDateShortcut(control, shortcut) {
    if (shortcut === "clear") setDateControlValue(control, "");
    else setDateControlValue(control, dateShortcutValue(control.dataset.dateType, shortcut));
    persistFormDateControl(control);
    closeDatePickers();
  }

  function statusClass(status) {
    if (["已逾期", "已过期", "不合格", "需报废", "需修复"].includes(status)) return "status status--danger";
    if (["待检", "即将到期", "接近上限", "需复核", "低库存", "待复核", "待处置", "待整改", "未检"].includes(status)) return "status status--warning";
    if (["正常", "有效", "已抄表", "在库", "已完成", "良好", "合格"].includes(status)) return "status";
    return "status status--neutral";
  }

  function pageHeading(title, eyebrow, description, withAdd = true) {
    const supportsWordExport = Boolean(printTemplates[currentRoute]);
    return `
      <header class="page-heading">
        <div class="page-heading__copy">
          <span class="page-heading__eyebrow"><i class="ph ph-sparkle"></i>${escapeHtml(eyebrow)}</span>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
        <div class="page-heading__actions">
          ${supportsWordExport ? '<button class="hp-btn hp-btn--secondary" type="button" data-action="export-word"><i class="ph ph-file-doc"></i> 导出 Word</button>' : ""}
          <button class="hp-btn hp-btn--secondary" type="button" data-action="export-csv"><i class="ph ph-download-simple"></i> 导出 CSV</button>
          ${withAdd ? '<button class="hp-btn hp-btn--primary" type="button" data-action="add"><i class="ph ph-plus"></i> 新增记录</button>' : ""}
        </div>
      </header>`;
  }

  function renderOverview() {
    const toolAlerts = data.tools.filter(r => ["code", "name", "dept", "owner"].some(key => !String(r[key] || "").trim())).length;
    const certAlerts = data.certificates.filter(r => r.status !== "有效").length;
    const wasteAlerts = data.waste.filter(r => r.status === "接近上限").length;
    const totalRecords = Object.values(data).reduce((total, rows) => total + rows.length, 0);
    const moduleCount = Object.keys(moduleConfigs).length;
    const activeModules = Object.values(data).filter(rows => rows.length > 0).length;
    const alertTotal = toolAlerts + certAlerts + wasteAlerts;
    const coverage = moduleCount ? Math.round(activeModules / moduleCount * 100) : 0;
    const modules = [
      ["tools", "ph-wrench", "手持电动工具", "317-03b 原表台账"],
      ["inspections", "ph-clipboard-text", "工具巡检", "标准检查项与周期记录"],
      ["energy", "ph-lightning", "能源数据", "水、电、气读数"],
      ["certificates", "ph-identification-card", "人员证件", "证件有效期管理"],
      ["waste", "ph-recycle", "危废存量", "库存与处置状态"],
      ["chemicals", "ph-flask", "化学品管理", "SDS 与库存信息"]
    ];
    const moduleCards = modules.map(([route, icon, title, description]) => {
      const count = data[route].length;
      return `<button class="dashboard-module-card ${count ? "is-started" : ""}" type="button" data-route-go="${route}">
        <span class="dashboard-module-card__icon"><i class="ph ${icon}"></i></span>
        <span class="dashboard-module-card__body"><strong>${title}</strong><small>${description}</small></span>
        <span class="dashboard-module-card__status"><b>${count}</b><small>${count ? "条记录" : "待开始"}</small></span>
        <i class="ph ph-arrow-up-right dashboard-module-card__arrow"></i>
      </button>`;
    }).join("");
    const alertRows = [
      ["certificates", "ph-identification-card", "人员证件", "到期及即将到期", certAlerts],
      ["tools", "ph-wrench", "工具台账", "编号、责任人等字段待补录", toolAlerts],
      ["waste", "ph-recycle", "危废库存", "接近库容上限", wasteAlerts]
    ].map(([route, icon, title, description, value]) => `<button class="dashboard-alert" type="button" data-route-go="${route}">
      <span class="dashboard-alert__icon"><i class="ph ${icon}"></i></span>
      <span><strong>${title}</strong><small>${description}</small></span>
      <b>${value}</b><i class="ph ph-caret-right"></i>
    </button>`).join("");
    pageContent.innerHTML = `
      ${pageHeading("管理总览", "EHS Command Center", "以仪表盘方式查看净水工厂的 EHS 数据准备度、风险提醒和业务入口。", false)}
      <section class="dashboard-kpi-grid" aria-label="EHS 核心指标">
        <article class="dashboard-kpi dashboard-kpi--accent"><span class="dashboard-kpi__icon"><i class="ph ph-files"></i></span><span><small>业务台账</small><strong>${totalRecords}</strong><em>当前已录入的真实记录</em></span></article>
        <article class="dashboard-kpi dashboard-kpi--warning"><span class="dashboard-kpi__icon"><i class="ph ph-warning-circle"></i></span><span><small>待处理事项</small><strong>${alertTotal}</strong><em>${alertTotal ? "需要尽快跟进" : "当前没有待处理提醒"}</em></span></article>
        <article class="dashboard-kpi"><span class="dashboard-kpi__icon"><i class="ph ph-squares-four"></i></span><span><small>已启用模块</small><strong>${activeModules}<b>/${moduleCount}</b></strong><em>已有真实数据的模块</em></span></article>
        <article class="dashboard-kpi"><span class="dashboard-kpi__icon"><i class="ph ph-chart-donut"></i></span><span><small>数据覆盖率</small><strong>${coverage}%</strong><em>按模块录入进度计算</em></span></article>
      </section>
      <section class="dashboard-grid dashboard-grid--top">
        <article class="dashboard-panel dashboard-readiness">
          <header class="dashboard-panel__head"><div><span class="dashboard-kicker">DATA READINESS</span><h2>合规数据准备度</h2></div><span class="dashboard-panel__meta">${activeModules}/${moduleCount} 个模块已开始</span></header>
          <div class="dashboard-readiness__body">
            <div class="dashboard-readiness__ring" style="--dashboard-progress:${coverage * 3.6}deg" role="img" aria-label="数据覆盖率 ${coverage}%"><span>${coverage}<small>%</small></span></div>
            <div class="dashboard-readiness__copy"><strong>${coverage ? "管理数据正在建立" : "从第一条真实记录开始"}</strong><p>${coverage ? "已开始录入的模块会在这里持续汇总。" : "当前尚未录入业务数据，录入后指标、提醒和趋势会自动更新。"}</p><button class="hp-btn hp-btn--primary" type="button" data-action="add"><i class="ph ph-plus"></i> 开始录入</button></div>
          </div>
        </article>
        <article class="dashboard-panel dashboard-alerts">
          <header class="dashboard-panel__head"><div><span class="dashboard-kicker">ATTENTION</span><h2>风险与提醒</h2></div><span class="dashboard-count">${alertTotal}</span></header>
          <div class="dashboard-alert-list">${alertRows}</div>
        </article>
      </section>
      <section class="dashboard-section-head"><div><span class="dashboard-kicker">MODULES</span><h2>业务模块</h2></div><span>${activeModules} / ${moduleCount} 已开始</span></section>
      <section class="dashboard-module-grid" aria-label="业务模块入口">${moduleCards}</section>
      <section class="dashboard-grid dashboard-grid--lower">
        <article class="dashboard-panel dashboard-trend"><header class="dashboard-panel__head"><div><span class="dashboard-kicker">ENERGY TREND</span><h2>能源使用趋势</h2><p>录入能源数据后自动生成</p></div><button class="panel__link" type="button" data-route-go="energy">前往能源数据 <i class="ph ph-arrow-up-right"></i></button></header><div class="dashboard-chart-empty"><span class="dashboard-chart-empty__icon"><i class="ph ph-chart-line-up"></i></span><strong>等待真实能源数据</strong><p>添加抄表记录后，这里会显示水、电、气的变化趋势。</p></div></article>
        <article class="dashboard-panel dashboard-quick"><header class="dashboard-panel__head"><div><span class="dashboard-kicker">QUICK ACCESS</span><h2>快速入口</h2></div></header><div class="dashboard-quick-list"><button type="button" data-route-go="certificates"><span class="dashboard-quick-list__icon"><i class="ph ph-identification-card"></i></span><span><strong>人员证件</strong><small>管理健康证、叉车证等</small></span><i class="ph ph-arrow-right"></i></button><button type="button" data-route-go="tools"><span class="dashboard-quick-list__icon"><i class="ph ph-wrench"></i></span><span><strong>工具台账</strong><small>维护 317-03b 原表字段</small></span><i class="ph ph-arrow-right"></i></button><button type="button" data-route-go="chemicals"><span class="dashboard-quick-list__icon"><i class="ph ph-flask"></i></span><span><strong>化学品管理</strong><small>维护 SDS 与库存信息</small></span><i class="ph ph-arrow-right"></i></button></div></article>
      </section>`;
  }

  function attentionItem(icon, title, text, value, route) {
    return `<button class="attention-item" type="button" data-route-go="${route}" style="border:0;text-align:left;cursor:pointer"><span class="attention-item__icon"><i class="ph ${icon}"></i></span><span><strong>${title}</strong><small>${text}</small></span><b>${value}</b></button>`;
  }

  function metricCard(icon, value, label, trend, warning = false) {
    const neutral = trend === "暂无记录";
    return `<article class="metric-card"><div class="metric-card__top"><span class="metric-card__icon"><i class="ph ${icon}"></i></span><span class="metric-card__trend ${neutral ? "is-neutral" : warning ? "is-warning" : ""}"><i class="ph ${neutral ? "ph-minus" : warning ? "ph-warning" : "ph-trend-down"}"></i>${escapeHtml(trend)}</span></div><strong>${escapeHtml(value)}</strong><p>${escapeHtml(label)}</p></article>`;
  }

  function renderModule(route) {
    const config = moduleConfigs[route];
    const rows = filteredRows(route);
    const statuses = [...new Set(data[route].map(row => row.status))];
    pageContent.innerHTML = `
      ${pageHeading(config.title, config.eyebrow, config.description)}
      <section class="module-stats">
        ${config.stats(data[route]).map(stat => `<article class="stat-tile"><div class="stat-tile__head"><span>${escapeHtml(stat[0])}</span><i class="ph ${stat[2]}"></i></div><strong>${escapeHtml(stat[1])}</strong><small>${escapeHtml(stat[3])}</small></article>`).join("")}
      </section>
      <section class="panel table-panel">
        <div class="table-toolbar">
          <div class="filter-group">
            ${renderSelectControl("", [["all", "全部状态"], ...statuses.map(status => [status, status])], currentStatus, { label: "按状态筛选", className: "filter-select-control", required: false })}
            ${(currentStatus !== "all" || currentQuery) ? '<button class="hp-btn hp-btn--ghost" type="button" data-action="reset-filters"><i class="ph ph-arrow-counter-clockwise"></i> 重置</button>' : '<span class="hp-chip hp-chip--soft"><i class="ph ph-funnel"></i> 实时筛选</span>'}
          </div>
          <span class="table-count">共 ${rows.length} 条记录</span>
        </div>
        ${renderTable(route, rows)}
      </section>`;
  }

  // ===== 方太原表当输入界面(FORM_MODULES)=====
  // 渲染整个台账填写视图。
  function renderFormModule(route) {
    const form = FORM_MODULES[route];
    const config = moduleConfigs[route];
    const rows = data[route];
    const isFormMode = formViewMode === "form";

    const formTabLabel = form.layout === "inspection" ? "检查表填写" : "台账填写";
    const addLabel = form.layout === "inspection" ? "新增一张" : "新增一行";

    // ===== inspection 布局:记录目录 + 单张编辑 =====
    // 默认只展示紧凑目录，选中记录后只打开一张 Word 原表，避免多张长表连续下拉。
    if (form.layout === "inspection") {
      const selectedIndex = rows.findIndex(row => row.id === inspectionSelectedId);
      const selectedRecord = selectedIndex >= 0 ? rows[selectedIndex] : null;

      if (selectedRecord) {
        const previous = rows[selectedIndex - 1];
        const next = rows[selectedIndex + 1];
        pageContent.innerHTML = `
          <header class="page-heading inspection-heading">
            <div class="page-heading__copy">
              <button class="inspection-back" type="button" data-inspection-back><i class="ph ph-arrow-left"></i> 返回巡检记录</button>
              <span class="inspection-page-tag"><i class="ph ph-tag"></i><span data-inspection-label-display>${escapeHtml(selectedRecord.uiLabel || "未设置标签")}</span></span>
              <h1>${escapeHtml(selectedRecord.toolName || "未命名检查记录")}</h1>
              <p>${escapeHtml(selectedRecord.toolRef || "未填写工具编号")} · 第 ${selectedIndex + 1} 张，共 ${rows.length} 张 · 输入内容自动保存</p>
            </div>
            <div class="page-heading__actions">
              <button class="hp-btn hp-btn--secondary" type="button" data-inspection-nav="previous" ${previous ? "" : "disabled"}><i class="ph ph-caret-left"></i> 上一张</button>
              <button class="hp-btn hp-btn--secondary" type="button" data-inspection-nav="next" ${next ? "" : "disabled"}>下一张 <i class="ph ph-caret-right"></i></button>
              <button class="hp-btn hp-btn--primary" type="button" data-action="form-add"><i class="ph ph-plus"></i> 新增一张</button>
            </div>
          </header>
          <section class="inspection-editor">
            <div class="inspection-editor__bar">
              <div class="inspection-editor__identity">
                <span class="inspection-editor__saved"><i class="ph ph-cloud-check"></i><span data-tool-sync-state>${selectedRecord.ledgerToolId && data.tools.some(tool => tool.id === selectedRecord.ledgerToolId) ? "已同步工具台账" : "填写编号和名称后同步台账"}</span></span>
                <label class="inspection-tag-editor">
                  <i class="ph ph-tag"></i>
                  <span>标签</span>
                  <input type="text" name="uiLabel" value="${escapeHtml(selectedRecord.uiLabel || "")}" placeholder="输入标签名称" maxlength="20" data-form-input="${escapeHtml(selectedRecord.id)}" aria-label="巡检表标签" />
                </label>
              </div>
              <div>
                <button class="inspection-editor__action" type="button" data-form-print="${escapeHtml(selectedRecord.id)}"><i class="ph ph-printer"></i> 打印本表</button>
                <button class="inspection-editor__action" type="button" data-action="export-word"><i class="ph ph-file-doc"></i> 批量导出 Word</button>
                <button class="inspection-editor__action inspection-editor__action--danger" type="button" data-form-delete="${escapeHtml(selectedRecord.id)}"><i class="ph ph-trash"></i> 删除本表</button>
              </div>
            </div>
            <div class="word-sheets">${renderInspectionForm(route, selectedRecord)}</div>
          </section>`;
        return;
      }

      const normalizedQuery = inspectionListQuery.trim().toLowerCase();
      const visibleRows = normalizedQuery
        ? rows.filter(row => ["uiLabel", "toolRef", "toolName", "dept", "inspector", "date", "manufacturer", "model"].some(key => String(row[key] || "").toLowerCase().includes(normalizedQuery)))
        : rows;
      pageContent.innerHTML = `
        <header class="page-heading">
          <div class="page-heading__copy">
            <span class="page-heading__eyebrow"><i class="ph ph-sparkle"></i>${escapeHtml(config.eyebrow)}</span>
            <h1>${escapeHtml(config.title)}</h1>
            <p>${escapeHtml(config.description)}</p>
          </div>
          <div class="page-heading__actions">
            <button class="hp-btn hp-btn--primary" type="button" data-action="form-add"><i class="ph ph-plus"></i> ${addLabel}</button>
            <button class="hp-btn hp-btn--secondary" type="button" data-action="export-word"><i class="ph ph-file-doc"></i> 批量导出 Word</button>
            <button class="hp-btn hp-btn--secondary" type="button" data-action="export-csv"><i class="ph ph-download-simple"></i> 导出 CSV</button>
          </div>
        </header>
        <section class="inspection-directory">
          <div class="inspection-directory__toolbar">
            <label class="inspection-search">
              <i class="ph ph-magnifying-glass"></i>
              <input type="search" value="${escapeHtml(inspectionListQuery)}" placeholder="搜索标签、工具编号、名称、部门或检查人" data-inspection-search aria-label="搜索巡检记录" />
              ${inspectionListQuery ? '<button type="button" data-inspection-search-clear aria-label="清空搜索"><i class="ph ph-x"></i></button>' : ""}
            </label>
            <span class="inspection-directory__count">${normalizedQuery ? `找到 ${visibleRows.length} 条` : `共 ${rows.length} 张检查表`}</span>
          </div>
          ${visibleRows.length ? `
            <div class="inspection-record-list">
              ${visibleRows.map((record, index) => renderInspectionListItem(record, rows.indexOf(record) + 1)).join("")}
            </div>` : `
            <div class="inspection-empty">
              <span><i class="ph ${rows.length ? "ph-magnifying-glass" : "ph-clipboard-text"}"></i></span>
              <h2>${rows.length ? "没有匹配的巡检记录" : "还没有巡检记录"}</h2>
              <p>${rows.length ? "换一个工具编号、名称、部门或检查人试试。" : "新建后只打开当前这一张表，填写内容会自动保存在本机。"}</p>
              ${rows.length ? '<button class="hp-btn hp-btn--secondary" type="button" data-inspection-search-clear>清空搜索</button>' : '<button class="hp-btn hp-btn--primary" type="button" data-action="form-add"><i class="ph ph-plus"></i> 新建第一张</button>'}
            </div>`}
        </section>`;
      return;
    }

    // ===== ledger 布局(扁平台账表):保留卡片堆叠交互 =====
    const expandedRecord = formExpandedId ? rows.find(r => r.id === formExpandedId) : null;
    const expandedContent = expandedRecord
      ? renderFormRow(route, expandedRecord, rows.indexOf(expandedRecord) + 1)
      : "";
    const cards = rows
      .filter(r => r.id !== formExpandedId)
      .map(r => renderFormCard(route, r, rows.indexOf(r) + 1))
      .join("");
    const colgroup = `<colgroup>${form.sheetColumns.map(col => `<col style="width:${col.width}">`).join("")}</colgroup>`;
    const headCells = form.sheetColumns.map(col => `<th class="form-sheet__head">${escapeHtml(col.label)}</th>`).join("");

    pageContent.innerHTML = `
      <header class="page-heading">
        <div class="page-heading__copy">
          <span class="page-heading__eyebrow"><i class="ph ph-sparkle"></i>${escapeHtml(config.eyebrow)}</span>
          <h1>${escapeHtml(config.title)}</h1>
          <p>${escapeHtml(config.description)}</p>
        </div>
        <div class="page-heading__actions">
          <button class="hp-btn hp-btn--secondary" type="button" data-action="export-word"><i class="ph ph-file-doc"></i> 导出 Word</button>
          <button class="hp-btn hp-btn--secondary" type="button" data-action="export-csv"><i class="ph ph-download-simple"></i> 导出 CSV</button>
        </div>
      </header>
      <section class="module-stats">
        ${config.stats(rows).map(stat => `<article class="stat-tile"><div class="stat-tile__head"><span>${escapeHtml(stat[0])}</span><i class="ph ${stat[2]}"></i></div><strong>${escapeHtml(stat[1])}</strong><small>${escapeHtml(stat[3])}</small></article>`).join("")}
      </section>
      <div class="hp-tabs" role="tablist">
        <button class="hp-tabs__btn ${isFormMode ? "is-active" : ""}" type="button" role="tab" data-form-tab="form"><i class="ph ph-pencil-line"></i> ${formTabLabel}</button>
        <button class="hp-tabs__btn ${!isFormMode ? "is-active" : ""}" type="button" role="tab" data-form-tab="list"><i class="ph ph-list"></i> 全部列表</button>
      </div>
      ${isFormMode ? `
        <section class="panel form-sheet-panel">
          <header class="form-sheet__title">
            <p>${escapeHtml(form.company)}</p>
            <h2>${escapeHtml(form.title)}</h2>
            <p class="form-sheet__code">${escapeHtml(form.code)}</p>
          </header>
          <div class="form-sheet__body">
            <table class="form-sheet__table">
              ${colgroup}
              <thead><tr>${headCells}<th class="form-sheet__head form-sheet__head--action">操作</th></tr></thead>
              <tbody>
                ${expandedContent || (rows.length ? "" : `<tr class="form-sheet__empty"><td colspan="${form.sheetColumns.length + 1}"><div class="empty-state"><span class="empty-state__icon"><i class="ph ph-pencil-line"></i></span><h3>开始填写第一行</h3><p>点击下方「新增一行」，在表格里直接录入工具信息。</p></div></td></tr>`)}
              </tbody>
            </table>
            <div class="form-cards">${cards}</div>
          </div>
          <footer class="form-sheet__footer">
            <button class="hp-btn hp-btn--primary" type="button" data-action="form-add"><i class="ph ph-plus"></i> ${addLabel}</button>
            <span class="form-sheet__hint">${rows.length ? `共 ${rows.length} 条，已折叠 ${rows.length - (formExpandedId ? 1 : 0)} 条` : "尚未录入"}</span>
          </footer>
        </section>
      ` : `
        <section class="panel table-panel">
          <div class="table-toolbar">
            <span class="hp-chip hp-chip--soft"><i class="ph ph-funnel"></i> ${currentQuery ? "搜索结果" : "全部记录"}</span>
            <span class="table-count">共 ${filteredRows(route).length} 条记录</span>
          </div>
          ${renderTable(route, filteredRows(route))}
        </section>
      `}`;
  }

  function renderInspectionListItem(record, no) {
    const keyFields = ["toolName", "toolRef", "dept", "inspector", "date"];
    const filled = keyFields.filter(key => String(record[key] || "").trim()).length;
    const isReady = filled === keyFields.length;
    return `
      <article class="inspection-record" data-inspection-open="${escapeHtml(record.id)}">
        <span class="inspection-record__no">${no}</span>
        <span class="inspection-record__icon"><i class="ph ph-clipboard-text"></i></span>
        <span class="inspection-record__main">
          <span class="inspection-record__title">
            <strong>${escapeHtml(record.toolName || "未命名检查记录")}</strong>
            <em class="inspection-record__tag ${record.uiLabel ? "" : "is-empty"}"><i class="ph ph-tag"></i>${escapeHtml(record.uiLabel || "未设置标签")}</em>
            <em class="inspection-record__status ${isReady ? "is-ready" : ""}">${isReady ? "基本信息完整" : `待补充 ${keyFields.length - filled} 项`}</em>
          </span>
          <span class="inspection-record__meta">
            <span><i class="ph ph-hash"></i>${escapeHtml(record.toolRef || "未填写工具编号")}</span>
            <span><i class="ph ph-buildings"></i>${escapeHtml(record.dept || "未填写部门")}</span>
            <span><i class="ph ph-user"></i>${escapeHtml(record.inspector || "未填写检查人")}</span>
          </span>
        </span>
        <span class="inspection-record__date"><small>检查日期</small><strong>${escapeHtml(formatDateValue(record.date, "date") || "未填写")}</strong></span>
        <span class="inspection-record__actions">
          <button class="inspection-record__delete" type="button" data-form-delete="${escapeHtml(record.id)}" aria-label="删除${escapeHtml(record.toolName || "该巡检记录")}"><i class="ph ph-trash"></i></button>
          <button class="inspection-record__open" type="button" data-inspection-open="${escapeHtml(record.id)}">打开填写 <i class="ph ph-arrow-right"></i></button>
        </span>
      </article>`;
  }

  // 折叠卡片:序号 + 图标 + 摘要字段 + 操作按钮
  function renderFormCard(route, record, no) {
    const form = FORM_MODULES[route];
    const config = moduleConfigs[route];
    const summary = form.cardSummary.map(key => {
      const value = record[key];
      if (!value) return "";
      return ["code", "toolRef"].includes(key) ? `<span class="form-card__code">${escapeHtml(value)}</span>` : escapeHtml(value);
    }).filter(Boolean).join(' <span class="form-card__sep">·</span> ');
    const statusBadge = record.status ? `<span class="${statusClass(record.status)}">${escapeHtml(record.status)}</span>` : "";
    const titleKey = form.layout === "inspection" ? "toolName" : "name";
    const fallbackTitle = form.layout === "inspection" ? "未命名检查记录" : "未命名工具";
    return `
      <article class="form-card" data-form-card="${escapeHtml(record.id)}">
        <span class="form-card__no">${no}</span>
        <span class="form-card__icon"><i class="ph ${config.icon}"></i></span>
        <span class="form-card__body">
          <strong>${escapeHtml(record[titleKey] || fallbackTitle)}</strong>
          <small>${summary || "点击展开补充信息"}</small>
        </span>
        ${statusBadge}
        <span class="form-card__actions">
          <button class="row-action" type="button" data-form-print="${escapeHtml(record.id)}" aria-label="打印"><i class="ph ph-printer"></i></button>
          <button class="row-action" type="button" data-form-expand="${escapeHtml(record.id)}" aria-label="展开编辑"><i class="ph ph-pencil-simple"></i></button>
          <button class="row-action" type="button" data-form-delete="${escapeHtml(record.id)}" aria-label="删除"><i class="ph ph-trash"></i></button>
        </span>
      </article>`;
  }

  // 可编辑台账行:9 个原表字段(含序号列),日期格使用统一中文日期控件。
  function renderFormRow(route, record, no) {
    const form = FORM_MODULES[route];
    const cells = form.sheetColumns.map(col => {
      if (col.readonly) return `<td class="form-sheet__cell form-sheet__cell--no">${no}</td>`;
      const value = record[col.key] || "";
      if (col.type === "date") {
        return `<td class="form-sheet__cell">${renderDateField(col.key, col.label, "date", value)}</td>`;
      }
      return `<td class="form-sheet__cell"><input class="form-cell-input" type="text" name="${escapeHtml(col.key)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(col.label)}" data-form-input="${escapeHtml(record.id)}" /></td>`;
    }).join("");
    const extraRow = form.extraFields.length ? `
      <tr class="form-row__extra" data-form-extra="${escapeHtml(record.id)}">
        <td colspan="${form.sheetColumns.length + 1}">
          <div class="form-extra-grid">
            ${form.extraFields.map(field => `<div class="form-extra-field"><small>${escapeHtml(field[1])}</small>${field[2] === "date" ? renderDateField(field[0], field[1], "date", record[field[0]] || "") : renderSelectControl(field[0], field[3], record[field[0]] || "", { label: field[1], className: "form-cell-select" })}</div>`).join("")}
          </div>
        </td>
      </tr>` : "";
    return `
      <tr class="form-row form-row--editing" data-form-row="${escapeHtml(record.id)}">
        ${cells}
        <td class="form-sheet__cell form-sheet__cell--action">
          <button class="row-action" type="button" data-form-print="${escapeHtml(record.id)}" aria-label="打印"><i class="ph ph-printer"></i></button>
          <button class="row-action" type="button" data-form-collapse="${escapeHtml(record.id)}" aria-label="完成折叠"><i class="ph ph-check"></i></button>
        </td>
      </tr>${extraRow}`;
  }

  // 检查记录表(317-04b)的可填写版式:抬头键值对 + 8 项检查项 + 签字行,忠于原表结构。
  function renderInspectionForm(route, record) {
    const form = FORM_MODULES[route];
    const rid = record.id;
    const appearance = INSPECTION_ITEMS.filter(item => item.group === "外观检查");
    const pro = INSPECTION_ITEMS.filter(item => item.group === "专业检查");
    const groupText = group => group === "外观检查" ? "外观<br>检查" : escapeHtml(group);
    // 抬头区:4 行键值对 + 检查记录大标题 + 表头(严格对应 Word 的 14 列)
    const headerHtml = `
      <tr>
        <td class="iform__label" colspan="3">工具名称</td>
        <td class="iform__cell" colspan="4"><input class="form-cell-input" type="text" name="toolName" value="${escapeHtml(record.toolName || "")}" placeholder="工具名称" data-form-input="${escapeHtml(rid)}" /></td>
        <td class="iform__label" colspan="2">工厂/部门</td>
        <td class="iform__cell" colspan="5"><input class="form-cell-input" type="text" name="dept" value="${escapeHtml(record.dept || "")}" placeholder="工厂/部门" data-form-input="${escapeHtml(rid)}" /></td>
      </tr>
      <tr>
        <td class="iform__label" colspan="3">工具编号</td>
        <td class="iform__cell" colspan="4"><input class="form-cell-input" type="text" name="toolRef" value="${escapeHtml(record.toolRef || "")}" placeholder="工具编号" data-form-input="${escapeHtml(rid)}" /></td>
        <td class="iform__label" colspan="2">制造单位</td>
        <td class="iform__cell" colspan="5"><input class="form-cell-input" type="text" name="manufacturer" value="${escapeHtml(record.manufacturer || "")}" placeholder="制造单位" data-form-input="${escapeHtml(rid)}" /></td>
      </tr>
      <tr>
        <td class="iform__label" colspan="3">规格/型号</td>
        <td class="iform__cell" colspan="2"><input class="form-cell-input" type="text" name="model" value="${escapeHtml(record.model || "")}" placeholder="规格/型号" data-form-input="${escapeHtml(rid)}" /></td>
        <td class="iform__label" colspan="2">出厂编号</td>
        <td class="iform__cell" colspan="2"><input class="form-cell-input" type="text" name="serialNo" value="${escapeHtml(record.serialNo || "")}" placeholder="出厂编号" data-form-input="${escapeHtml(rid)}" /></td>
        <td class="iform__label" colspan="3">制造日期</td>
        <td class="iform__cell" colspan="2">${renderDateField("mfgDate", "制造日期", "date", record.mfgDate || "", { className: "word-inline-date", required: false })}</td>
      </tr>
      <tr>
        <td class="iform__label" colspan="3">管理部门</td>
        <td class="iform__cell" colspan="2"><input class="form-cell-input" type="text" name="manageDept" value="${escapeHtml(record.manageDept || "")}" placeholder="管理部门" data-form-input="${escapeHtml(rid)}" /></td>
        <td class="iform__label" colspan="2">工具类别</td>
        <td class="iform__cell" colspan="2"><input class="form-cell-input" type="text" name="category" value="${escapeHtml(record.category || "类")}" placeholder="类" data-form-input="${escapeHtml(rid)}" /></td>
        <td class="iform__label" colspan="3">检查周期</td>
        <td class="iform__cell" colspan="2"><input class="form-cell-input" type="text" name="period" value="${escapeHtml(record.period || "6个月")}" placeholder="6个月" data-form-input="${escapeHtml(rid)}" /></td>
      </tr>
      <tr><td class="iform__band" colspan="14">检查记录</td></tr>
      <tr>
        <th class="iform__head iform__head--no">序号</th>
        <th class="iform__head" colspan="3">检查项目名称</th>
        <th class="iform__head" colspan="2">检查要求</th>
        <th class="iform__head" colspan="2">领用检查（是/否）/日期</th>
        <th class="iform__head" colspan="2">半年度检查（是/否）/日期</th>
        <th class="iform__head">半年度检查</th>
        <th class="iform__head" colspan="2">半年度检查(是/否)/日期</th>
        <th class="iform__head">半年度检查</th>
      </tr>`;

    // 所有填写位保持 Word 的空白格体验，输入后即时写入本机浏览器存储。
    const fillCell = (name, colspan = 1) => `<td class="iform__cell"${colspan > 1 ? ` colspan="${colspan}"` : ""}><input class="form-cell-input" type="text" name="${escapeHtml(name)}" value="${escapeHtml(record[name] || "")}" data-form-input="${escapeHtml(rid)}" /></td>`;
    const checkItemRow = (item, no) => `<tr>
      <td class="iform__cell iform__cell--no">${no}</td>
      <td class="iform__cell iform__cell--group">${groupText(item.group)}</td>
      <td class="iform__cell" colspan="2">${escapeHtml(item.name)}</td>
      <td class="iform__cell iform__cell--require" colspan="2">${escapeHtml(item.standard).replace(/\n/g, "<br>")}</td>
      ${fillCell(`${item.key}__use`, 2)}
      ${fillCell(`${item.key}__h1`, 2)}
      ${fillCell(`${item.key}__h2`, 1)}
      ${fillCell(`${item.key}__h3`, 2)}
      ${fillCell(`${item.key}__h4`, 1)}
    </tr>`;
    const signRow = (no, label, namePrefix) => `<tr>
      <td class="iform__cell iform__cell--no">${no}</td>
      <td class="iform__cell iform__cell--group">${groupText(no === "6" ? "外观检查" : "专业检查")}</td>
      <td class="iform__cell" colspan="4">${escapeHtml(label)}</td>
      ${fillCell(`${namePrefix}__use`, 2)}
      ${fillCell(`${namePrefix}__h1`, 2)}
      ${fillCell(`${namePrefix}__h2`, 1)}
      ${fillCell(`${namePrefix}__h3`, 2)}
      ${fillCell(`${namePrefix}__h4`, 1)}
    </tr>`;
    const checkRows = [
      checkItemRow(appearance[0], "1"),
      checkItemRow(appearance[1], "2"),
      checkItemRow(appearance[2], "3"),
      checkItemRow(appearance[3], "4"),
      signRow("6", "检查责任人签字", "appearance_sign"),
      checkItemRow(pro[0], "5"),
      checkItemRow(pro[1], "6"),
      `<tr>
        <td class="iform__cell iform__cell--no">7</td>
        <td class="iform__cell iform__cell--group">专业检查</td>
        <td class="iform__cell" colspan="4">检查结论（良好/需修复/需报废）</td>
        ${fillCell("conclusion__use", 2)}
        ${fillCell("conclusion__h1", 2)}
        ${fillCell("conclusion__h2", 1)}
        ${fillCell("conclusion__h3", 2)}
        ${fillCell("conclusion__h4", 1)}
      </tr>`,
      signRow("8", "不合格项目修复（是/否），没有不填。", "repair"),
      signRow("9", "检查责任人签字", "pro_sign")
    ].join("");

    return `
      <article class="word-sheet" data-form-row="${escapeHtml(rid)}">
        <header class="word-sheet__title">
          <p>宁波方太厨具有限公司</p>
          <h2>手持式电动工具检查记录表</h2>
          <p class="word-sheet__code">FT[通用]OT-ZD 317-04b</p>
        </header>
        <table class="word-table">
          <colgroup><col style="width:5.32%"><col style="width:6.38%"><col style="width:1.63%"><col style="width:14.32%"><col style="width:3.91%"><col style="width:12.05%"><col style="width:2.54%"><col style="width:8.78%"><col style="width:6.76%"><col style="width:4.56%"><col style="width:11.32%"><col style="width:.4%"><col style="width:10.93%"><col style="width:11.11%"></colgroup>
          <tbody>
            ${headerHtml}
            ${checkRows}
          </tbody>
        </table>
        <div class="word-sheet__sign">
          <span>检查人：<input class="word-signer" type="text" name="inspector" value="${escapeHtml(record.inspector || "")}" placeholder="签字" data-form-input="${escapeHtml(rid)}" /></span>
          <span class="word-sign-date">检查日期：${renderDateField("date", "检查日期", "date", record.date || "", { className: "word-inline-date", required: false })}</span>
          <span class="word-sheet__ops">
            <button class="word-op" type="button" data-form-print="${escapeHtml(rid)}" aria-label="打印本表"><i class="ph ph-printer"></i> 打印</button>
            <button class="word-op word-op--danger" type="button" data-form-delete="${escapeHtml(rid)}" aria-label="删除本表"><i class="ph ph-trash"></i></button>
          </span>
        </div>
      </article>`;
  }

  function createEmptyFormRecord(route) {
    const newRecord = { id: `${route.slice(0, 1).toUpperCase()}-${Date.now().toString().slice(-6)}` };
    const form = FORM_MODULES[route];
    if (form.layout === "inspection") {
      // 检查记录表:初始化抬头字段、默认类别/周期，以及原表所有填写位。
      ["uiLabel", "toolName", "toolRef", "dept", "manufacturer", "model", "serialNo", "mfgDate", "manageDept", "inspector", "date"].forEach(k => { newRecord[k] = ""; });
      newRecord.category = "类";
      newRecord.period = "6个月";
      INSPECTION_ITEMS.forEach(item => ["use", "h1", "h2", "h3", "h4"].forEach(slot => { newRecord[`${item.key}__${slot}`] = ""; }));
      ["appearance_sign", "repair", "pro_sign", "conclusion"].forEach(prefix => ["use", "h1", "h2", "h3", "h4"].forEach(slot => { newRecord[`${prefix}__${slot}`] = ""; }));
      newRecord.conclusion = "";
    } else {
      form.sheetColumns.forEach(col => { if (!col.readonly) newRecord[col.key] = ""; });
      form.extraFields.forEach(field => { newRecord[field[0]] = field[2] === "select" ? (field[3]?.[0] || "") : ""; });
    }
    return newRecord;
  }

  function ensureFormRecord(route, recordId) {
    const existing = data[route].find(row => row.id === recordId);
    if (existing) return existing;
    // 空白 Word 表也可直接开始填写:第一次输入时把 draft 转成正式记录。
    if (recordId !== "draft") return null;
    const created = createEmptyFormRecord(route);
    data[route].unshift(created);
    document.querySelectorAll('[data-form-row="draft"]').forEach(element => { element.dataset.formRow = created.id; });
    document.querySelectorAll('[data-form-input="draft"]').forEach(element => { element.dataset.formInput = created.id; });
    return created;
  }

  // 巡检表是工具信息的录入入口之一：编号和名称齐全后，自动建立或更新工具台账。
  // 仅同步原台账真实存在的字段；责任人、领用/报废时间等不从巡检信息推测。
  function syncInspectionToTools(record) {
    const code = String(record.toolRef || "").trim();
    const name = String(record.toolName || "").trim();
    if (!code || !name) return null;

    const normalizedCode = code.toLowerCase();
    const byCode = data.tools.find(tool => String(tool.code || "").trim().toLowerCase() === normalizedCode);
    const linked = record.ledgerToolId ? data.tools.find(tool => tool.id === record.ledgerToolId) : null;
    const unnumberedNameMatch = data.tools.find(tool => !String(tool.code || "").trim() && String(tool.name || "").trim() === name);
    let tool = byCode || linked || unnumberedNameMatch;
    let created = false;

    if (!tool) {
      tool = {
        id: `T-${Date.now().toString().slice(-6)}`,
        code,
        name,
        model: "",
        dept: "",
        owner: "",
        received: "",
        scrapped: "",
        category: ""
      };
      data.tools.unshift(tool);
      created = true;
    }

    tool.code = code;
    tool.name = name;
    if (String(record.model || "").trim()) tool.model = String(record.model).trim();
    if (String(record.dept || "").trim()) tool.dept = String(record.dept).trim();
    if (String(record.category || "").trim() && String(record.category).trim() !== "类") tool.category = String(record.category).trim();
    record.ledgerToolId = tool.id;
    return { tool, created };
  }

  // 把表格行里 input 的值写回 data[route][id](实时保存)
  function saveFormInput(route, recordId, inputElement) {
    const record = ensureFormRecord(route, recordId);
    if (!record || !inputElement?.name) return;
    inputElement.dataset.formInput = record.id;
    record[inputElement.name] = inputElement.value;
    const toolSyncFields = ["toolRef", "toolName", "model", "dept", "category"];
    const syncResult = route === "inspections" && toolSyncFields.includes(inputElement.name)
      ? syncInspectionToTools(record)
      : null;
    saveData();
    if (syncResult) {
      const syncState = pageContent.querySelector("[data-tool-sync-state]");
      if (syncState) syncState.textContent = "已同步工具台账";
    }
    if (route === "inspections" && inputElement.name === "uiLabel") {
      const labelDisplay = pageContent.querySelector("[data-inspection-label-display]");
      if (labelDisplay) labelDisplay.textContent = inputElement.value.trim() || "未设置标签";
    }
  }

  // 新增一行:生成空记录、展开成可编辑行、聚焦第一个可填格
  function addFormRow(route) {
    const newRecord = createEmptyFormRecord(route);
    const form = FORM_MODULES[route];
    data[route].unshift(newRecord);
    formExpandedId = newRecord.id;
    if (form.layout === "inspection") inspectionSelectedId = newRecord.id;
    saveData();
    renderFormModule(route);
    setTimeout(() => {
      const firstInput = pageContent.querySelector(`[data-form-row="${newRecord.id}"] .form-cell-input`);
      firstInput?.focus();
    }, 60);
  }

  // 删除台账填写视图里的记录(带撤销)
  function deleteFormRow(route, recordId) {
    const index = data[route].findIndex(row => row.id === recordId);
    if (index < 0) return;
    const [record] = data[route].splice(index, 1);
    lastDeleted = { route, record, index };
    if (formExpandedId === recordId) formExpandedId = null;
    if (inspectionSelectedId === recordId) inspectionSelectedId = null;
    saveData();
    renderFormModule(route);
    showToast("记录已删除", "如有误操作，可以立即撤销", "撤销", undoDelete);
  }

  function filteredRows(route) {
    return data[route].filter(row => {
      const matchesStatus = currentStatus === "all" || row.status === currentStatus;
      const matchesQuery = !currentQuery || Object.values(row).some(value => String(value).toLowerCase().includes(currentQuery.toLowerCase()));
      return matchesStatus && matchesQuery;
    });
  }

  function renderTable(route, rows) {
    const config = moduleConfigs[route];
    if (!rows.length) {
      const filtered = currentStatus !== "all" || currentQuery;
      return `<div class="empty-state"><span class="empty-state__icon"><i class="ph ${filtered ? "ph-magnifying-glass" : config.icon}"></i></span><h3>${filtered ? "没有找到匹配记录" : "尚无业务数据"}</h3><p>${filtered ? "尝试更改搜索关键词或状态筛选条件。" : "点击右上角“新增记录”，录入第一条真实数据。"}</p></div>`;
    }
    return `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr>${config.columns.map(column => `<th>${escapeHtml(column[1])}</th>`).join("")}<th>操作</th></tr></thead>
          <tbody>
            ${rows.map(row => `<tr data-record-id="${escapeHtml(row.id)}">${config.columns.map((column, index) => `<td data-label="${escapeHtml(column[1])}">${renderCell(config, row, column[0], index)}</td>`).join("")}<td data-label="操作"><div class="row-actions"><button class="row-action" type="button" data-row-view="${escapeHtml(row.id)}" aria-label="查看详情"><i class="ph ph-eye"></i></button><button class="row-action" type="button" data-row-more="${escapeHtml(row.id)}" aria-label="更多操作"><i class="ph ph-dots-three"></i></button></div></td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <footer class="table-footer"><span>显示 1–${rows.length} 条，共 ${rows.length} 条</span><div class="pagination"><button class="page-btn" type="button"><i class="ph ph-caret-left"></i></button><button class="page-btn is-active" type="button">1</button><button class="page-btn" type="button"><i class="ph ph-caret-right"></i></button></div></footer>`;
  }

  function renderCell(config, row, key, index) {
    const value = row[key];
    if (index === 0) return `<div class="primary-cell"><span class="primary-cell__icon"><i class="ph ${config.icon}"></i></span><span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(row[config.primary[1]])}</small></span></div>`;
    if (key === "status" || key === "conclusion") return `<span class="${statusClass(value)}">${escapeHtml(value)}</span>`;
    if (key === "quantity") return `<strong>${escapeHtml(value)} ${escapeHtml(row.unit || "")}</strong>`;
    if (key === "value") return `<strong>${escapeHtml(value)} ${escapeHtml(row.unit || "")}</strong>`;
    if (key === "compare") return `<span style="color:${String(value).startsWith("+") ? "#d48013" : "#168254"};font-weight:700">${escapeHtml(value)}</span>`;
    return escapeHtml(displayFieldValue(config, key, value));
  }

  function navigate() {
    const requested = location.hash.slice(1);
    currentRoute = requested === "overview" || moduleConfigs[requested] ? requested : "overview";
    currentStatus = "all";
    currentQuery = "";
    formExpandedId = null;
    inspectionSelectedId = null;
    inspectionListQuery = "";
    formViewMode = "form";
    searchInput.value = "";
    searchClearButton.hidden = true;
    closeSearch();
    closePopovers();
    closeDatePickers();
    closeCustomSelects();
    closePersonPickers();
    closeDetail(false);
    document.querySelectorAll("[data-route]").forEach(link => link.classList.toggle("is-active", link.dataset.route === currentRoute));
    if (currentRoute === "overview") renderOverview();
    else if (FORM_MODULES[currentRoute]) renderFormModule(currentRoute);
    else renderModule(currentRoute);
    sidebar.classList.remove("is-open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openModal(route = currentRoute, recordId = null) {
    const target = moduleConfigs[route] ? route : "tools";
    const config = moduleConfigs[target];
    const record = recordId ? data[target].find(row => row.id === recordId) : null;
    closeDatePickers();
    closeCustomSelects();
    closePersonPickers();
    if (!detailDrawer.classList.contains("is-open")) lastFocusedElement = document.activeElement;
    editingId = record?.id || null;
    recordForm.dataset.route = target;
    recordForm.dataset.recordId = editingId || "";
    document.querySelector("#modalEyebrow").textContent = config.eyebrow;
    document.querySelector("#modalTitle").textContent = `${record ? "编辑" : "新增"}${config.title}记录`;
    modalFields.innerHTML = config.fields.map(field => renderField(field, record?.[field[0]] ?? "")).join("");
    closeDetail(false);
    closeSearch();
    closePopovers();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => modalFields.querySelector("input, [data-select-trigger]")?.focus(), 0);
  }

  function renderField([name, label, type, detail], value = "") {
    if (type === "heading") return `<div class="hp-field is-wide inspection-group"><span class="inspection-group__title">${escapeHtml(label)}</span></div>`;
    if (type === "person") return renderPersonField(name, label, value, detail);
    if (type === "select") return `<div class="hp-field hp-field--select"><span class="hp-label">${escapeHtml(label)}</span>${renderSelectControl(name, detail, value, { label, className: "hp-select-control--field" })}</div>`;
    if (type === "date" || type === "month") return renderDateField(name, label, type, value);
    return `<label class="hp-field"><span class="hp-label">${escapeHtml(label)}</span><input class="hp-input" name="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" ${detail ? `placeholder="${escapeHtml(detail)}"` : ""} required /></label>`;
  }

  function renderPersonField(name, label, value = "", placeholder = "请输入姓名") {
    const suggestions = personNameSuggestions(value);
    return `<div class="hp-field hp-field--person"><span class="hp-label">${escapeHtml(label)}</span>
      <span class="hp-person-control" data-person-control>
        <span class="hp-person-input-wrap">
          <input class="hp-input hp-person-input" name="${escapeHtml(name)}" type="text" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" autocomplete="off" required data-person-input aria-haspopup="listbox" aria-expanded="false" />
          <button class="hp-person-trigger" type="button" data-person-trigger aria-label="选择已保存姓名" aria-expanded="false"><i class="ph ph-users-three" aria-hidden="true"></i></button>
        </span>
        <span class="hp-person-menu" role="listbox" data-person-menu hidden>${renderPersonMenu(suggestions, value)}</span>
      </span>
    </div>`;
  }

  function renderPersonMenu(suggestions, query = "") {
    const title = query ? "匹配的姓名" : "最近使用的姓名";
    const content = suggestions.length
      ? suggestions.map(name => `<button class="hp-person-option" type="button" role="option" data-person-option data-person-value="${escapeHtml(name)}"><span class="hp-person-option__avatar">${escapeHtml(name.slice(0, 1))}</span><span>${escapeHtml(name)}</span><i class="ph ph-arrow-up-left" aria-hidden="true"></i></button>`).join("")
      : `<div class="hp-person-empty"><i class="ph ph-user-plus" aria-hidden="true"></i><span>${query ? "没有匹配的已保存姓名" : "保存第一条人员证件后，这里会出现姓名"}</span></div>`;
    return `<div class="hp-person-menu__head"><span>${title}</span><small>${suggestions.length ? `${suggestions.length} 个` : "本机保存"}</small></div>${content}`;
  }

  function closePersonPickers() {
    document.querySelectorAll("[data-person-control].is-open").forEach(control => {
      control.classList.remove("is-open");
      control.querySelector("[data-person-input]")?.setAttribute("aria-expanded", "false");
      control.querySelector("[data-person-trigger]")?.setAttribute("aria-expanded", "false");
      const menu = control.querySelector("[data-person-menu]");
      if (menu) menu.hidden = true;
    });
    activePersonControl = null;
  }

  function renderPersonSuggestions(control, query = "") {
    const menu = control.querySelector("[data-person-menu]");
    if (!menu) return;
    menu.innerHTML = renderPersonMenu(personNameSuggestions(query), query);
    menu.hidden = false;
    control.classList.add("is-open");
    control.querySelector("[data-person-input]")?.setAttribute("aria-expanded", "true");
    control.querySelector("[data-person-trigger]")?.setAttribute("aria-expanded", "true");
    activePersonControl = control;
  }

  function togglePersonPicker(control) {
    const shouldOpen = !control.classList.contains("is-open");
    closePersonPickers();
    if (!shouldOpen) return;
    closeCustomSelects();
    closeDatePickers();
    const input = control.querySelector("[data-person-input]");
    renderPersonSuggestions(control, input?.value || "");
  }

  function selectPersonOption(control, option) {
    const input = control.querySelector("[data-person-input]");
    if (input) {
      input.value = option.dataset.personValue || "";
      input.focus();
    }
    closePersonPickers();
  }

  function renderSelectControl(name, options, value = "", { label = "", className = "", required = true } = {}) {
    const normalizedOptions = options.map(option => Array.isArray(option)
      ? { value: String(option[0]), label: String(option[1]) }
      : { value: String(option), label: String(option) });
    const selected = normalizedOptions.find(option => option.value === String(value)) || normalizedOptions[0] || { value: "", label: "请选择" };
    const nameAttribute = name ? ` name="${escapeHtml(name)}"` : "";
    return `<span class="hp-select-control ${escapeHtml(className)}" data-select-control>
      <input class="hp-select__native" type="hidden"${nameAttribute} value="${escapeHtml(selected.value)}" data-required="${required}" />
      <button class="hp-select-trigger" type="button" data-select-trigger aria-haspopup="listbox" aria-expanded="false"${label ? ` aria-label="${escapeHtml(label)}"` : ""}>
        <span data-select-value>${escapeHtml(selected.label)}</span><i class="ph ph-caret-down" aria-hidden="true"></i>
      </button>
      <span class="hp-select-menu" role="listbox" hidden>
        ${normalizedOptions.map(option => `<button class="hp-select-option${option.value === selected.value ? " is-selected" : ""}" type="button" role="option" data-select-option data-select-value-option="${escapeHtml(option.value)}" aria-selected="${option.value === selected.value}"><span>${escapeHtml(option.label)}</span><i class="ph ph-check" aria-hidden="true"></i></button>`).join("")}
      </span>
    </span>`;
  }

  function closeCustomSelects() {
    document.querySelectorAll("[data-select-control].is-open").forEach(control => {
      control.classList.remove("is-open");
      control.querySelector("[data-select-trigger]")?.setAttribute("aria-expanded", "false");
      const menu = control.querySelector(".hp-select-menu");
      if (menu) menu.hidden = true;
    });
    activeSelectControl = null;
  }

  function toggleCustomSelect(control) {
    const shouldOpen = !control.classList.contains("is-open");
    closeCustomSelects();
    if (!shouldOpen) return;
    closeDatePickers();
    control.classList.add("is-open");
    control.querySelector("[data-select-trigger]")?.setAttribute("aria-expanded", "true");
    const menu = control.querySelector(".hp-select-menu");
    if (menu) menu.hidden = false;
    activeSelectControl = control;
  }

  function selectCustomOption(control, option) {
    const nativeSelect = control.querySelector(".hp-select__native");
    const selectedValue = option.dataset.selectValueOption ?? "";
    const selectedLabel = option.querySelector("span")?.textContent || selectedValue;
    if (nativeSelect) {
      nativeSelect.value = selectedValue;
      nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const value = control.querySelector("[data-select-value]");
    if (value) value.textContent = selectedLabel;
    control.querySelectorAll("[data-select-option]").forEach(item => {
      const selected = item === option;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-selected", String(selected));
    });
    closeCustomSelects();
  }

  function closeModal() {
    closeDatePickers();
    closeCustomSelects();
    closePersonPickers();
    modal.hidden = true;
    if (!detailDrawer.classList.contains("is-open") && confirmModal.hidden) document.body.style.overflow = "";
    recordForm.reset();
    editingId = null;
    lastFocusedElement?.focus?.();
  }

  function submitRecord(event) {
    event.preventDefault();
    const route = recordForm.dataset.route;
    const formData = Object.fromEntries(new FormData(recordForm));
    recordForm.querySelectorAll("[data-date-control]").forEach(control => {
      const displayInput = control.querySelector("[data-date-display]");
      if (displayInput?.name) formData[displayInput.name] = control.dataset.dateValue || "";
    });
    const recordId = recordForm.dataset.recordId;
    if (recordId) {
      const index = data[route].findIndex(row => row.id === recordId);
      if (index >= 0) data[route][index] = { ...data[route][index], ...formData, id: recordId };
    } else {
      formData.id = `${route.slice(0, 1).toUpperCase()}-${Date.now().toString().slice(-6)}`;
      data[route].unshift(formData);
    }
    if (route === "certificates") rememberPersonName(formData.person);
    saveData();
    closeModal();
    if (currentRoute === route) {
      if (FORM_MODULES[route]) renderFormModule(route);
      else renderModule(route);
    }
    showToast(recordId ? "更新成功" : "保存成功", `${moduleConfigs[route].title}记录已写入浏览器本地存储`);
  }

  function openDetail(route, recordId) {
    const config = moduleConfigs[route];
    const record = data[route]?.find(row => row.id === recordId);
    if (!config || !record) return;
    lastFocusedElement = document.activeElement;
    detailDrawer.dataset.route = route;
    detailDrawer.dataset.recordId = recordId;
    document.querySelector("#detailEyebrow").textContent = config.eyebrow;
    document.querySelector("#detailTitle").textContent = record[config.primary[0]] || config.title;
    const fieldLabels = new Map(config.fields.filter(field => field[0]).map(field => [field[0], field[1]]));
    const inspectionKeys = new Set(INSPECTION_ITEMS.map(item => item.key));
    const statusLikeKeys = new Set(["status", "conclusion", ...inspectionKeys]);
    const orderedKeys = config.fields.filter(field => field[0]).map(field => field[0]);
    const detailKeys = [...new Set([...orderedKeys, ...Object.keys(record)])].filter(key => key !== "id");
    const detailRows = config.fields.map(field => {
      if (field[2] === "heading") return `<div class="inspection-group"><span class="inspection-group__title">${escapeHtml(field[1])}</span></div>`;
      const key = field[0];
      if (!detailKeys.includes(key)) return "";
      const value = displayFieldValue(config, key, record[key]);
      const isStatusLike = statusLikeKeys.has(key);
      return `<div class="detail-field"><small>${escapeHtml(fieldLabels.get(key) || key)}</small>${isStatusLike ? `<span class="${statusClass(record[key])}" style="margin-top:7px">${escapeHtml(record[key])}</span>` : `<strong>${escapeHtml(value)}${key === "quantity" || key === "value" ? ` ${escapeHtml(record.unit || "")}` : ""}</strong>`}</div>`;
    }).join("");
    document.querySelector("#detailBody").innerHTML = `
      <div class="detail-hero"><span class="detail-hero__icon"><i class="ph ${config.icon}"></i></span><span><strong>${escapeHtml(record[config.primary[0]])}</strong><small>${escapeHtml(record[config.primary[1]] || record.id)}</small></span></div>
      <div class="detail-grid">${detailRows}</div>
      <div class="detail-note"><i class="ph ph-info"></i><span>编辑后会立即保存到当前浏览器，删除操作可在提示出现期间撤销。</span></div>`;
    detailBackdrop.hidden = false;
    detailDrawer.hidden = false;
    detailDrawer.removeAttribute("inert");
    detailDrawer.classList.add("is-open");
    detailDrawer.setAttribute("aria-hidden", "false");
    const printButton = document.querySelector("#printRecordButton");
    if (printButton) printButton.hidden = !printTemplates[route];
    document.body.style.overflow = "hidden";
    setTimeout(() => document.querySelector("#closeDetailButton").focus(), 0);
  }

  function closeDetail(restoreFocus = true) {
    if (!detailDrawer.classList.contains("is-open")) return;
    detailDrawer.classList.remove("is-open");
    detailDrawer.setAttribute("aria-hidden", "true");
    detailDrawer.setAttribute("inert", "");
    detailDrawer.hidden = true;
    detailBackdrop.hidden = true;
    if (modal.hidden && confirmModal.hidden) document.body.style.overflow = "";
    if (restoreFocus) lastFocusedElement?.focus?.();
  }

  // 打印当前详情记录:把记录填进方太原表版式,调起浏览器打印。
  const printArea = document.querySelector("#printArea");
  const printStyle = document.createElement("style");
  printStyle.id = "print-page-style";

  function printRecord() {
    const route = detailDrawer.dataset.route;
    const recordId = detailDrawer.dataset.recordId;
    const template = printTemplates[route];
    const record = data[route]?.find(row => row.id === recordId);
    if (!template || !record) return;
    // 动态注入 @page 方向(横向/纵向),@page 规则无法用类切换。
    printStyle.textContent = `@page { size: A4 ${template.landscape ? "landscape" : "portrait"}; margin: 12mm; }`;
    document.head.appendChild(printStyle);
    printArea.innerHTML = template.render(record);
    document.body.classList.add("is-printing");
    closeDetail(false);
    window.print();
  }

  function cleanupPrint() {
    if (!document.body.classList.contains("is-printing")) return;
    document.body.classList.remove("is-printing");
    printArea.innerHTML = "";
    printStyle.remove();
  }

  window.addEventListener("afterprint", cleanupPrint);

  function openDeleteConfirm(route, recordId, returnFocus = null) {
    const config = moduleConfigs[route];
    const record = data[route]?.find(row => row.id === recordId);
    if (!record) return;
    const recordName = route === "inspections"
      ? (record.toolName || record.toolRef || "未命名检查记录")
      : (record[config.primary[0]] || record[config.primary[1]] || "该记录");
    document.querySelector("#confirmTitle").textContent = "确认删除这条记录？";
    document.querySelector("#confirmMessage").textContent = `即将删除“${recordName}”。此操作需要确认，删除后仍可在提示出现期间撤销。`;
    confirmModal.dataset.route = route;
    confirmModal.dataset.recordId = recordId;
    confirmReturnFocus = returnFocus;
    confirmModal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => document.querySelector("#cancelDeleteButton").focus(), 0);
  }

  function requestDelete() {
    openDeleteConfirm(detailDrawer.dataset.route, detailDrawer.dataset.recordId, document.querySelector("#deleteRecordButton"));
  }

  function closeConfirm(restoreFocus = true) {
    confirmModal.hidden = true;
    if (modal.hidden && !detailDrawer.classList.contains("is-open")) document.body.style.overflow = "";
    if (restoreFocus) {
      if (detailDrawer.classList.contains("is-open")) document.querySelector("#deleteRecordButton").focus();
      else confirmReturnFocus?.focus?.();
    }
    confirmReturnFocus = null;
  }

  function confirmDelete() {
    const route = confirmModal.dataset.route;
    const recordId = confirmModal.dataset.recordId;
    const index = data[route]?.findIndex(row => row.id === recordId) ?? -1;
    if (index < 0) return closeConfirm();
    const [record] = data[route].splice(index, 1);
    lastDeleted = { route, record, index };
    if (formExpandedId === recordId) formExpandedId = null;
    if (inspectionSelectedId === recordId) inspectionSelectedId = null;
    saveData();
    closeConfirm(false);
    closeDetail(false);
    if (currentRoute === route) {
      if (FORM_MODULES[route]) renderFormModule(route);
      else renderModule(route);
    }
    showToast("记录已删除", "如有误操作，可以立即撤销", "撤销", undoDelete);
  }

  function undoDelete() {
    if (!lastDeleted) return;
    const { route, record, index } = lastDeleted;
    data[route].splice(index, 0, record);
    saveData();
    lastDeleted = null;
    if (currentRoute === route) {
      if (FORM_MODULES[route]) renderFormModule(route);
      else renderModule(route);
    }
    showToast("已经撤销", "删除的记录已恢复");
  }

  function renderSearchPanel() {
    const query = searchInput.value.trim().toLowerCase();
    let content;
    if (!query) {
      content = Object.entries(moduleConfigs).map(([route, config]) => `
        <button class="search-result" type="button" data-search-route="${route}">
          <span class="search-result__icon"><i class="ph ${config.icon}"></i></span>
          <span><strong>${escapeHtml(config.title)}</strong><small>${data[route].length} 条记录 · 快速进入模块</small></span>
          <i class="ph ph-arrow-right"></i>
        </button>`).join("");
    } else {
      const matches = [];
      Object.entries(moduleConfigs).forEach(([route, config]) => {
        data[route].forEach(record => {
          if (Object.values(record).some(value => String(value).toLowerCase().includes(query))) matches.push({ route, config, record });
        });
      });
      content = matches.slice(0, 8).map(({ route, config, record }) => `
        <button class="search-result" type="button" data-search-route="${route}" data-search-id="${escapeHtml(record.id)}">
          <span class="search-result__icon"><i class="ph ${config.icon}"></i></span>
          <span><strong>${highlightMatch(record[config.primary[0]], query)}</strong><small>${escapeHtml(config.title)} · ${escapeHtml(record[config.primary[1]] || record.status)}</small></span>
          <i class="ph ph-arrow-right"></i>
        </button>`).join("");
      if (!content) content = `<div class="search-empty"><i class="ph ph-magnifying-glass"></i>没有找到与“${escapeHtml(searchInput.value.trim())}”匹配的记录</div>`;
    }
    searchPanel.innerHTML = `<div class="search-panel__head"><span>${query ? "全局搜索结果" : "快速前往"}</span><kbd>ESC 关闭</kbd></div>${content}`;
    searchPanel.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  function highlightMatch(value, query) {
    const safe = escapeHtml(value);
    const index = String(value).toLowerCase().indexOf(query);
    if (index < 0) return safe;
    return `${escapeHtml(String(value).slice(0, index))}<mark>${escapeHtml(String(value).slice(index, index + query.length))}</mark>${escapeHtml(String(value).slice(index + query.length))}`;
  }

  function closeSearch() {
    searchPanel.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
  }

  function togglePopover(panel, button) {
    const shouldOpen = panel.hidden;
    closePopovers();
    closeSearch();
    if (shouldOpen) {
      panel.hidden = false;
      button.setAttribute("aria-expanded", "true");
    }
  }

  function closePopovers() {
    notificationPanel.hidden = true;
    helpPanel.hidden = true;
    document.querySelector("#notificationButton").setAttribute("aria-expanded", "false");
    document.querySelector("#helpButton").setAttribute("aria-expanded", "false");
  }

  function exportCurrent() {
    const route = currentRoute === "overview" ? "tools" : currentRoute;
    const config = moduleConfigs[route];
    const keys = config.columns.map(column => column[0]);
    const csv = [config.columns.map(column => csvValue(column[1])).join(","), ...data[route].map(row => keys.map(key => csvValue(row[key])).join(","))].join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.title}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("导出完成", `${config.title}数据已导出为 CSV`);
  }

  // Word 导出采用 Word 可直接打开的 HTML 文档格式(.doc),保留原表的黑框、合并列和分页。
  // 这样不依赖外部服务,在离线的净水工厂内网也能生成文件。
  const WORD_EXPORT_STYLES = `
    @page { margin: 12mm; }
    @page LandscapeSection { size: A4 landscape; margin: 10mm; }
    body { margin: 0; color: #000; background: #fff; font-family: "SimSun", "宋体", "Microsoft YaHei", serif; font-size: 10pt; line-height: 1.45; }
    .word-export-sheet { width: 100%; page-break-after: always; }
    .word-export-sheet:last-child, .print-sheet:last-child { page-break-after: auto; }
    .word-export-sheet--landscape { page: LandscapeSection; }
    .word-export-title, .print-sheet__title { margin: 0 0 12pt; text-align: center; }
    .word-export-title p, .print-sheet__title p { margin: 0; font-size: 11pt; }
    .word-export-title h1, .print-sheet__title h1 { margin: 3pt 0; font-size: 16pt; font-weight: 700; letter-spacing: 1pt; }
    .word-export-title .word-export-code, .print-sheet__title .print-sheet__code { margin-top: 1pt; font-size: 9pt; color: #333; }
    .word-export-table, .print-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .word-export-table th, .word-export-table td, .print-table th, .print-table td { border: 1px solid #000; padding: 5pt 6pt; vertical-align: middle; word-break: break-all; empty-cells: show; }
    .word-export-table th, .print-table__head { background: #f0f0f0; font-weight: 700; text-align: center; }
    .word-export-table td.center, .print-table__cell--center { text-align: center; }
    .print-sheet { width: 100%; page-break-after: always; }
    .print-table__label { background: #fafafa; font-weight: 700; text-align: center; }
    .print-table__band { background: #f0f0f0; font-weight: 700; text-align: center; letter-spacing: 2pt; }
    .print-table__cell--group { padding: 5pt 3pt; text-align: center; line-height: 1.35; }
    .print-sheet__sign { display: flex; gap: 42pt; padding: 10pt 6pt 0; font-size: 10pt; }
  `;

  function renderToolsWordExport(rows) {
    const records = Array.isArray(rows) ? rows : [];
    const rowCount = Math.max(16, records.length);
    const body = Array.from({ length: rowCount }, (_, index) => {
      const record = records[index] || {};
      const cells = [
        index + 1,
        record.code || "",
        record.name || "",
        record.model || "",
        record.dept || "",
        record.owner || "",
        formatDateValue(record.received, "date"),
        formatDateValue(record.scrapped, "date"),
        record.category || ""
      ];
      return `<tr>${cells.map((value, cellIndex) => `<td class="${cellIndex === 0 ? "center" : ""}">${escapeHtml(value)}</td>`).join("")}</tr>`;
    }).join("");
    return `
      <section class="word-export-sheet word-export-sheet--landscape">
        <header class="word-export-title">
          <p>宁波方太厨具有限公司</p>
          <h1>手持式电动工具台帐</h1>
          <p class="word-export-code">FT[通用]OT-ZD 317-03b</p>
        </header>
        <table class="word-export-table">
          <colgroup><col style="width:6%"><col style="width:10%"><col style="width:11%"><col style="width:15%"><col style="width:14%"><col style="width:9%"><col style="width:10%"><col style="width:12%"><col style="width:9%"></colgroup>
          <thead><tr>${["序号", "编 号", "名 称", "型 号", "使用部门", "责任人", "领用时间", "报废时间", "工具类别"].map(label => `<th>${label}</th>`).join("")}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </section>`;
  }

  function renderGenericWordExport(route, rows) {
    const config = moduleConfigs[route];
    const body = rows.length
      ? rows.map((record, index) => `<tr>${config.columns.map((column, columnIndex) => `<td class="${columnIndex === 0 ? "center" : ""}">${escapeHtml(displayFieldValue(config, column[0], record[column[0]]))}</td>`).join("")}<td class="center">${index + 1}</td></tr>`).join("")
      : `<tr><td colspan="${config.columns.length + 1}" class="center">暂无记录</td></tr>`;
    return `
      <section class="word-export-sheet">
        <header class="word-export-title"><h1>${escapeHtml(config.title)}</h1><p class="word-export-code">净水工厂 EHS 数据导出</p></header>
        <table class="word-export-table"><thead><tr>${config.columns.map(column => `<th>${escapeHtml(column[1])}</th>`).join("")}<th>序号</th></tr></thead><tbody>${body}</tbody></table>
      </section>`;
  }

  function buildWordExportDocument(body) {
    return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><meta name="ProgId" content="Word.Document"><title>净水工厂 EHS</title><style>${WORD_EXPORT_STYLES}</style></head><body>${body}</body></html>`;
  }

  function exportWordCurrent() {
    const route = currentRoute === "overview" ? "tools" : currentRoute;
    const config = moduleConfigs[route];
    if (!config) return;
    const rows = data[route] || [];
    const exportTitle = printTemplates[route]?.title || config.title;
    const body = route === "tools"
      ? renderToolsWordExport(rows)
      : route === "inspections"
        ? (rows.length ? rows.map(renderInspectionSheet).join("") : renderInspectionSheet({ id: "export-draft", toolName: "", toolRef: "", dept: "", manufacturer: "", model: "", serialNo: "", mfgDate: "", manageDept: "", category: "类", period: "6个月", inspector: "", date: "" }))
        : renderGenericWordExport(route, rows);
    const blob = new Blob(["\ufeff", buildWordExportDocument(body)], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportTitle}-${new Date().toISOString().slice(0, 10)}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Word 导出完成", `${exportTitle}已按原表导出为 Word 文件`);
  }

  function csvValue(value) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }

  function showToast(title, message, actionLabel = "", action = null) {
    clearTimeout(toastTimer);
    document.querySelector("#toastTitle").textContent = title;
    document.querySelector("#toastMessage").textContent = message;
    const toast = document.querySelector("#toast");
    toastActionHandler = action;
    toastAction.textContent = actionLabel;
    toastAction.hidden = !action;
    toast.hidden = false;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
      toastActionHandler = null;
      toastAction.hidden = true;
      setTimeout(() => { toast.hidden = true; }, 220);
    }, action ? 6000 : 2800);
  }

  pageContent.addEventListener("click", event => {
    const routeButton = event.target.closest("[data-route-go]");
    if (routeButton) { location.hash = routeButton.dataset.routeGo; return; }
    // 删除必须优先于整行打开，避免点击列表中的垃圾桶时误进入编辑页。
    const formDeleteBtn = event.target.closest("[data-form-delete]");
    if (formDeleteBtn) {
      openDeleteConfirm(currentRoute, formDeleteBtn.dataset.formDelete, formDeleteBtn);
      return;
    }
    const inspectionOpen = event.target.closest("[data-inspection-open]");
    if (inspectionOpen) {
      inspectionSelectedId = inspectionOpen.dataset.inspectionOpen;
      renderFormModule("inspections");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (event.target.closest("[data-inspection-back]")) {
      inspectionSelectedId = null;
      renderFormModule("inspections");
      return;
    }
    const inspectionNav = event.target.closest("[data-inspection-nav]");
    if (inspectionNav && inspectionSelectedId) {
      const selectedIndex = data.inspections.findIndex(row => row.id === inspectionSelectedId);
      const targetIndex = inspectionNav.dataset.inspectionNav === "previous" ? selectedIndex - 1 : selectedIndex + 1;
      if (data.inspections[targetIndex]) {
        inspectionSelectedId = data.inspections[targetIndex].id;
        renderFormModule("inspections");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    if (event.target.closest("[data-inspection-search-clear]")) {
      inspectionListQuery = "";
      renderFormModule("inspections");
      pageContent.querySelector("[data-inspection-search]")?.focus();
      return;
    }
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "add") openModal();
    if (action === "export-word") exportWordCurrent();
    if (action === "export" || action === "export-csv") exportCurrent();
    if (action === "form-add") { addFormRow(currentRoute); return; }
    if (action === "reset-filters") {
      currentStatus = "all";
      currentQuery = "";
      searchInput.value = "";
      searchClearButton.hidden = true;
      closeSearch();
      if (FORM_MODULES[currentRoute] && formViewMode === "form") renderFormModule(currentRoute);
      else renderModule(currentRoute);
    }
    // FORM_MODULES 的 tab 切换
    const formTab = event.target.closest("[data-form-tab]")?.dataset.formTab;
    if (formTab) {
      formViewMode = formTab;
      formExpandedId = null;
      renderFormModule(currentRoute);
      return;
    }
    // 台账填写视图:展开卡片为可编辑行
    const expandBtn = event.target.closest("[data-form-expand]");
    if (expandBtn) {
      formExpandedId = expandBtn.dataset.formExpand;
      renderFormModule(currentRoute);
      return;
    }
    // 折叠当前编辑行
    const collapseBtn = event.target.closest("[data-form-collapse]");
    if (collapseBtn) {
      formExpandedId = null;
      renderFormModule(currentRoute);
      return;
    }
    // 行内/卡片打印(填进方太原表)
    const printBtn = event.target.closest("[data-form-print]");
    if (printBtn) {
      const recordId = printBtn.dataset.formPrint;
      detailDrawer.dataset.route = currentRoute;
      detailDrawer.dataset.recordId = recordId;
      printRecord();
      return;
    }
    // 点卡片空白处也展开
    const card = event.target.closest("[data-form-card]");
    if (card) {
      formExpandedId = card.dataset.formCard;
      renderFormModule(currentRoute);
      return;
    }
    const task = event.target.closest(".task-check");
    if (task) {
      task.closest(".task-item").classList.toggle("is-done");
      showToast("任务状态已更新", "本周任务进度已同步到当前页面");
      return;
    }
    const view = event.target.closest("[data-row-view]");
    if (view) { openDetail(currentRoute, view.dataset.rowView); return; }
    const more = event.target.closest("[data-row-more]");
    if (more) { openDetail(currentRoute, more.dataset.rowMore); return; }
    const row = event.target.closest("tr[data-record-id]");
    if (row) openDetail(currentRoute, row.dataset.recordId);
  });

  pageContent.addEventListener("input", event => {
    const inspectionSearch = event.target.closest("[data-inspection-search]");
    if (inspectionSearch) {
      inspectionListQuery = inspectionSearch.value;
      if (event.isComposing) return;
      const caret = inspectionSearch.selectionStart;
      renderFormModule("inspections");
      const nextSearch = pageContent.querySelector("[data-inspection-search]");
      nextSearch?.focus();
      if (nextSearch && caret !== null) nextSearch.setSelectionRange(caret, caret);
      return;
    }
    const formInput = event.target.closest("[data-form-input]");
    if (formInput && FORM_MODULES[currentRoute]) saveFormInput(currentRoute, formInput.dataset.formInput, formInput);
  });

  pageContent.addEventListener("change", event => {
    // 台账填写视图:input 实时保存
    const formInput = event.target.closest("[data-form-input]");
    if (formInput) {
      saveFormInput(currentRoute, formInput.dataset.formInput, formInput);
      return;
    }
    // 检查信息折叠区的 select 也要保存
    const formSelect = event.target.closest(".form-cell-select [data-select-control] .hp-select__native, .form-extra-field [data-select-control] .hp-select__native");
    if (formSelect && FORM_MODULES[currentRoute]) {
      const record = data[currentRoute].find(row => row.id === formExpandedId);
      if (record && formSelect.name) {
        record[formSelect.name] = formSelect.value;
        saveData();
      }
      return;
    }
    if (event.target.id === "statusFilter" || event.target.closest(".filter-select-control")) {
      currentStatus = event.target.value;
      renderModule(currentRoute);
    }
  });

  // 日期控件在台账填写视图里选值后,同步保存到记录
  pageContent.addEventListener("click", event => {
    if (!FORM_MODULES[currentRoute] || formViewMode !== "form") return;
    const dayCell = event.target.closest("[data-date-day]");
    const monthCell = event.target.closest("[data-date-month]");
    const shortcut = event.target.closest("[data-date-shortcut]");
    if ((dayCell || monthCell || shortcut) && activeDateControl) {
      const control = activeDateControl;
      const name = control.querySelector("[data-date-display]")?.name;
      if (name) {
        setTimeout(() => {
          const recordId = control.closest("[data-form-row]")?.dataset.formRow || formExpandedId || "draft";
          const record = ensureFormRecord(currentRoute, recordId);
          if (record) { record[name] = control.dataset.dateValue || ""; saveData(); }
        }, 60);
      }
    }
  }, true);


  searchInput.addEventListener("input", event => {
    currentQuery = event.target.value.trim();
    searchClearButton.hidden = !currentQuery;
    renderSearchPanel();
    if (currentRoute !== "overview") renderModule(currentRoute);
  });

  searchInput.addEventListener("focus", renderSearchPanel);
  searchInput.addEventListener("click", renderSearchPanel);
  searchClearButton.addEventListener("click", event => {
    event.preventDefault();
    searchInput.value = "";
    currentQuery = "";
    searchClearButton.hidden = true;
    renderSearchPanel();
    if (currentRoute !== "overview") renderModule(currentRoute);
    searchInput.focus();
  });

  searchPanel.addEventListener("click", event => {
    const result = event.target.closest("[data-search-route]");
    if (!result) return;
    const route = result.dataset.searchRoute;
    const recordId = result.dataset.searchId;
    closeSearch();
    if (currentRoute === route) {
      currentQuery = "";
      searchInput.value = "";
      searchClearButton.hidden = true;
      renderModule(route);
      if (recordId) openDetail(route, recordId);
    } else {
      location.hash = route;
      if (recordId) setTimeout(() => openDetail(route, recordId), 80);
    }
  });

  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput.focus();
      renderSearchPanel();
    }
    if (event.key === "Escape") {
      if (activePersonControl) {
        closePersonPickers();
        return;
      }
      if (activeSelectControl) {
        closeCustomSelects();
        return;
      }
      if (activeDateControl) {
        closeDatePickers();
        return;
      }
      if (!confirmModal.hidden) closeConfirm();
      else if (!modal.hidden) closeModal();
      else if (detailDrawer.classList.contains("is-open")) closeDetail();
      else if (!searchPanel.hidden) closeSearch();
      else closePopovers();
      sidebar.classList.remove("is-open");
    }
  });

  document.querySelector("#quickAddButton").addEventListener("click", () => {
    if (FORM_MODULES[currentRoute]) addFormRow(currentRoute);
    else openModal();
  });
  document.querySelector("#closeModalButton").addEventListener("click", closeModal);
  document.querySelector("#cancelModalButton").addEventListener("click", closeModal);
  modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  recordForm.addEventListener("submit", submitRecord);
  recordForm.addEventListener("input", event => {
    const input = event.target.closest("[data-person-input]");
    if (input) renderPersonSuggestions(input.closest("[data-person-control]"), input.value);
  });
  recordForm.addEventListener("change", event => {
    const input = event.target.closest("[data-person-input]");
    if (input) rememberPersonName(input.value);
  });
  recordForm.addEventListener("focusin", event => {
    const input = event.target.closest("[data-person-input]");
    if (input && savedPeople.length && !input.closest("[data-person-control]")?.classList.contains("is-open")) renderPersonSuggestions(input.closest("[data-person-control]"), input.value);
  });
  document.querySelector("#closeDetailButton").addEventListener("click", () => closeDetail());
  detailBackdrop.addEventListener("click", () => closeDetail());
  document.querySelector("#editRecordButton").addEventListener("click", () => openModal(detailDrawer.dataset.route, detailDrawer.dataset.recordId));
  document.querySelector("#deleteRecordButton").addEventListener("click", requestDelete);
  document.querySelector("#printRecordButton").addEventListener("click", printRecord);
  document.querySelector("#cancelDeleteButton").addEventListener("click", closeConfirm);
  document.querySelector("#confirmDeleteButton").addEventListener("click", confirmDelete);
  confirmModal.addEventListener("click", event => { if (event.target === confirmModal) closeConfirm(); });
  toastAction.addEventListener("click", () => toastActionHandler?.());
  document.querySelector("#notificationButton").addEventListener("click", event => {
    event.stopPropagation();
    togglePopover(notificationPanel, event.currentTarget);
    event.currentTarget.classList.add("is-read");
  });
  document.querySelector("#helpButton").addEventListener("click", event => {
    event.stopPropagation();
    togglePopover(helpPanel, event.currentTarget);
  });
  document.querySelectorAll("[data-close-popover]").forEach(button => button.addEventListener("click", closePopovers));
  notificationPanel.addEventListener("click", event => {
    const notice = event.target.closest("[data-notice-route]");
    if (notice) { closePopovers(); location.hash = notice.dataset.noticeRoute; }
  });
  document.addEventListener("click", event => {
    if (!event.target.closest(".global-search")) closeSearch();
    if (!event.target.closest(".topbar__actions")) closePopovers();
  });
  document.querySelector("#menuButton").addEventListener("click", () => sidebar.classList.add("is-open"));
  document.querySelector("#sidebarScrim").addEventListener("click", () => sidebar.classList.remove("is-open"));
  document.addEventListener("click", event => {
    const personControl = event.target.closest("[data-person-control]");
    if (personControl) {
      const option = event.target.closest("[data-person-option]");
      if (option) {
        event.preventDefault();
        selectPersonOption(personControl, option);
        return;
      }
      if (event.target.closest("[data-person-trigger]")) {
        event.preventDefault();
        togglePersonPicker(personControl);
      }
      return;
    }
    closePersonPickers();
    const selectControl = event.target.closest("[data-select-control]");
    if (selectControl) {
      const option = event.target.closest("[data-select-option]");
      if (option) {
        event.preventDefault();
        selectCustomOption(selectControl, option);
        return;
      }
      if (event.target.closest("[data-select-trigger]")) {
        event.preventDefault();
        toggleCustomSelect(selectControl);
      }
      return;
    }
    closeCustomSelects();
    const dateControl = event.target.closest("[data-date-control]");
    const picker = event.target.closest(".date-picker");
    if (dateControl) {
      const shortcut = event.target.closest("[data-date-shortcut]");
      if (shortcut) {
        event.preventDefault();
        applyDateShortcut(dateControl, shortcut.dataset.dateShortcut);
        return;
      }
      if (event.target.closest("[data-date-trigger], [data-date-display]")) {
        event.preventDefault();
        toggleDatePicker(dateControl);
      }
      return;
    }
    if (picker) {
      const nav = event.target.closest("[data-date-nav]");
      if (nav) {
        event.preventDefault();
        shiftDateView(activeDateControl, Number(nav.dataset.dateNav));
        return;
      }
      const day = event.target.closest("[data-date-day]");
      const month = event.target.closest("[data-date-month]");
      if (day || month) {
        event.preventDefault();
        selectDateValue((day || month).dataset.dateDay || (day || month).dataset.dateMonth);
      }
      return;
    }
    closeDatePickers();
  });
  window.addEventListener("hashchange", navigate);
  window.addEventListener("resize", positionDatePicker);
  window.addEventListener("scroll", positionDatePicker, true);

  updateNavCounts();
  navigate();
})();
