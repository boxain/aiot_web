FROM python:3.12-slim AS base

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


FROM base AS production
COPY . .
ENV APP_ENV=production
EXPOSE 8000
CMD ["python", "./main.py"]


FROM base AS development
# COPY . .
ENV APP_ENV=development
EXPOSE 8000
CMD ["python", "./main.py"]