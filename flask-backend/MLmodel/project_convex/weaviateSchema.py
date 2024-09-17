import weaviate

client = weaviate.Client(
    url="http://localhost:8080"
)
print("connected")

# Weaviate schema creation (if not already created)
class_obj = {
    "class": "Pdf",
    "vectorizer": "none",
}

# Create the schema in Weaviate
client.schema.create_class(class_obj)
