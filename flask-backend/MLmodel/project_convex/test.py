import requests

# URL of the server where you are sending the POST request
url = 'http://127.0.0.1:5000/query'

# JSON data to be sent in the request
data = {
    "query": "what is the benefit of this idea"
}

# Send POST request with JSON data
response = requests.post(url, json=data)

# Print the response from the server
print(response.status_code)  # HTTP status code
print(response.json())       # JSON response from the server (if any)
