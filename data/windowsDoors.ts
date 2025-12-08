// Window and door options from Menards
export type OpeningOption = {
  id: string;
  type: 'window' | 'door';
  width: number;
  height: number;
  name: string;
  price: number;
};

export const windowOptions: OpeningOption[] = [
  { id: 'w1', type: 'window', width: 2, height: 2, name: '2x2 Window', price: 150 },
  { id: 'w2', type: 'window', width: 3, height: 2, name: '3x2 Window', price: 200 },
  { id: 'w3', type: 'window', width: 4, height: 3, name: '4x3 Window', price: 280 },
  { id: 'w4', type: 'window', width: 5, height: 3, name: '5x3 Window', price: 350 },
];

export const doorOptions: OpeningOption[] = [
  { id: 'd1', type: 'door', width: 3, height: 7, name: '3x7 Walk Door', price: 450 },
  { id: 'd2', type: 'door', width: 4, height: 7, name: '4x7 Walk Door', price: 550 },
  { id: 'd3', type: 'door', width: 10, height: 10, name: '10x10 Overhead Door', price: 1200 },
  { id: 'd4', type: 'door', width: 12, height: 12, name: '12x12 Overhead Door', price: 1500 },
  { id: 'd5', type: 'door', width: 14, height: 14, name: '14x14 Overhead Door', price: 1800 },
  { id: 'd6', type: 'door', width: 16, height: 14, name: '16x14 Overhead Door', price: 2100 },
];

export const allOpenings: OpeningOption[] = [...windowOptions, ...doorOptions];

