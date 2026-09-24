import { localIso } from './format';

const today = new Date();
const d = (n) => {
  const x = new Date(today);
  x.setDate(x.getDate() + n);
  return localIso(x);
};

export const demoBook = {
  trip: {
    id: 'demo', title: 'Our First Travelling Abroad', subtitle: 'Melbourne · Thailand · Brisbane',
    start_date: d(0), end_date: d(14), home_currency: 'AUD', budget: 2400,
  },
  travellers: [
    { id: 'me', name: 'You', initial: 'Y' },
    { id: 'alex', name: 'Alex', initial: 'A' },
  ],
  stops: [
    { id: 's1', day: 1, time: '08:30', duration: '1h', title: 'Gertrude St coffee', note: 'the flat white everyone talks about', planned: 18, travel: '6 min walk', photo_url: 'https://picsum.photos/seed/gertrude/200/160', maps_query: 'Gertrude St Fitzroy', sort: 1 },
    { id: 's2', day: 1, time: '11:00', duration: '2h', title: 'NGV Australia', note: 'impressionists wing', planned: 0, travel: '12 min tram', photo_url: '', maps_query: 'NGV Australia', sort: 2 },
    { id: 's3', day: 1, time: '13:30', duration: '1h', title: 'Lunch, Chinatown', note: '', planned: 50, travel: '9 min walk', photo_url: '', maps_query: 'Chinatown Melbourne', sort: 3 },
    { id: 's4', day: 1, time: '18:30', duration: '2h', title: 'Rooftop dinner', note: 'booked for two, 6:30', planned: 120, travel: '15 min tram', photo_url: '', maps_query: 'Rooftop bar Melbourne', sort: 4 },
    { id: 's5', day: 3, time: '09:00', duration: '2h', title: 'Queen Victoria Market', note: 'breakfast & flowers', planned: 34, travel: '10 min tram', photo_url: '', maps_query: 'Queen Victoria Market Melbourne', sort: 1 },
    { id: 's6', day: 3, time: '12:30', duration: '3h', title: 'Great Ocean Road drive', note: 'pack snacks', planned: 150, travel: 'car', photo_url: 'https://picsum.photos/seed/greatocean/200/160', maps_query: 'Great Ocean Road', sort: 2 },
    { id: 's7', day: 3, time: '17:45', duration: '1h', title: 'Twelve Apostles at sunset', note: '', planned: 20, travel: '5 min walk', photo_url: '', maps_query: 'Twelve Apostles Victoria', sort: 3 },
    { id: 's8', day: 5, time: '14:00', duration: '1h', title: 'Krabi guesthouse check-in', note: '', planned: 78, travel: 'taxi', photo_url: '', maps_query: 'Ao Nang Krabi', sort: 1 },
    { id: 's9', day: 5, time: '19:00', duration: '2h', title: 'Night market dinner', note: 'the one by the pier', planned: 21, travel: '8 min walk', photo_url: 'https://picsum.photos/seed/krabimarket/200/160', maps_query: 'Krabi night market', sort: 2 },
    { id: 's10', day: 6, time: '08:00', duration: '6h', title: 'Longtail boat, 4 islands', note: '', planned: 31, travel: 'boat', photo_url: 'https://picsum.photos/seed/railay/200/160', maps_query: 'Railay Beach Krabi', sort: 1 },
    { id: 's11', day: 11, time: '10:30', duration: '2h', title: 'South Bank walk', note: 'coffee on the river', planned: 24, travel: '12 min ferry', photo_url: 'https://picsum.photos/seed/southbank/200/160', maps_query: 'South Bank Brisbane', sort: 1 },
  ],
  expenses: [
    { id: 'e1', stop_id: 's1', day: 1, title: 'Gertrude St coffee', category: 'cafe', amount: 18, currency: 'AUD', rate: 1, paid_by: 'me', split: 'even', method: 'card', occurred_at: new Date().toISOString() },
    { id: 'e2', stop_id: 's3', day: 1, title: 'Lunch, Chinatown', category: 'food', amount: 46, currency: 'AUD', rate: 1, paid_by: 'alex', split: 'even', method: 'card', occurred_at: new Date().toISOString() },
  ],
};
