export interface User {
  id: string
  name: string
  email: string
  points: number
  level: 'iniciante' | 'colaborador' | 'verificado' | 'especialista' | 'embaixador'
}

export interface Product {
  id: string
  name: string
  category: string
  barcode?: string
  unit: string
}

export interface Market {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
}

export interface Price {
  id: string
  productId: string
  marketId: string
  value: number
  registeredAt: string
}

export interface Contribution {
  id: string
  userId: string
  type: 'qr_code' | 'manual' | 'confirm'
  productId: string
  marketId: string
  price: number
  status: 'pending' | 'approved' | 'rejected'
  points: number
  createdAt: string
}

export interface ShoppingList {
  id: string
  userId: string
  name: string
  isActive: boolean
  createdAt: string
}

export interface ListItem {
  productId: string
  name: string
  quantity: number
  isChecked: boolean
  avgPrice?: number
  cheapestMarket?: Pick<Market, 'id' | 'name'>
}

export interface Badge {
  id: string
  userId: string
  badgeType: string
  earnedAt: string
}

export interface Promotion {
  id: string
  marketId: string
  productId: string
  price: number
  validUntil: string
}

export type UserLevel = User['level']
export type ContributionType = Contribution['type']
export type ContributionStatus = Contribution['status']
