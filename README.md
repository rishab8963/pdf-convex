# Pdf-Convex
## Deployment
This project is currently deployed/live on https://novafrost.strangled.net <br>
## Project Set-up Instructions
Make sure to have `python3.10`, `docker`, `venv`, `node lts/iron`, `nginx` <br>
More details on how to install these -> https://github.com/Harshroxnox/linux-server-guide
<br><br>
Then install these packages on debian based systems:
```bash
apt install cmake build-essential python3-dev
```
Clone the project
```bash
git clone git@github.com:rishab8963/pdf-convex.git
```
Go inside the backend folder
```bash
cd pdf-convex/flask-backend
```
```bash
npm install
```
Create Virtual Env and activate it 
```bash
python3 -m venv venv && source venv/bin/activate
```
Install requirements
```bash
pip install -r requirements.txt
```
Go inside the model folder 
```bash
cd MLmodel/project_convex
```
run `model-setup.sh`. This script downloads the llm and embedding model and clones the `llama.cpp` repo and builds it.
```bash
./model-setup.sh
```
Go inside flask-backend and make a pdf_files folder
```bash
cd flask-backend && mkdir pdf_files
```
Create a `.env.local` file inside flask-backend
```bash
nano .env.local
```
paste this into it 
```bash
SECRET_KEY='something'
```
run this command inside `flask-backend` to setup convex database 
```bash
npx convex dev
```
login into this. Then open a new terminal and go to `llama.cpp` folder
```bash
cd flask-backend/MLmodel/project_convex/llama.cpp
```
run the llm web server
```bash
./llama-server -c 512 -a "Phi-3.5-Instruct" -m models/Phi-3.5-mini-instruct-Q5_K_M.gguf --api-key abcd
```
open a new terminal and go to `flask-backend`
```bash
cd flask-backend && sudo docker pull qdrant/qdrant
```
```bash
sudo docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```
Then open a new terminal (make sure the venv is activated) and go to `flask-backend`
```bash
python3 run.py
```
Now our backend is up and running for setting up our frontend open a new terminal and go to pdf-react
```bash
cd pdf-react && npm install
```
run the react app
```bash
npm run dev
```
You should be able to interact with our app on `localhost:5173`



















