// The replication checkpoint for the "cards" pull (see
// internal/serve/replication.go's cardCheckpoint). Both fields are
// needed because several cards can share the same "updated" value;
// the id breaks the tie.
export interface CardCheckpoint {
  updatedAt: string;
  id: string;
}
