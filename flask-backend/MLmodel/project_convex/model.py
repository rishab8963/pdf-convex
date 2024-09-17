import weaviate
from llama_cpp import Llama
import pymupdf
from langchain_text_splitters import RecursiveCharacterTextSplitter
import time


client = weaviate.Client(
    url="http://localhost:8080"
)

template = """
You are a helpful assistant who answers questions using the provided context. If you don't know the answer, 
simply state that you don't know.

{context}

Question: {question}"""

# Load the model
model = Llama(model_path="./Main-Model-7.2B-Q5_K_M.gguf", n_ctx=2048)

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=50,
    length_function=len,
    is_separator_regex=False
)

# Load the model
model2 = Llama(model_path="./bge-small-en-v1.5-f16.gguf", embedding=True, verbose=False)


text = ""
# Open a document
for doc in documents:
    doc_ = pymupdf.open(`./documents/${doc}.pdf`)

# Extract all the text from the pdf document
    for page in doc_:
        result = page.get_text()
        text += result


documents = text_splitter.create_documents([text])

document_embeddings = []
# Generate Embeddings for every single document in documents and append it into document_embeddings
for document in documents:
    embeddings = model2.create_embedding([document.page_content])
    document_embeddings.append({
        "content": document.page_content,
        "embedding": embeddings["data"][0]["embedding"]
    })

# Insert embeddings into Weaviate
client.batch.configure(batch_size=100)
with client.batch as batch:
    for doc in document_embeddings:
        properties = {
            "content": doc["content"],
        }
        
        batch.add_data_object(properties, "Pdf", vector=doc['embedding'])
    

query ="What is the main idea of this"
# Generate Embeddings for every single document in documents and append it into document_embeddings
query_embeddings = model2.create_embedding(query)
query_vector=query_embeddings['data'][0]["embedding"]
print((query_vector))

nearVector = {
    "vector": query_vector
}

result = (
    client.query.get("Pdf", ["content"])
    .with_near_vector(
        nearVector
    )
    .with_limit(5)
    .with_additional(['certainty'])
    .do()
)
# Print the result
result = result['data']['Get']['Pdf']
print("Query result:", result)




stream=model.create_chat_completion(
  messages=[
      {"role": "user", "content": template.format(
          context="\n\n".join(result[0]['content']),
          question=query
      )}
  ]
# ,
#   stream=True
)

# for chunk in stream:
#     print(chunk['choices'][0]['delta'].get('content', ''), end='')