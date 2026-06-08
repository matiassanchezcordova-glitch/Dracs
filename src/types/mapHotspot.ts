// TODO: este tipo debe pasar a database.types.ts cuando se regenere. Ver issue de pendientes S5.5.

export type PoolType = 'place' | 'random_all'

export type MapHotspot = {
  id: string
  label: string
  pool_type: PoolType
  place: string | null
  x_pct: number
  y_pct: number
  radius_pct: number
  display_order: number
  is_active: boolean
}
