export interface ScopeInput {
  document_ids?: string[];
  collection_id?: string;
  conversation_id?: string;
}

export interface NormalizedScope {
  document_ids?: string[];
  collection_id?: string;
}

export function validateScope(input: ScopeInput): NormalizedScope {
  const document_ids = input.document_ids?.filter(Boolean);
  const normalizedDocumentIds = document_ids && document_ids.length > 0 ? document_ids : undefined;

  if (normalizedDocumentIds && input.collection_id) {
    throw new Error('document_ids and collection_id cannot be used together');
  }

  if (input.conversation_id && (normalizedDocumentIds || input.collection_id)) {
    throw new Error('document_ids and collection_id must be omitted when conversation_id is provided');
  }

  return {
    document_ids: normalizedDocumentIds,
    collection_id: input.collection_id,
  };
}
