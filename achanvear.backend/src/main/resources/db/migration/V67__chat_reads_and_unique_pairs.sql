ALTER TABLE chat_messages ADD COLUMN read_at TIMESTAMPTZ;
-- Preserve messages if both initiators previously created separate conversations.
CREATE TEMP TABLE conversation_duplicates ON COMMIT DROP AS
SELECT id, first_value(id) OVER (PARTITION BY LEAST(company_id, freelancer_id), GREATEST(company_id, freelancer_id)
ORDER BY created_at, id) AS canonical_id FROM chat_conversations;
UPDATE chat_messages m SET conversation_id = d.canonical_id FROM conversation_duplicates d
WHERE m.conversation_id = d.id AND d.id <> d.canonical_id;
DELETE FROM chat_conversations c USING conversation_duplicates d WHERE c.id = d.id AND d.id <> d.canonical_id;
CREATE UNIQUE INDEX chat_conversation_pair_unique ON chat_conversations
(LEAST(company_id, freelancer_id), GREATEST(company_id, freelancer_id));
CREATE INDEX chat_unread_messages ON chat_messages(conversation_id, sender_id) WHERE read_at IS NULL;
