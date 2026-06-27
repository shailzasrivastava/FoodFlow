# Foodflow — Backend API

FastAPI backend for the Foodflow platform 
Handles the product catalog, inventory, quality control, production tracking, and admin authentication.

---

## How to run backend locally

### 1. Prerequisites
- Python 3.10 or higher
- `pip` (comes with Python)

### 2. Clone the repo and navigate to the backend folder
```bash
cd FoodFlow/backend
```

### 3. Create and activate a virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Set up environment variables
```bash
copy .env.example .env        # Windows
cp .env.example .env          # macOS / Linux
```

Open `.env` and set:
- `ADMIN_USERNAME` — the admin login username
- `ADMIN_PASSWORD` — the admin login password
- `FRONTEND_ORIGIN` — the URL your React app runs on (default: `http://localhost:5173`)

### 6. Start the server
```bash
uvicorn main:app --reload
```

The API is now running at **http://localhost:8000**

- Interactive docs (Swagger UI): http://localhost:8000/docs  
- Alternative docs (ReDoc): http://localhost:8000/redoc

---

## Project structure

```
backend/
  main.py                        ← App entry point, CORS, exception handlers
  models.py                      ← Pydantic request/response schemas
  store.py                       ← In-memory data store (seeded with sample data)
  requirements.txt
  .env.example                   ← Required environment variables (copy to .env)
  routers/
    auth.py                      ← Login / logout / me
    products.py                  ← Product catalog CRUD + search
    inventory.py                 ← Stock levels and transactions
    qc.py                        ← Quality control batch records
    production.py                ← Production run logging
    inquiries.py                 ← WhatsApp order inquiries
  foodflow-thunder-collection.json  ← Import into Thunder Client to test all endpoints
```

---

## Endpoint reference

### Auth
| Method | Path | Auth | Description | Status |
|--------|------|------|-------------|--------|
| POST | `/api/auth/login` | No | Login with username + password, returns token | 200 |
| POST | `/api/auth/logout` | Bearer | Invalidate current token | 200 |
| GET | `/api/auth/me` | Bearer | Get current logged-in user | 200 |

### Products (public read, admin write)
| Method | Path | Auth | Description | Status |
|--------|------|------|-------------|--------|
| GET | `/api/products` | No | List all products | 200 |
| GET | `/api/products/search?q=` | No | Search by name, description, ingredients | 200 |
| GET | `/api/products/{id}` | No | Get single product | 200 |
| POST | `/api/products` | Bearer | Create product | 201 |
| PUT | `/api/products/{id}` | Bearer | Update product (partial supported) | 200 |
| DELETE | `/api/products/{id}` | Bearer | Delete product | 204 |

### Inventory
| Method | Path | Auth | Description | Status |
|--------|------|------|-------------|--------|
| GET | `/api/inventory` | No | List all inventory items | 200 |
| GET | `/api/inventory/low-stock` | No | Items below threshold | 200 |
| GET | `/api/inventory/transactions` | No | All stock transactions | 200 |
| GET | `/api/inventory/{id}` | No | Single inventory item | 200 |
| POST | `/api/inventory` | No | Create inventory item | 201 |
| POST | `/api/inventory/transactions` | No | Log stock in/out | 201 |

### QC, Production, Inquiries
| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/qc` | List / create QC records |
| GET | `/api/qc/{id}` | Single QC record |
| GET/POST | `/api/production` | List / create production runs |
| GET | `/api/production/{id}` | Single production run |
| GET/POST | `/api/inquiries` | List / create WhatsApp inquiries |
