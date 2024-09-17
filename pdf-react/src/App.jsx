import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import uploadIcon from "./assets/upload-svgrepo-com.png";
import deleteIcon from "./assets/delete-svgrepo-com.png";
import downloadIcon from "./assets/download-svgrepo-com.png";
import sendIcon from "./assets/send-svgrepo-com.png";
import "./index.css";

const MAX_FILE_NAME_LENGTH = 10;

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [summaryText, setSummaryText] = useState([]);
  const navigate = useNavigate();
  const [fileHistory, setfileHistory ] = useState([]);

  const tempUpdateFileHistory = (history)=>{
    const newArray = [...history];
    setfileHistory(newArray);
  }

  const updateHistory = () => {
    fetch("http://127.0.0.1:5000/history", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((jsonResponse) => {
      tempUpdateFileHistory(jsonResponse.history)
    })
    .catch((error) => console.error("Error during fetch:", error));
  };

  useEffect(() => {
    fetch("http://127.0.0.1:5000/account", {
      method: "GET", // Specifies the HTTP method as GET
      headers: {
        "Content-Type": "application/json",
      },
      credentials : 'include',
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Parse the JSON from the response
    })
    .then((jsonResponse) => {
      console.log(jsonResponse)
      if(jsonResponse.error){
        navigate("/");
      }
      updateHistory()
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
  }, []);


  const handleFileEvent = (e) => {
    e.preventDefault();

    const form = e.target.form;
    const formdata = new FormData(form);

    fetch("http://127.0.0.1:5000/upload", {
        method : 'POST',
        credentials : 'include',
        body : formdata
    }).then((response) => {
        if(!response.ok){
            throw new Error("Upload Unsuccessful");
        }
        return response.json();
    }).then((jsonResponse) => {
        console.log(jsonResponse);
        updateHistory();
    }).catch((e) => {
        console.error(`Error : ${e}`);
    });
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
  };

  const handleFileClick = (file_obj) => {
    if (!selectedFiles.find((f) => f.actual_pdf_name === file_obj.actual_pdf_name)) {
      setSelectedFiles([...selectedFiles, file_obj]);
    }
  };

  const askQuestion = (e) => {
    const selected_names = selectedFiles.map((f) => f.pdf_name)

    fetch("http://127.0.0.1:5000/selected", {
      method : 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        'selected_pdf_files' : selected_names,
      }),
    }).then((response) => {
      if(!response.ok){
          throw new Error("Selection Unsuccessful");
      }
      return response.json();
    }).then((jsonResponse) => {
      console.log(jsonResponse)
    }).catch((e) => {
      console.error(`Error : ${e}`);
    });

    fetch("http://127.0.0.1:5000/question", {
      method : 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        'question' : chatInput,
      }),
    }).then((response) => {
      if(!response.ok){
          throw new Error("Query Unsuccessful");
      }
      return response.json();
    }).then((jsonResponse) => {
      console.log(jsonResponse);
      const newArray = [...summaryText, chatInput, jsonResponse.answer]
      setSummaryText(newArray)
      setChatInput("")
    }).catch((e) => {
      console.error(`Error : ${e}`);
    });
  };

  const handleChatInputChange = (e) =>{
    setChatInput(e.target.value);
  }

  const handleDeleteFile = (file_obj) => {
    fetch(`http://127.0.0.1:5000/delete/${file_obj._id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((jsonResponse) => {
      console.log(jsonResponse);
      updateHistory();
      const newSelectedFiles = selectedFiles.filter((f) => f.actual_pdf_name !== file_obj.actual_pdf_name);
      setSelectedFiles(newSelectedFiles); // Set the new array after deletion
    }) // Refresh the history after deletion
    .catch((error) => console.error("Error during fetch:", error));
  };

  const truncateFileName = (fileName) => {
    if (fileName.length > MAX_FILE_NAME_LENGTH) {
      return fileName.substring(0, MAX_FILE_NAME_LENGTH) + "...";
    }
    return fileName;
  };

  const handleLogout = () => {
    // Logic for logging out
    console.log("Logging out...");
    fetch("http://127.0.0.1:5000/logout", {
      method: "GET", // Specifies the HTTP method as GET
      headers: {
        "Content-Type": "application/json",
      },
      credentials : 'include'
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Parse the JSON from the response
    })
    .then((jsonResponse) => {
      console.log(jsonResponse)
      if(jsonResponse.message){
        navigate("/");
      }
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
  };

  return (
    <div className="container">
      <div className="column">
        <div className="upload">
          <h2>UPLOAD PDF</h2>
          <div className="uploaded_pdf">
            <ul>
              {fileHistory.map((file_obj, index) => (
                <li key={index} className="file-item">
                  <button
                    onClick={() => handleFileClick(file_obj)}
                    className={`file-button ${
                      selectedFiles.find((f) => f.actual_pdf_name === file_obj.actual_pdf_name)
                        ? "selected"
                        : ""
                    }`}
                  >
                    <span>{truncateFileName(file_obj.actual_pdf_name)}</span>
                    <a href={`http://127.0.0.1:5000/download/${file_obj._id}`}>
                    <img
                      src={downloadIcon}
                      alt="download"
                      className="download-icon"
                      onClick={(e) => {
                        e.stopPropagation();               
                      }}
                    />
                    </a>

                    <img
                      src={deleteIcon}
                      alt="delete"
                      className="delete-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file_obj);
                      }}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="icon_btn">
            <form>
              <input
                type="file"
                multiple
                accept="application/pdf"
                id="upload_pdf_btn"
                name="pdf_file"
                onChange={handleFileEvent}
              />
              <label
                htmlFor="upload_pdf_btn"
                className="label_pdf_btn"
              >
                <img src={uploadIcon} height="25" width="25" alt="upload icon" />
                <span>Upload</span>
              </label>
            </form>
          </div>
        </div>
        <div className="select">
          <h2>SELECTED PDF</h2>
          <div className="selected_pdf">
            <ul>
              {selectedFiles.map((file_obj, index) => (
                <li key={index} className="file-item">
                  <button className="file-button selected">
                    <span>{truncateFileName(file_obj.actual_pdf_name)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <button onClick={handleClearFiles}>Clear</button>
          </div>
        </div>
      </div>

      <div className="chat">
        <div className="chat-header">
          <h1>PDF SUMMARIZER</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
        <div className="summary">
          {summaryText.map((dialog, index) => {
          if (index % 2 === 0) {
            // Even index: question
            return <div key={index} className="question">{dialog}</div>;
          } else {
            // Odd index: answer
            return <div key={index} className="answer">{dialog}</div>;
          }
          })}
        </div>
        <div className="chatbox-container">
          <form>
          <textarea
            id="chatbox"
            placeholder="Ask about the PDF..."
            value={chatInput}
            onChange={handleChatInputChange}
            rows="3"
          />
          </form>
          <button className="send-button" onClick={askQuestion}>
             <img src={sendIcon} alt="send" className="send-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
