export type Language = 'zh-CN' | 'en-US'

export interface Translations {
  // Common
  appName: string
  welcome: string
  loading: string
  error: string
  retry: string
  cancel: string
  confirm: string
  delete: string
  save: string
  close: string
  search: string

  // Auth
  login: string
  loginTitle: string
  loginSubtitle: string
  register: string
  registerTitle: string
  registerSubtitle: string
  username: string
  password: string
  email: string
  displayName: string
  noAccount: string
  hasAccount: string
  logout: string
  logoutConfirm: string

  // Chat
  chatPlaceholder: string
  send: string
  voiceInput: string
  startRecording: string
  stopRecording: string
  newConversation: string
  conversationHistory: string
  noConversations: string
  noMessages: string
  typing: string
  thinking: string
  speaking: string
  online: string

  // AVA
  avaTitle: string
  avaSubtitle: string
  avaWelcome: string

  // Settings
  settings: string
  language: string
  theme: string
  voiceEnabled: string
  notifications: string

  // Errors
  loginFailed: string
  registerFailed: string
  messageSendFailed: string
  networkError: string
}

const translations: Record<Language, Translations> = {
  'zh-CN': {
    // Common
    appName: 'AVA',
    welcome: '欢迎',
    loading: '加载中...',
    error: '出错了',
    retry: '重试',
    cancel: '取消',
    confirm: '确定',
    delete: '删除',
    save: '保存',
    close: '关闭',
    search: '搜索',

    // Auth
    login: '登录',
    loginTitle: '欢迎回来',
    loginSubtitle: '登录您的 AVA 账号',
    register: '注册',
    registerTitle: '创建账号',
    registerSubtitle: '注册 AVA 账号开始使用',
    username: '用户名',
    password: '密码',
    email: '邮箱',
    displayName: '显示名称',
    noAccount: '还没有账号？',
    hasAccount: '已有账号？',
    logout: '退出登录',
    logoutConfirm: '确定要退出登录吗？',

    // Chat
    chatPlaceholder: '和 AVA 聊聊...',
    send: '发送',
    voiceInput: '语音输入',
    startRecording: '开始录音',
    stopRecording: '停止录音',
    newConversation: '新建对话',
    conversationHistory: '对话历史',
    noConversations: '暂无对话',
    noMessages: '暂无消息',
    typing: '输入中...',
    thinking: '思考中...',
    speaking: '正在回复...',
    online: '在线',

    // AVA
    avaTitle: '我是 AVA',
    avaSubtitle: '您的 AI 旅行向导',
    avaWelcome: '您好！我是 AVA，您的专属 AI 旅行向导。我可以帮您规划行程、推荐景点、介绍美食。请问有什么可以帮您的？',

    // Settings
    settings: '设置',
    language: '语言',
    theme: '主题',
    voiceEnabled: '启用语音',
    notifications: '通知',

    // Errors
    loginFailed: '登录失败',
    registerFailed: '注册失败',
    messageSendFailed: '发送消息失败',
    networkError: '网络错误，请检查连接',
  },

  'en-US': {
    // Common
    appName: 'AVA',
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    save: 'Save',
    close: 'Close',
    search: 'Search',

    // Auth
    login: 'Sign In',
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Sign in to your AVA account',
    register: 'Sign Up',
    registerTitle: 'Create Account',
    registerSubtitle: 'Sign up to start using AVA',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    displayName: 'Display Name',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',

    // Chat
    chatPlaceholder: 'Chat with AVA...',
    send: 'Send',
    voiceInput: 'Voice Input',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    newConversation: 'New Chat',
    conversationHistory: 'Chat History',
    noConversations: 'No conversations yet',
    noMessages: 'No messages yet',
    typing: 'Typing...',
    thinking: 'Thinking...',
    speaking: 'Responding...',
    online: 'Online',

    // AVA
    avaTitle: "I'm AVA",
    avaSubtitle: 'Your AI Travel Guide',
    avaWelcome: "Hi! I'm AVA, your personal AI travel guide. I can help you plan trips, recommend destinations, and introduce local cuisine. How can I assist you today?",

    // Settings
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    voiceEnabled: 'Enable Voice',
    notifications: 'Notifications',

    // Errors
    loginFailed: 'Login failed',
    registerFailed: 'Registration failed',
    messageSendFailed: 'Failed to send message',
    networkError: 'Network error, please check your connection',
  },
}

// Default language
export const DEFAULT_LANGUAGE: Language = 'zh-CN'

// Get translations for a language
export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations[DEFAULT_LANGUAGE]
}

// Get all available languages
export function getAvailableLanguages(): { code: Language; name: string }[] {
  return [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'en-US', name: 'English' },
  ]
}

// Detect browser language
export function detectBrowserLanguage(): Language {
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) {
    return 'zh-CN'
  }
  if (browserLang.startsWith('en')) {
    return 'en-US'
  }
  return DEFAULT_LANGUAGE
}
