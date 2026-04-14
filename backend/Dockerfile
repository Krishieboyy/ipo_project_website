# 1. Start with Python
FROM python:3.9

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy only requirements first (this makes builds faster)
COPY requirements.txt .

# 4. Install your libraries (Pandas, Scikit-learn, FastAPI, etc.)
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your code
COPY . .

# 6. Start FastAPI on port 7860 (Hugging Face's required port)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
