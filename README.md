# 🖊 InkWell — Full-Stack Blogging Platform

> A modern blogging platform where writers craft stories, share ideas, and build an audience — with AI writing assistance and cover image generation built right in.

![InkWell Banner](https://picsum.photos/id/3059/1200/400)

---

## ✨ Features

### Core Blogging
- 📝 **Create, Edit, Delete** posts with rich content
- 🖼 **Cover Images** — drag & drop upload, URL paste, or AI generation
- 🏷 **Tag System** — filter posts by topic
- 💬 **Comment System** — threaded discussions per post
- ❤️ **Like Posts** — engagement tracking
- 🔍 **Live Search** — full-text search across title, content, author

### Authentication (JWT)
- 🔐 **Sign Up / Sign In** with email & password
- 🎟 **JWT tokens** — 7-day expiry, stored in localStorage
- 🛡 **Protected routes** — dashboard & editor require auth
- 👤 **5 demo accounts** pre-loaded (password: `demo`)
  - `alice@inkwell.io` — Tech writer
  - `james@inkwell.io` — Philosophy essayist
  - `priya@inkwell.io` — UX Designer
  - `marco@inkwell.io` — Startup founder
  - `sara@inkwell.io` — Creative writer

### AI Features (Claude API)
- ✍️ **AI Content Generation** — full blog post from title + tags using `claude-sonnet-4-20250514`
- 🎨 **AI Cover Image Generation** — smart image selection (production: DALL-E 3 / Stability AI)
- 💡 **Auto Excerpt** — AI suggests a one-line hook for your post

### Design & UX
- 🌙 **Dark Mode** — persistent theme toggle
- 🃏 **3D Card Animations** — hover with rotateX/Y + spring easing
- 🌊 **Animated Hero** — floating gradient orbs + CSS grid background
- 📱 **Fully Responsive** — mobile, tablet, desktop
- 🖼 **Lazy Image Loading** — smooth fade-in with emoji placeholders
- 🏢 **Professional Footer** — brand, links, newsletter, tech badges

---

## 🏗 Architecture

### Frontend (React + Vite)
```
src/
├── App.jsx          # Full application (single-file architecture)
└── main.jsx         # React DOM entry point
```

### REST API Reference (Express.js + MongoDB)

| Endpoint | Auth | Description |
|---|---|---|
| `POST /api/auth/signup` | ❌ | bcrypt hash → MongoDB user → JWT |
| `POST /api/auth/login` | ❌ | Validate credentials → sign JWT |
| `GET /api/posts` | ❌ | Paginated, tag-filterable post list |
| `POST /api/posts` | ✅ | Create post, upload image to S3/Cloudinary |
| `PUT /api/posts/:id` | ✅ | Update post (author only) |
| `DELETE /api/posts/:id` | ✅ | Delete post (author only) |
| `POST /api/posts/:id/comments` | ✅ | Add comment (embedded subdocument) |
| `DELETE /api/posts/:id/comments/:cid` | ✅ | Delete own comment |
| `POST /api/ai/generate-content` | ✅ | Claude API → {content, excerpt} |
| `POST /api/ai/generate-image` | ✅ | DALL-E 3 / Stability AI → S3 URL |

### MongoDB Schemas

```js
// User
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,       // bcrypt
  bio: String,
  avatar: String,
  createdAt: Date
}

// Post
{
  _id: ObjectId,
  title: String,
  slug: { type: String, unique: true },
  content: String,
  excerpt: String,
  coverImage: String,         // S3/Cloudinary URL
  tags: [String],
  author: {
    _id: ObjectId,            // ref: User
    name: String
  },
  comments: [{
    _id: ObjectId,
    text: String,
    author: { _id: ObjectId, name: String },
    createdAt: Date
  }],
  likes: { type: Number, default: 0 },
  createdAt: Date
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/gentlemanpearl/-InkWell-.git
cd -InkWell-

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🤖 AI Setup (Claude API)

The AI writing assistant calls the Anthropic Claude API. In the current demo build, API calls are made client-side for simplicity. In production, proxy through your Express backend:

```js
// backend/routes/ai.js
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/generate-content', verifyJWT, async (req, res) => {
  const { title, tags } = req.body;
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: `Write a blog post about: ${title}. Tags: ${tags.join(', ')}` }]
  });
  res.json({ content: message.content[0].text });
});
```

Set your environment variable:
```bash
ANTHROPIC_API_KEY=your_key_here
```

---

## 🛠 Production Backend (Express.js)

```bash
# Install backend dependencies
npm install express mongoose bcryptjs jsonwebtoken multer @aws-sdk/client-s3 @anthropic-ai/sdk cors dotenv

# Run backend
node server.js
```

```js
// server.js (skeleton)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/ai', require('./routes/ai'));

app.listen(5000, () => console.log('InkWell API running on :5000'));
```

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Styling | CSS Custom Properties, DM Serif Display + DM Sans |
| Auth | JWT (jsonwebtoken), bcrypt |
| Database | MongoDB + Mongoose |
| Backend | Express.js |
| File Storage | AWS S3 / Cloudinary |
| AI Content | Anthropic Claude API |
| AI Images | DALL-E 3 / Stability AI |

---

## 📁 Project Structure

```
inkwell/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          # Full application
│   └── main.jsx         # Entry point
├── index.html
├── vite.config.js
├── package.json
├── .gitignore
└── README.md
```

---

## 👨‍💻 For Trainees

This project demonstrates:

1. **Multi-user CRUD** — posts belong to authors, permissions enforced on every mutation
2. **JWT Authentication** — stateless auth, token verification middleware
3. **RESTful API design** — proper HTTP verbs, status codes, resource nesting
4. **MongoDB document modeling** — embedded comments vs. referenced authors
5. **File upload pipeline** — client → Express → S3 → URL stored in DB
6. **AI API integration** — structured prompting, JSON response parsing
7. **React patterns** — Context API, custom hooks, lazy loading, optimistic UI

---

## 📄 License

MIT © 2025 InkWell

---

*Built with ♥ for the love of writing.*
