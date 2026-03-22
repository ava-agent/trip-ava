import type { Destination } from '../../data/travelData';
import { destinations, foodRecommendations } from '../../data/travelData';

interface FoodRecommendation {
  reply: string;
  imageUrl: null;
}

interface DestinationRecommendation {
  reply: string;
  imageUrl: string | null;
  destination: Destination;
}

type RecommendationResult = FoodRecommendation | DestinationRecommendation | null;

export class RecommenderAgent {
    /**
     * Determine user intent based on message content
     */
    public getIntent(message: string): 'destination' | 'food' | 'general' {
        const text = message.toLowerCase();
        if (text.includes('吃') || text.includes('美食') || text.includes('食物')) {
            return 'food';
        }
        if (text.includes('去哪') || text.includes('推荐') || text.includes('景点') || text.includes('玩')) {
            return 'destination';
        }
        return 'general';
    }

    /**
     * Recommend destinations based on keywords
     */
    public recommendDestinations(message: string): RecommendationResult {
        const intent = this.getIntent(message);

        if (intent === 'food') {
            const food = foodRecommendations[Math.floor(Math.random() * foodRecommendations.length)];
            return {
                reply: `关于美食，我强烈推荐您尝试当地的特色小吃：${food.name}。${food.description}除此之外，过桥米线和鲜花饼也是不可错过的美味！`,
                imageUrl: null,
            };
        }

        if (intent === 'destination') {
            // Very simple keyword matching
            let match = destinations.find(d => message.includes(d.name) || message.includes(d.id));

            if (!match) {
                // Random if no specific match
                match = destinations[Math.floor(Math.random() * destinations.length)];
            }

            return {
                reply: `根据您的描述，我推荐您去${match.name}看看。${match.description}那里非常适合${match.tags.join('、')}。`,
                imageUrl: match.imageUrl,
                destination: match
            };
        }

        return null;
    }
}
