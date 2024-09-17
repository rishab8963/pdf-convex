import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import uploadIcon from "./assets/upload-svgrepo-com.png";
import deleteIcon from "./assets/delete-svgrepo-com.png";
import downloadIcon from "./assets/download-svgrepo-com.png";
import "./index.css";

const MAX_COUNT = 50;
const MAX_FILE_NAME_LENGTH = 10;

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileLimit, setFileLimit] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const navigate = useNavigate();
  const [fileHistory, setfileHistory ] = useState([]);


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
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
    updateHistory()
  }, []);


  const updateHistory = useCallback(() => {
    fetch("http://127.0.0.1:5000/history", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((jsonResponse) => setfileHistory(jsonResponse.history))
      .catch((error) => console.error("Error during fetch:", error));
  }, []);

  const handleUploadFiles = (files) => {
    const uploaded = [...uploadedFiles];
    let limitExceeded = false;

    files.some((file) => {
      if (uploaded.findIndex((f) => f.name === file.name) === -1) {
        uploaded.push(file);
        if (uploaded.length >= MAX_COUNT) {
          setFileLimit(true);
        }
        if (uploaded.length > MAX_COUNT) {
          alert(`You can only add a maximum of ${MAX_COUNT} files`);
          setFileLimit(false);
          limitExceeded = true;
          return true;
        }
      }
      return false;
    });

    if (!limitExceeded) setUploadedFiles(uploaded);
  };

  const handleFileEvent = (e) => {
    e.preventDefault();
    const chosenFiles = Array.prototype.slice.call(e.target.files);

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
    }).catch((e) => {
        console.error(`Error : ${e}`);
    });
    updateHistory();
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
  };

  const handleFileClick = (file_obj) => {
    if (!selectedFiles.find((f) => f.actual_pdf_name === file_obj.actual_pdf_name)) {
      setSelectedFiles([...selectedFiles, file_obj]);
    }
  };

  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
  };

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
      .then(() => {
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
                disabled={fileLimit}
              />
              <label
                htmlFor="upload_pdf_btn"
                className={`label_pdf_btn ${!fileLimit ? "" : "disabled"}`}
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
          <p>{summaryText || " Summary will appear here..."}</p>
        </div>
        <form>
          <textarea
            id="chatbox"
            placeholder="Ask about the PDF...."
            value={chatInput}
            onChange={handleChatInputChange}
            rows="3"
          />
        </form>
      </div>
    </div>
  );
}

export default App;
