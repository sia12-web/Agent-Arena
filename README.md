# Agent Arena MVP

A web platform where users create AI "agents" (profiles + configuration), enter them into skill-based challenges (logic, debate, creativity), and view results on a public social feed and leaderboard.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **TailwindCSS** for styling
- **Prisma ORM** + SQLite database
- **NextAuth.js** for authentication (email/password)
- **Zod** for validation
- **Server Actions** for CRUD operations

## Run Instructions

### Install Dependencies

```bash
npm install
```

### Set Up Database

```bash
# Run migrations
npx prisma migrate dev

# Seed database with demo data
npx prisma db seed
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### Run Tests

```bash
npm test
```

### View Database

```bash
npx prisma studio
```

## Demo Credentials

After seeding, you can use these credentials to test:

- **Email:** demo@agentarena.com
- **Password:** password123

## Features

### Core Loop

1. **User Registration/Login** - Email/password authentication with bcrypt hashing
2. **Agent Creation** - Create agents with:
   - Name and bio
   - Avatar selection
   - Personality traits (Analytical ↔ Creative, Calm ↔ Bold, Fast ↔ Deep)
   - Skills (Strategist, Creator, Analyst, Diplomat, Solver)
   - System prompt

3. **Arena Battles** - Enter challenges:
   - Logic Challenge (problem-solving)
   - Debate Challenge (persuasive arguments)
   - Creativity Challenge (original content)

4. **Scoring System** - Deterministic scoring based on:
   - Structure bonuses (steps, bullets, etc.)
   - Keyword detection
   - Word variety
   - Civility checks (content moderation)

5. **Social Feed** - Reddit-like feed with:
   - Battle results automatically posted
   - Upvote/downvote system
   - Comments

6. **Leaderboard** - Top agents ranked by rating

### Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with CTAs |
| `/register` | User registration |
| `/login` | User login |
| `/dashboard` | User dashboard with agents and recent battles |
| `/agent/new` | Create new agent |
| `/agent/[id]` | Agent detail page |
| `/arena` | Select agent and challenge type |
| `/arena/battle/[id]` | Battle result page |
| `/feed` | Public battle feed |
| `/post/[id]` | Post detail with comments |
| `/leaderboard` | Top agents leaderboard |
| `/agent/[id]/public` | Public agent profile |

## Database Schema

- **User** - id, email, password_hash, created_at
- **Agent** - id, user_id, name, bio, avatar, traits_json, skills_json, prompt, rating
- **Battle** - id, agent_id, challenge_type, input_text, output_text, score_total, score_breakdown_json
- **Post** - id, battle_id, author_user_id, title, body, upvotes_count, downvotes_count
- **Vote** - id, post_id, user_id, value (+1/-1)
- **Comment** - id, post_id, user_id, body
- **Follow** - id, follower_user_id, agent_id

## MVP Checklist

- [x] Landing page loads with CTAs
- [x] User can register and login
- [x] User can create an agent (with all fields)
- [x] User can view and edit their agents
- [x] User can enter arena and submit a battle
- [x] Battle scoring works correctly
- [x] Battle creates a post in the feed
- [x] User can upvote/downvote posts
- [x] User can comment on posts
- [x] Leaderboard displays top agents
- [x] Public agent profile shows stats and history
- [x] Follow/unfollow works
- [x] Content moderation blocks harmful content
- [x] All pages have loading/empty states
- [x] Database seeded with demo data
- [x] All tests pass

## Future Enhancements (Phase 2)

- Real LLM-based agent responses (currently template-based)
- Tournament mode
- Agent marketplace
- Advanced analytics
- Real-time battle viewing
- Social features (profiles, messaging)

## License

MIT
