// Importing required modules
import React, { useState, useEffect } from 'react';
import axios from "axios";
import './App.css';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASEURI
});
const leaderboardClient = axios.create({
  baseURL: process.env.REACT_APP_LEADERBOARD_API_BASEURI
});

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStartScreen, setIsStartScreen] = useState(true);
  const [highlightedAnswers, setHighlightedAnswers] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timeElapsed, setTimeElapsed] = useState(0); // Percentage of time elapsed
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [name, setName] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  

  useEffect(() => {
    if (timeElapsed < 100 && !isQuizComplete) {
      const timer = setTimeout(() => {
        setTimeElapsed((prev) => prev + (100 / 120)); // Increment percentage for 1 second
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeElapsed >= 100) {
      setIsQuizComplete(true);
    }
  }, [timeElapsed, isQuizComplete]);

  const restartQuiz = () => {
    setTimeLeft(120);
    setScore(0);
    setCurrentQuestionIndex(0);
    setIsQuizComplete(false);
  };

  const handleStartClick = (tab) => {
    setActiveTab(tab);
    setIsStartScreen(false);
    setIsLoading(true); //
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
      setHighlightedAnswers({ correct: correctAnswer });
    } else {
      setHighlightedAnswers({ correct: correctAnswer, wrong: selectedOption });
      setScore((prev) => prev - 0.25);
    }
    setTimeout(() => {
      setHighlightedAnswers(null);
      setSelectedOption(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setIsQuizComplete(true);
      }
      console.log('score : ' + score);
    }, 1000);

    //console.log('currentQuestionIndex : ' + currentQuestionIndex);
    
  };

  const handleSkip = () => {
    setSelectedOption(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
    questions[questions.length]=questions[currentQuestionIndex];

    console.log('questions.length' + questions.length);
  };

  const handlePublish = (e) => {
    e.preventDefault(); // Prevent the page from refreshing
    try {
      leaderboardClient.get(`exec?subjectName=${activeTab}&name=${name}&score=${score}`)
      .then((response) => {
        setLeaderboardData(response.data.leaderBoard);
        setRank(response.data.rank);
        setError(null);
        console.log('leaderboardData : ' + leaderboardData);
      })
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setIsLoading(false));
    } catch (error) {
      setResponseMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
    
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (isStartScreen) {
    return (
      <div className="start-screen">
        <h1>Welcome to the Homework Assistant!</h1>
        <p>Test your knowledge across various subjects. You will get 2 min to answer as many questions as you like. You would be presented with a question with 4 possible answers. If you select the correct answer you get 1 point and if you select a wrong answer 0.25 points would be deducted from your score. 
          If you do not understand the question, you can skip it. Your score would not change if you skip the question. Select a category to start:</p>
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
            <div className="options" >
              {questions[currentQuestionIndex]?.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${
                    highlightedAnswers?.correct === index ? 'correct' : 
                    highlightedAnswers?.wrong === index ? 'wrong' : 
                    selectedOption === index ? 'selected' : ''
                  }`}
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
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${timeElapsed}%` }}></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="score-container">
          <h2>Quiz Complete!</h2>
          <p>Your Score: {score} out of {questions.length} questions. 
            If you with to publish the scores to the leaderboard, please enter your name and click publish.
          </p>
          
          <div style={{ padding: '20px' }}>
          { rank === 0 &&
          <div>
          <form onSubmit={handlePublish}>
            <div>
              <label htmlFor="name">Name: </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <button type="submit" style={{ marginLeft: '10px' }}>Publish</button>
            </div>
            
          </form>
          </div>
          }
          {rank > 0 && <p> Your Rank is {rank}</p>}
        </div>
          {leaderboardData.length > 0 &&<div className="table">
            <div className="table-row header">
              <div className="table-cell">Name</div>
              <div className="table-cell">Score</div>
            </div>
            
              {leaderboardData.map((item, index) => (
                <div className="table-row" key={index}>
                <div className="table-cell">{item[0]}</div>
                <div className="table-cell">{item[1]}</div>
              </div>
            
              ))}
            
          </div>}
        </div>
      )}
    </div>
  );
};

export default App;
