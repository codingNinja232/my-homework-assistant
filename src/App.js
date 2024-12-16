// Importing required modules
import React, { useState, useEffect } from 'react';
import axios from "axios";
import './App.css';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASEURI
});

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('Maths');
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    client.get(`exec?subjectName=Maths`)
      .then((response) => setQuestions(response.data))
      .catch(() => setError('Failed to load questions'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsLoading(true);
    client.get(`exec?subjectName=${tab}`)
      .then((response) => {
        setQuestions(response.data);
        setError(null);
      })
      .catch(() => setError('Failed to load questions.'))
      .finally(() => setIsLoading(false));
  };

  const handleSubmit = () => {
    if (selectedOption === questions[currentQuestionIndex]?.answer) {
      setScore((prev) => prev + 1);
    }
    setSelectedOption(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleSkip = () => {
    setSelectedOption(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="app">
      {!isQuizComplete ? (
        <div>
          <div className="nav-bar">
            <ul>
              {['Maths', 'SST', 'Science'].map((tab) => (
                <li key={tab}>
                  <a
                    className={`tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => handleTabClick(tab)}
                  >
                    {tab}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="question-container" style={{ userSelect: 'none' }}>
            <h2>{questions[currentQuestionIndex]?.question}</h2>
            <div className="options">
              {questions[currentQuestionIndex]?.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${selectedOption === index ? 'selected' : ''}`}
                  onClick={() => setSelectedOption(index)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="actions">
              <button onClick={handleSkip} className="skip-button">Skip</button>
              <button onClick={handleSubmit} className="submit-button">Submit</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="score-container">
          <h2>Quiz Complete!</h2>
          <p>Your Score: {score}/{questions.length}</p>
        </div>
      )}
    </div>
  );
};

export default App;