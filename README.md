# DevDesk - Personal Task & Bug Manager

A modern, local-first task and bug management application built with Next.js, TypeScript, Prisma, and MySQL. Features a beautiful UI with animations, dark mode, and AI-powered assistance.

## 🚀 Features

- **Task & Bug Management**: Create, read, update, and delete tasks and bugs
- **Advanced Filtering**: Filter by type, status, priority, and search by title
- **Modern UI/UX**: 
  - Glassmorphism and neumorphism design elements
  - Smooth animations with Framer Motion
  - Dark mode support
  - Micro-interactions and hover effects
  - Responsive bento-grid layout
- **AI-Powered Features**:
  - Generate bug reproduction steps
  - Suggest task breakdown/subtasks
  - AI insights panel with productivity suggestions
- **Export/Backup**: Export all items as JSON
- **Local-First**: All data stored locally in MySQL, no cloud dependencies

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Database**: MySQL
- **ORM**: Prisma
- **AI**: OpenAI API (optional)
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 20+ and npm
- MySQL server running on `localhost:3306`
- (Optional) OpenAI API key for AI features

## 🏗️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd devdesk
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mysql://root:your_password@localhost:3306/devdesk"

# OpenAI (Optional - for AI features)
OPENAI_API_KEY="your_openai_api_key_here"
```

**Note**: Replace `your_password` with your MySQL root password. If you don't have a password, use:
```
DATABASE_URL="mysql://root@localhost:3306/devdesk"
```

### 3. Create the Database

Connect to MySQL and create the database:

```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE devdesk;
EXIT;
```

### 4. Run Prisma Migrations

Generate Prisma Client and push the schema to your database:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

Alternatively, you can use migrations:

```bash
npm run db:migrate
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
devdesk/
├── app/
│   ├── api/              # Next.js API routes
│   │   ├── items/        # CRUD operations
│   │   └── ai/           # AI endpoints
│   ├── items/[id]/       # Item detail page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home/list page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ItemCard.tsx
│   ├── FilterBar.tsx
│   ├── CreateItemModal.tsx
│   ├── Header.tsx
│   └── InsightsPanel.tsx
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── types.ts          # TypeScript types
│   └── theme.tsx         # Theme provider
├── prisma/
│   └── schema.prisma     # Database schema
└── README.md
```

## 🎨 Design Features

### UI Elements
- **Glassmorphism**: Translucent panels with backdrop blur
- **Neumorphism**: Soft shadows for depth
- **Micro-interactions**: Hover effects, button feedback, smooth transitions
- **Bento Grid**: Flexible card-based layout
- **Dark Mode**: Thoughtful dark theme with high contrast

### Animations
- Page transitions
- Card hover effects
- Modal animations
- Loading states
- Status change animations

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)

## 🗄️ Database Schema

The application uses a single `Item` model that can represent both tasks and bugs:

```prisma
model Item {
  id          String      @id @default(cuid())
  type        ItemType    // TASK or BUG
  title       String
  description String?
  status      ItemStatus  // TODO, IN_PROGRESS, DONE
  priority    ItemPriority // LOW, MEDIUM, HIGH
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

## 🤖 AI Features

### Bug Reproduction Steps
When creating or editing a bug, click "Generate Steps" to have AI generate step-by-step reproduction instructions.

### Task Breakdown
When creating or editing a task, click "Suggest Subtasks" to get AI-generated subtask suggestions.

### Insights Panel
The insights panel shows:
- Total tasks and bugs
- Status breakdown
- High-priority items
- AI-generated productivity suggestions

**Note**: AI features require an OpenAI API key. The app will work without it, but AI features will be disabled.

## 📤 Export/Backup

Click the download icon in the header to export all items as a JSON file. This creates a backup that can be imported later (import functionality can be added).

## 🎯 Usage

1. **Create Items**: Click "New Item", "Task", or "Bug" in the header
2. **View Details**: Click on any card to view/edit details
3. **Filter**: Use the filter bar to filter by type, status, priority, or search
4. **Edit**: Click "Edit" on the detail page to modify an item
5. **Delete**: Click "Delete" on the detail page to remove an item
6. **Export**: Click the download icon to export all data

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MySQL is running: `sudo service mysql start` (Linux) or check MySQL service status
- Verify your `DATABASE_URL` in `.env` matches your MySQL configuration
- Check that the database `devdesk` exists

### Prisma Issues
- Run `npm run db:generate` after schema changes
- If tables don't exist, run `npm run db:push`

### Build Errors
- Ensure Prisma Client is generated: `npm run db:generate`
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## 🔒 Security Notes

- This is a local-only application with no authentication
- Keep your `.env` file secure and never commit it to version control
- The OpenAI API key is optional and only used for AI features

## 📝 License

This project is open source and available for personal use.

## 🙏 Acknowledgments

- Design inspiration from Linear.app, Notion, and ClickUp
- Built with modern web technologies and best practices

---

**Happy Task Managing! 🚀**
