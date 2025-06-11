# manga_web 📚✨

## Features 🚀
- 🔍 **Search Titles**
- ⬆️ **Upload Chapters w/ IPFS Integration**
- 👤 **User Accounts**
- 🛡️ **Admin Review**

## Getting Started 🏁

### Prerequisites
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (for local dev)

### Quick Start (Recommended)
```bash
git clone https://github.com/emanh1/manga_web
cd manga_web
cp .env.example .env # Edit environment variables as needed
docker-compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PGAdmin: http://localhost:5050

### Manual Setup
1. **Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```
2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Contributing 🤝
Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.
