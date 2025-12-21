# Clash of Clans Discord Bot

A Discord bot built with NestJS and Discord.js that integrates with the Clash of Clans API to provide automated war notifications and clan management features.

## Features

- 🏰 **Clan War Tracking**: Automatically monitors and reports clan war activities
- ⚔️ **War Attack Notifications**: Real-time notifications for war attacks with detailed statistics
- 📊 **War Status Updates**: Track war search, start, and finish events
- 👥 **Player & Clan Management**: Sync player and clan data with PostgreSQL database
- 🔄 **Automated Syncing**: Scheduled tasks for keeping data up-to-date
- 🎯 **Discord Embeds**: Rich embedded messages for better readability

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) - A progressive Node.js framework
- **Discord Integration**: [Discord.js](https://discord.js.org/) v14 & [DiscordX](https://discordx.js.org/)
- **Clash of Clans API**: [clashofclans.js](https://github.com/clashperk/clashofclans.js)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Caching**: Keyv with SQLite adapter
- **Language**: TypeScript
- **Security**: Helmet for HTTP security headers
- **Logging**: Winston
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15 or higher
- Discord Bot Token ([How to create a Discord bot](https://discord.com/developers/applications))
- Clash of Clans API Token ([Get API key](https://developer.clashofclans.com/))

## Installation

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/Marcelgit313/clash-of-clans-discord-bot.git
cd clash-of-clans-discord-bot
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
NODE_ENV=production
DATABASE_URL=postgresql://uwu:owo@bot-database:5432/uwu?schema=public
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_discord_guild_id
DISCORD_WAR_LOG_CHANNEL=your_war_log_channel_id
DISCORD_WAR_ATTACKS_CHANNEL=your_war_attacks_channel_id
COC_API_TOKEN=your_clash_of_clans_api_token
COC_CLAN_TAG=#your_clan_tag
LOGGING_LEVEL=info
LOGGING_FORMAT=default
POSTGRES_USER=uwu
POSTGRES_PASSWORD=owo
```

4. Start the services using Docker Compose:
```bash
docker-compose up -d
```

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/Marcelgit313/clash-of-clans-discord-bot.git
cd clash-of-clans-discord-bot
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Start PostgreSQL (if not running)
# Update DATABASE_URL in config/default.json5 or use environment variables

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

4. Configure the bot by editing `config/default.json5` or using environment variables (see Configuration section)

5. Build the project:
```bash
npm run build
```

6. Start the bot:
```bash
npm run start:prod
```

## Configuration

The bot uses the [config](https://www.npmjs.com/package/config) library for configuration management. Configuration files are located in the `config/` directory.

### Configuration Files

- `config/default.json5`: Default configuration values
- `config/custom-environment-variables.json5`: Maps environment variables to configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production/development) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DISCORD_BOT_TOKEN` | Discord bot authentication token | Yes |
| `DISCORD_GUILD_ID` | Discord server (guild) ID | Yes |
| `DISCORD_WAR_LOG_CHANNEL` | Channel ID for war status updates | Yes |
| `DISCORD_WAR_ATTACKS_CHANNEL` | Channel ID for war attack notifications | Yes |
| `COC_API_TOKEN` | Clash of Clans API token | Yes |
| `COC_CLAN_TAG` | Your clan tag (with #) | Yes |
| `LOGGING_LEVEL` | Log level (debug/info/warn/error) | No |
| `LOGGING_FORMAT` | Log format | No |
| `POSTGRES_USER` | PostgreSQL username | Yes (Docker) |
| `POSTGRES_PASSWORD` | PostgreSQL password | Yes (Docker) |

### Cron Schedules

The bot uses cron jobs to sync data (in 6-field cron format: second minute hour day month weekday):

- **Clan Sync**: `0 0 0 */1 * *` (Every day at midnight - second 0, minute 0, hour 0)
- **War Sync**: `0 */10 * * * *` (Every 10 minutes - second 0, every 10th minute)

These can be customized in `config/default.json5`.

## Development

### Running in Development Mode

```bash
# Start development server with hot reload
npm run start:dev

# Start with debugging
npm run start:debug
```

### Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

### Database Management

```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset
```

## Project Structure

```
├── config/                 # Configuration files
│   ├── default.json5      # Default configuration
│   └── custom-environment-variables.json5
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Prisma schema definition
│   └── migrations/        # Database migrations
├── src/
│   ├── app.module.ts      # Root application module
│   ├── main.ts            # Application entry point
│   ├── clash-of-clans-client/  # Clash of Clans API integration
│   ├── discord-client/    # Discord bot client
│   ├── discord-ressources/ # Discord embeds and components
│   └── common/            # Shared utilities and services
│       ├── cache/         # Caching service
│       ├── logger/        # Logging service
│       ├── prisma/        # Prisma service
│       └── error/         # Error handling
├── Dockerfile             # Docker image configuration
├── docker-compose.yml     # Docker Compose services
└── package.json           # Project dependencies and scripts
```

## Features in Detail

### War Tracking

The bot monitors your clan's war status and provides:

- **War Search Notifications**: When your clan starts searching for a war
- **War Started Notifications**: When a war match is found and begins
- **Attack Notifications**: Real-time updates when attacks are made, including:
  - Attacker and defender information
  - Stars achieved
  - Destruction percentage
  - Attack order
- **War Finished Notifications**: Final results when the war ends

### Data Synchronization

The bot automatically syncs:

- Clan information (level, points, win streak, etc.)
- Member data (trophies, donations, town hall levels, etc.)
- War history and statistics
- Attack and defense records

### Database Schema

The bot uses Prisma with PostgreSQL to store:

- **Players**: Player tags, names, levels, trophies, donations
- **Clans**: Clan tags, names, levels, war statistics
- **Clan Wars**: War details, start/end times, results
- **War Attacks**: Individual attack records with stats

## Security

This bot implements several security measures:

- **Helmet**: HTTP security headers
- **Content Security Policy**: Prevents XSS and injection attacks
- **Frame Protection**: Prevents clickjacking
- **MIME Sniffing Protection**: Prevents content-type sniffing
- **DNS Prefetch Control**: Prevents unauthorized DNS prefetching

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Run `npm run format` before committing
- Ensure `npm run lint` passes
- Write tests for new features

## Troubleshooting

### Bot is not responding

- Check if the bot is online in your Discord server
- Verify the `DISCORD_BOT_TOKEN` is correct
- Ensure the bot has proper permissions in your Discord server

### Database connection errors

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database credentials

### Clash of Clans API errors

- Verify your `COC_API_TOKEN` is valid
- Ensure the `COC_CLAN_TAG` includes the `#` symbol
- Check if you've exceeded API rate limits

## License

UNLICENSED - Private project

## Author

Marcelgit313

## Acknowledgments

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [clashofclans.js](https://github.com/clashperk/clashofclans.js) - Clash of Clans API wrapper
