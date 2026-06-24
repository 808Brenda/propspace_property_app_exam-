/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  email: string;
  contactNumber?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type PropertyType = 'Apartment' | 'House' | 'Studio';
export type PropertyPurpose = 'rent' | 'sale';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number; // in XAF (FCFA)
  location: string; // e.g. "Douala", "Yaounde", "Limbe", "Bafoussam"
  type: PropertyType;
  purpose: PropertyPurpose;
  imageUrls: string[];
  authorId: string;
  authorName: string;
  authorPhone?: string;
  authorAvatar?: string;
  createdAt: string;
  isRentedOrSold: boolean;
}

export interface Payment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  amount: number;
  payerId: string;
  payerName: string;
  payerEmail: string;
  date: string;
  status: 'success' | 'failed';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
  isGroundingUsed?: boolean;
  groundingSources?: { title: string; uri: string }[];
}
