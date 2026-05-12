
export type Language = 'en' | 'zh';

export const translations = {
  en: {
    title: 'Vault',
    searchPlaceholder: 'Search by title, tag, or description...',
    newLink: 'New Link',
    categories: 'Categories',
    savedResources: 'Saved Resources',
    manageResources: 'Manage your personal collection of curated web links.',
    results: 'Results',
    noLinks: 'No links found',
    noLinksSub: 'Your digital archive is waiting for its first entry.',
    noLinksSearch: 'Try refining your search or category.',
    createLink: 'Create Link',
    synced: 'Synced Local',
    encryption: 'Storage Encryption Active',
    proTip: 'Pro Tip',
    proTipDesc: 'Your vault is end-to-end local. Data never leaves your browser storage.',
    edit: 'Edit Link',
    add: 'Add New Link',
    titleLabel: 'Title',
    urlLabel: 'URL',
    descLabel: 'Description',
    categoryLabel: 'Category',
    saveBtn: 'Save Secret Link',
    updateBtn: 'Update Link',
    quickSave: 'Quick Save',
    addLink: 'Add Link',
    confirmDelete: 'Are you sure you want to delete this link?',
    allLinks: 'All Links',
    catDesign: 'Design',
    catAI: 'AI Tools',
    catClient: 'Client Work',
    catInspiration: 'Inspiration',
    catLearning: 'Learning',
    catOther: 'Other',
    deleteBtn: 'Delete',
    cancelBtn: 'Cancel',
    historyTitle: 'History Vault',
    historyDesc: 'Recently deleted links. You can restore them or permanently delete them.',
    restoreBtn: 'Restore',
    permanentDeleteBtn: 'Permanent Delete',
    noHistory: 'History is empty',
    noHistorySub: 'Deleted links will appear here for recovery.',
    historyBtn: 'History',
    importExport: 'Data Management',
    exportBtn: 'Export JSON',
    importBtn: 'Import JSON',
    importSuccess: 'Data imported successfully!',
    importError: 'Failed to import data. Invalid file format.',
    settings: 'Settings'
  },
  zh: {
    title: '库',
    searchPlaceholder: '搜索标题、标签或描述...',
    newLink: '添加链接',
    categories: '分类',
    savedResources: '已保存资源',
    manageResources: '管理您的个人网页链接收藏。',
    results: '个搜索结果',
    noLinks: '未找到链接',
    noLinksSub: '您的数字档案正在等待第一个条目。',
    noLinksSearch: '尝试调整搜索关键词或分类。',
    createLink: '创建链接',
    synced: '已同步至本地',
    encryption: '存储加密已启用',
    proTip: '小贴士',
    proTipDesc: '您的保管库是端到端本地化的。数据永远不会离开您的浏览器存储。',
    edit: '编辑链接',
    add: '添加新链接',
    titleLabel: '标题',
    urlLabel: '链接地址',
    descLabel: '描述',
    categoryLabel: '分类',
    saveBtn: '确认保存',
    updateBtn: '更新链接',
    quickSave: '快速保存',
    addLink: '添加链接',
    confirmDelete: '您确定要删除此链接吗？',
    allLinks: '全部链接',
    catDesign: '设计',
    catAI: 'AI 工具',
    catClient: '客户工作',
    catInspiration: '灵感',
    catLearning: '学习',
    catOther: '其他',
    deleteBtn: '删除',
    cancelBtn: '取消',
    historyTitle: '历史库',
    historyDesc: '最近删除的链接。您可以恢复它们或永久删除。',
    restoreBtn: '恢复',
    permanentDeleteBtn: '永久删除',
    noHistory: '历史记录为空',
    noHistorySub: '删除的链接将显示在这里以便恢复。',
    historyBtn: '历史记录',
    importExport: '数据管理',
    exportBtn: '导出数据',
    importBtn: '导入数据',
    importSuccess: '数据导入成功！',
    importError: '导入失败，文件格式不正确。',
    settings: '设置'
  }
};

export function getCategoryName(category: string, language: Language): string {
  const t = translations[language];
  switch (category) {
    case 'Design': return t.catDesign;
    case 'AI Tools': return t.catAI;
    case 'Client Work': return t.catClient;
    case 'Inspiration': return t.catInspiration;
    case 'Learning': return t.catLearning;
    case 'Other': return t.catOther;
    case 'All': return t.allLinks;
    default: return category;
  }
}
