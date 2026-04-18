# Chạy project

## Yêu cầu

| Thành phần | Ghi chú |
|------------|---------|
| **Node.js** (npm) | Cho frontend và script gốc |
| **Python 3.11 hoặc 3.12** | **Không dùng Python 3.13** — TensorFlow chưa có wheel cho 3.13 |
| **[uv](https://docs.astral.sh/uv/)** | Quản lý venv và cài backend (`winget install astral-sh.uv` hoặc `pip install uv`) |

## Các bước

1. Cài **Python 3.12** (hoặc 3.11), đặt làm mặc định hoặc chỉ `uv` dùng đúng bản (trong `fastapi_backend` có file `.python-version` = `3.12`).

2. Từ thư mục gốc repo:

```bash
npm install
npm run setup:backend
npm run dev
```

- `npm install` cài dependency Node và chạy `postinstall` (cài thêm frontend, copy `.env` mẫu nếu thiếu).
- `npm run setup:backend` chạy `uv sync` trong `fastapi_backend` (tạo `.venv`, cài TensorFlow — lần đầu có thể lâu).

3. Mở trình duyệt:

- Frontend: http://localhost:3000  
- FastAPI (ML / action-detection): http://localhost:8001  
- Node API (auth, …): http://localhost:8000 — khi chạy `nodejs-backend`  

## Lỗi thường gặp

- **`tensorflow` không cài được trên Python 3.13** — Cài Python 3.12, xóa thư mục `fastapi_backend/.venv` nếu đã tạo bằng 3.13, rồi chạy lại `npm run setup:backend`.
- **`uv` không nhận lệnh** — Cài `uv` hoặc `pip install uv`, rồi dùng `python -m uv sync` trong `fastapi_backend`.
- **Xung đột numpy / TensorFlow** — Repo đã ghim TensorFlow 2.18.x + numpy 2.x; giữ `uv.lock` và chạy `uv sync` trong `fastapi_backend`.
