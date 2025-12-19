# Message Logger Configuration

## Admin Access Control

The message logger requires admin authentication before allowing access to message history.

### Configuration

1. **Set Admin User IDs** in `config.yml`:
```yaml
discord:
  admins:
    - '123456789012345678'  # Replace with your Discord User ID
    - '987654321098765432'  # Add more admin IDs as needed
```

2. **Get Your Discord User ID**:
   - Enable Developer Mode in Discord (Settings > Advanced > Developer Mode)
   - Right-click your username and select "Copy ID"

### Security Notes

⚠️ **Important Security Considerations:**

- The current implementation uses client-provided Discord User IDs for authentication
- This is suitable for **self-hosted** deployments where you trust the users accessing the server
- For production/public deployments, implement proper OAuth2 authentication with Discord
- The admin ID is stored in localStorage and sent via HTTP headers
- Ensure your server is only accessible via HTTPS in production
- Consider implementing IP whitelisting or VPN access for additional security

### Admin Features

Authenticated admins can:
- View all message history across all channels
- See full edit history for every message
- View deleted messages and deletion timestamps
- Access messages from deleted channels (channel names are preserved)

### Read-Only Mode

- Message sending functionality has been completely disabled
- The UI displays "Message Logger - Read Only Mode" indicator
- Users cannot send messages, even if authenticated as admin
- This is a logging and viewing tool only

## Database

Message history is stored in the `messageHistory.db` file in your configured database directory.

### Message History Schema

Each message record includes:
- Original Discord message ID
- Channel and server information
- Complete edit history with timestamps
- Deletion information (if deleted)
- Author details
- Embeds, attachments, and reactions

## GraphQL Queries

Two new admin-only queries are available:

### channelHistory
Get message history for a specific channel:
```graphql
query {
  channelHistory(
    serverId: "299881420891881473"
    channelId: "355719584830980096"
    limit: 100
  ) {
    messageId
    channelName
    author { name }
    contentHistory { content timestamp }
    currentContent
    createdAt
    deletedAt
  }
}
```

### serverHistory
Get message history for an entire server:
```graphql
query {
  serverHistory(
    serverId: "299881420891881473"
    limit: 1000
  ) {
    messageId
    channelName
    author { name }
    currentContent
    createdAt
  }
}
```

Both queries require the `x-user-id` header with a valid admin Discord ID.

## Deployment

### Docker Deployment
The application can be deployed using Docker with the existing Dockerfile and docker-compose.yml.

### Heroku Deployment
Use the Heroku button in the README or deploy manually:
```bash
heroku create your-app-name
git push heroku main
heroku config:set DISCORD_TOKEN=your-bot-token
heroku config:set JWT_SIGNATURE_KEY=your-secret-key
heroku config:set ADMIN_IDS=admin-id-1,admin-id-2
```

## Backup Recommendations

Since this is a message logger, regular backups of the database are crucial:

```bash
# Backup script example
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DB_DIR="/path/to/database"
DATE=$(date +%Y%m%d_%H%M%S)

tar -czf "$BACKUP_DIR/messageHistory_$DATE.tar.gz" "$DB_DIR/messageHistory.db"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "messageHistory_*.tar.gz" -mtime +30 -delete
```
