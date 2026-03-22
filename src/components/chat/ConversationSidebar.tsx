import { useEffect, useState } from 'react'
import { useChatHistoryStore } from '@/store/chatHistoryStore'
import { useAuthStore } from '@/store/authStore'
import { MessageSquare, Plus, Trash2, Search, X } from 'lucide-react'

export function ConversationSidebar() {
  const { user } = useAuthStore()
  const {
    conversations,
    currentConversationId,
    isLoading,
    searchResults,
    loadConversations,
    createConversation,
    deleteConversation,
    setCurrentConversationId,
    searchConversations,
    clearSearch,
  } = useChatHistoryStore()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Handle search
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    if (keyword.trim()) {
      searchConversations(keyword)
    } else {
      clearSearch()
    }
  }

  // Handle create new conversation
  const handleCreateConversation = async () => {
    try {
      const id = await createConversation('New Conversation')
      setCurrentConversationId(id)
    } catch (err) {
      console.error('Failed to create conversation:', err)
    }
  }

  // Handle delete conversation
  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('确定要删除这个对话吗？')) return

    setDeletingId(id)
    try {
      await deleteConversation(id)
    } catch (err) {
      console.error('Failed to delete conversation:', err)
    } finally {
      setDeletingId(null)
    }
  }

  // Display list (search results or all conversations)
  const displayList = searchKeyword.trim() && searchResults.length > 0
    ? searchResults
    : conversations

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">对话历史</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="搜索"
            >
              <Search className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleCreateConversation}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="新建对话"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search Box */}
        {showSearch && (
          <div className="relative">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索对话..."
              className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {searchKeyword && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchKeyword ? '未找到匹配的对话' : '暂无对话'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayList.map((conversation) => (
              <div
                key={conversation.conversationId}
                onClick={() => setCurrentConversationId(conversation.conversationId)}
                className={`group p-3 cursor-pointer transition-colors ${
                  currentConversationId === conversation.conversationId
                    ? 'bg-blue-50 border-l-3 border-blue-500'
                    : 'hover:bg-gray-100 border-l-3 border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {conversation.lastMessagePreview || '暂无消息'}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">
                        {formatDate(conversation.updatedAt)}
                      </span>
                      {conversation.messageCount > 0 && (
                        <span className="text-xs text-gray-400">
                          {conversation.messageCount} 条消息
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteConversation(e, conversation.conversationId)}
                    disabled={deletingId === conversation.conversationId}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                    title="删除"
                  >
                    {deletingId === conversation.conversationId ? (
                      <div className="animate-spin w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full" />
                    ) : (
                      <Trash2 className="w-3 h-3 text-red-500" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {conversations.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-xs text-gray-500">
          共 {conversations.length} 个对话
        </div>
      )}
    </div>
  )
}
