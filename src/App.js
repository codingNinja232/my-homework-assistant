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
  const [activeTab, setActiveTab] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStartScreen, setIsStartScreen] = useState(true);

  useEffect(() => {
    //setIsLoading(true);
    /*client.get(`exec?subjectName=Maths`)
      .then((response) => setQuestions(response.data))
      .catch(() => setError('Failed to load questions'))
      .finally(() => setIsLoading(false));*/
  }, []);

  const handleStartClick = (tab) => {
    setActiveTab(tab);
    setIsStartScreen(false);
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
    var correctAnswer = questions[currentQuestionIndex]?.answer % 17;
    
    if (selectedOption === correctAnswer) {
      setScore((prev) => prev + 1);
    }
    setSelectedOption(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
    console.log('currentQuestionIndex : ' + currentQuestionIndex);
    console.log('score : ' + score);
  };

  const handleSkip = () => {
    setSelectedOption(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
    //console.log('currentQuestionIndex' + currentQuestionIndex);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (isStartScreen) {
    return (
      <div className="start-screen">
        <h1>Welcome to the Quiz!</h1>
        <p>Test your knowledge across various subjects. Select a category to start:</p>
        <div className="nav-bar">
          <button className="start-button" onClick={() => handleStartClick('Maths')}>Maths</button>
          <button className="start-button" onClick={() => handleStartClick('SST')}>SST</button>
          <button className="start-button" onClick={() => handleStartClick('Science')}>Science</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!isQuizComplete ? (
        <div>
          <div className="question-container" style={{ userSelect: 'none' }}>
            <div className="question">{questions[currentQuestionIndex]?.question}</div>
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
