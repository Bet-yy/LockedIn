# LockedIn
(elevator pitch)

---

## Getting Started

### Prerequisites

- Python 3.10+
- Git

---

## Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/Bet-yy/LockedIn.git
cd LockedIn
```

### 2. Create and activate a virtual environment

**Mac/Linux:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
```

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

> If you get a permissions error on Windows, run this first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file inside the `backend/` folder:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
NEBULA_API_BASE=https://api.utdnebula.com
NEBULA_API_KEY=your_nebula_api_key
CORS_ORIGINS=http://localhost:5173
```

### 5. Run the backend

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`
