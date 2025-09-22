export enum PartStatus {
  IN_STOCK = 'in_stock',
  CLAIMED = 'claimed',
  COLLECTED = 'collected',
  DEFECTIVE = 'defective',
}

export enum DeviceStatus {
  IN_USE = 'in_use',
  UNDER_REPAIR = 'under_repair',
  RETIRED = 'retired',
}

export enum TonerColor {
  BLACK = 'black',
  CYAN = 'cyan',
  MAGENTA = 'magenta',
  YELLOW = 'yellow',
}

export enum InventoryTransactionType {
  CLAIM = 'claim',
  COLLECT = 'collect',
  ADD = 'add',
}

export enum InventoryItemType {
  PART = 'part',
  DEVICE = 'device',
  TONER = 'toner',
}
