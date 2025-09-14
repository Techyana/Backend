/**
 * Enum for part status in inventory workflow.
 */
export enum PartStatus {
  AVAILABLE = 'available',
  USED = 'used',
  REQUESTED = 'requested',
  PENDING_COLLECTION = 'pending_collection',
  COLLECTED = 'collected',
}
