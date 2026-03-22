import type { Route } from '../../data/travelData';
import { routes } from '../../data/travelData';

interface RouteRecommendation {
  reply: string;
  route: Route;
}

export class BookingAgent {
    /**
     * Check if the user is asking about routes or booking
     */
    public isBookingIntent(message: string): boolean {
        const text = message.toLowerCase();
        return text.includes('行程') || text.includes('路线') || text.includes('规划') || text.includes('多少钱');
    }

    /**
     * Recommend a route
     */
    public recommendRoute(message: string): RouteRecommendation {
        // Simple logic: if '5天' or '经典' -> classic route, else random
        let route = routes.find(r => message.includes(r.name) || (message.includes('5天') && r.days === 5));

        if (!route) {
            route = routes[Math.floor(Math.random() * routes.length)];
        }

        return {
            reply: `我为您规划了一条${route.name}：${route.description} 行程涵盖：${route.stops.join(' -> ')}。预计费用约为 ${route.price} 元。您觉得这个安排怎么样？`,
            route: route
        };
    }
}
