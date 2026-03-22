import { useI18nStore } from '@/store/i18nStore'
import { getAvailableLanguages, Language } from '@/i18n'
import { Globe, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18nStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const languages = getAvailableLanguages()
  const currentLang = languages.find((l: { code: Language }) => l.code === language)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (code: string) => {
    setLanguage(code as 'zh-CN' | 'en-US')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="切换语言 / Switch Language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLang?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {languages.map((lang: { code: Language; name: string }) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
            >
              <span className={language === lang.code ? 'text-blue-600 font-medium' : 'text-gray-700'}>
                {lang.name}
              </span>
              {language === lang.code && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
