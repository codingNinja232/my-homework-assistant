// Importing required modules
import React, { useState, useEffect } from 'react';
import axios from "axios";
import MD5 from "crypto-js/md5";
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
  const [timeElapsed, setTimeElapsed] = useState(0); // Percentage of time elapsed
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [name, setName] = useState('');
  const [sessionId, setSessionId] = useState('');

  

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

      leaderboardClient.get(`exec?subjectName=${tab}&method=createSession`)
      .then((response) => {
        setSessionId(response.data.newSessionId);
        setError(null);
      })
      .catch(() => setError('Failed to create session.'))
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
    }, 1000);    
  };

  const handleSkip = () => {
    setSelectedOption(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
    questions[questions.length]=questions[currentQuestionIndex];
  };

  var hasPublished = false;
  const handlePublish = (e) => {
    e.preventDefault(); // Prevent the page from refreshing
    hasPublished=true;
    document.getElementById('publishResults').disabled = true;
    var md5Hash=MD5(name+score).toString();
    console.log('name: ' +name + ' score '+ score+ ' md5Hash '+md5Hash);
    
    leaderboardClient.get(`exec?subjectName=${activeTab}&name=${name}&score=${score}&session=${sessionId}`)
      .then((response) => {
      document.getElementById('scoreContainerTitle').innerHTML = "";
      setLeaderboardData(response.data.leaderBoard);
      setRank(response.data.rank);
      setError(null);    
    })
    .catch(() => setError('Failed to load leaderboard.'))
    .finally(() => setIsLoading(false));
     
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (isStartScreen) {
    return (
      <div className="start-screen">
        <h1>Welcome to The Glory Board!</h1>
        
        <p>Test your knowledge across various subjects. You will get 2 min to complete the quiz. Each question has 4 possible answers. 
          You get 1 point for correct answer and -0.25 points for wrong answer. 
          You can skip the question without changing score.
        </p>
        <br/>
        <p>Select a category to start:</p>
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
              <button onClick={handleSubmit} className="submit-button" disabled={selectedOption === null}>Submit</button>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${timeElapsed}%` }}></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="score-container">
          <h2>{activeTab} Quiz Complete!</h2>
          <div id='scoreContainerTitle'>
            <p>Your Score: {score} out of {questions.length} questions. 
              If you with to publish the scores to The Gloryboard, please enter your name and click publish.
            </p>  
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
                  <button id='publishResults' type="submit" style={{ marginLeft: '10px' }}>Publish</button>
                </div>
                
              </form>
          </div>
          <div style={{ padding: '20px' }}>
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
          <p>Date Time : {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
};

export default App;
