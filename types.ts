export enum Unit {
  NOS = 'Nos',
  SQFT = 'Sq.Ft',
  RFT = 'R.Ft',
  MTR = 'Mtr',
  SET = 'Set'
}

export interface LineItem {
  id: string;
  category: string; // e.g., "Kitchen Base Units", "Master Wardrobe"
  name: string;
  description: string;
  dimensions?: {
    length: number;
    height: number;
    depth: number;
  };
  quantity: number;
  unit: Unit;
  rate: number;
  amount: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Quotation {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  customer: Customer;
  items: LineItem[];
  subtotal: number;
  taxRate: number; // Percentage
  taxAmount: number;
  discount: number;
  total: number;
  notes: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Paid';
}

export const EMPTY_CUSTOMER: Customer = {
  name: '',
  email: '',
  phone: '',
  address: ''
};

export const EMPTY_ITEM: LineItem = {
  id: '',
  category: 'General',
  name: '',
  description: '',
  quantity: 1,
  unit: Unit.NOS,
  rate: 0,
  amount: 0
};