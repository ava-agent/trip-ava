import { AnimatedAvatar } from '../ui/AnimatedAvatar'

interface WelcomeScreenProps {
    onPromptClick: (prompt: string) => void;
}

export function WelcomeScreen({ onPromptClick }: WelcomeScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {/* Large Animated AVA Avatar */}
            <div className="mb-8">
                <AnimatedAvatar
                    state="idle"
                    size="xl"
                    showGlow
                />
            </div>

            {/* Welcome Text */}
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                我是 AVA
            </h1>
            <p className="text-base text-gray-500 mb-10">
                您的 AI 旅行向导
            </p>

            {/* Suggested Prompts - Minimal */}
            <div className="flex flex-col gap-2 max-w-md w-full">
                <button
                    onClick={() => onPromptClick('推荐云南的旅行目的地')}
                    className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors text-sm cursor-pointer"
                >
                    推荐云南的旅行目的地
                </button>
                <button
                    onClick={() => onPromptClick('规划5天云南行程')}
                    className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors text-sm cursor-pointer"
                >
                    规划5天云南行程
                </button>
                <button
                    onClick={() => onPromptClick('云南有什么特色美食')}
                    className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors text-sm cursor-pointer"
                >
                    云南特色美食
                </button>
            </div>
        </div>
    )
}
