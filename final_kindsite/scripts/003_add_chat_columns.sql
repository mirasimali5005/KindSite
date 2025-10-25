-- Add new columns to chat_messages table for enhanced functionality

-- Add user_instructions column to store recurring accessibility preferences
ALTER TABLE chat_messages
ADD COLUMN user_instructions text;

-- Add website_data column to store scraped content from Chrome extension
ALTER TABLE chat_messages
ADD COLUMN website_data jsonb;

-- Add reasoning_output column to store reasoning model's analysis
ALTER TABLE chat_messages
ADD COLUMN reasoning_output jsonb;

-- Add attachments column to store file references (PDFs, images)
ALTER TABLE chat_messages
ADD COLUMN attachments jsonb;

-- Add session_id to group related messages in a conversation
ALTER TABLE chat_messages
ADD COLUMN session_id uuid;

-- Add metadata column for flexible future needs
ALTER TABLE chat_messages
ADD COLUMN metadata jsonb;

-- Add index on session_id for faster conversation queries
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- Add comment for documentation
COMMENT ON COLUMN chat_messages.user_instructions IS 'User''s recurring accessibility instructions/preferences';
COMMENT ON COLUMN chat_messages.website_data IS 'Scraped website content from Chrome extension';
COMMENT ON COLUMN chat_messages.reasoning_output IS 'Reasoning model''s analysis before final response';
COMMENT ON COLUMN chat_messages.attachments IS 'File references (PDFs, images, etc.)';
COMMENT ON COLUMN chat_messages.session_id IS 'Groups related messages in a conversation';
COMMENT ON COLUMN chat_messages.metadata IS 'Flexible field for future needs';
