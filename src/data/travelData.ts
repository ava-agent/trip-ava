/**
 * Trip-AVA Travel Data
 * Structured data for destinations, routes, and recommendations
 */

export interface Destination {
  id: string;
  name: string;
  description: string;
  tags: string[];
  imageUrl: string;
  bestSeason: string[];
}

export interface Route {
  id: string;
  name: string;
  days: number;
  description: string;
  stops: string[];
  price: number;
}

export const destinations: Destination[] = [
  {
    id: 'dali',
    name: '大理古城',
    description: '大理古城位于风光秀丽的苍山脚下，是古代南诏国和大理国的都城。这里有古老的城墙、独特的白族建筑和悠闲的生活氛围。',
    tags: ['古城', '文化', '历史', '休闲'],
    imageUrl: '/images/destinations/dali_ancient_city.jpg',
    bestSeason: ['Spring', 'Autumn'],
  },
  {
    id: 'lijiang',
    name: '丽江古城',
    description: '丽江古城又名大研镇，是茶马古道上著名的城镇之一。小桥流水人家，纳西风情浓郁，是世界文化遗产。',
    tags: ['古城', '夜生活', '浪漫', '世界遗产'],
    imageUrl: '/images/destinations/lijiang_ancient_city.jpg',
    bestSeason: ['All'],
  },
  {
    id: 'shangrila',
    name: '香格里拉',
    description: '香格里拉意为"心中的日月"，这里有神圣的雪山、幽深的峡谷、飞舞的瀑布、被森林环绕的宁静的湖泊。',
    tags: ['自然', '藏族文化', '雪山', '徒步'],
    imageUrl: '/images/destinations/shangri_la.jpg',
    bestSeason: ['Summer', 'Autumn'],
  },
  {
    id: 'erhai',
    name: '洱海',
    description: '洱海是大理“风花雪月”四景之一“洱海月”之所在。湖水清澈见底，被称作“群山间的无瑕美玉”。',
    tags: ['自然', '湖泊', '摄影', '骑行'],
    imageUrl: '/images/destinations/erhai_lake.jpg',
    bestSeason: ['Spring', 'Winter'],
  },
];

export const routes: Route[] = [
  {
    id: 'classic-yunnan',
    name: '云南经典5日游',
    days: 5,
    description: '大理-丽江-香格里拉经典线路，体验云南风花雪月与高原风情。',
    stops: ['大理古城', '洱海', '双廊', '丽江古城', '玉龙雪山'],
    price: 2680,
  },
  {
    id: 'leisure-dali',
    name: '大理深度休闲3日游',
    days: 3,
    description: '慢节奏游览大理，环洱海骑行，在这个"风花雪月"的地方发发呆。',
    stops: ['大理古城', '喜洲古镇', '海舌公园', '双廊'],
    price: 1280,
  },
];

export const foodRecommendations = [
  { name: '过桥米线', description: '云南最著名的特色小吃，汤鲜味美。' },
  { name: '鲜花饼', description: '以食用玫瑰花为馅的酥饼，香甜可口。' },
  { name: '烤乳扇', description: '大理白族特色风味小吃，奶香浓郁。' },
  { name: '酸菜鱼', description: '酸辣开胃，鱼肉鲜嫩。' },
];
