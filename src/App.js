import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MD5 from 'crypto-js/md5';
import './App.css';
import LandingPage from './LandingPage';
import Questions from './Questions';
import Results from './Results';

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
  const [minScore, setMinScore] = useState(10);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStartScreen, setIsStartScreen] = useState(true);
  const [highlightedAnswers, setHighlightedAnswers] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [name, setName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [timeLimit, setTimeLimit] = useState(120);
  


  useEffect(() => {
    if (timeElapsed < 100 && !isQuizComplete) {
      const timer = setTimeout(() => {
        setTimeElapsed((prev) => prev + (100 / timeLimit)); // Increment percentage for 1 second
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeElapsed >= 100) {
      setIsQuizComplete(true);
    }
  }, [timeElapsed, isQuizComplete]);

  useEffect(() => {
    var messageDiv = document.getElementById("myMessage");
    if (messageDiv) {
      if(score > minScore){
        messageDiv.innerHTML='<p>Congrats You have made it to the leaderboard. Please remember to publish the score on last screen</p>';
      } else {
        messageDiv.innerHTML='';
      }
      
    } 
    //console.log('message Div ' + messageDiv);
  }, [score]);

  const handleStartClick = (tab) => {
    
    setActiveTab(tab);
    setIsStartScreen(false);
    setIsLoading(true);
    setTimeElapsed(0);
    setName(localStorage.getItem('user-name'));
    //console.log(name);
    if(tab === 'Maths'){
      setTimeLimit(240);
    }
    
    client
      .get(`exec?subjectName=${tab}`)
      .then((response) => {
        
        setQuestions(response.data);
        setError(null);
      })
      .catch(() => setError('Failed to load questions.'))
      .finally(() => setIsLoading(false));
    
    leaderboardClient
      .get(`exec?subjectName=${tab}&method=createSession`)
      .then((response) => {
        
        setSessionId(response.data.newSessionId);
        setLeaderboardData(response.data.leaderBoard);
        setMinScore(response.data.leaderBoard[9][1]);
        setError(null);
      })
      .catch(() => setError('Failed to create session.'))
      .finally(() => setIsLoading(false));
  };

  const handleSubmit = () => {
    const correctAnswer = questions[currentQuestionIndex]?.answer % 17;
    var mySelection = selectedOption;
    setSelectedOption(null);
    //console.log(score);

    if (mySelection === correctAnswer) {
      setScore((prev) => prev + 1);
      setHighlightedAnswers({ correct: correctAnswer });
    } else {
      setHighlightedAnswers({ correct: correctAnswer, wrong: mySelection });
      setScore((prev) => prev - 0.25);
    }

    setTimeout(() => {
      setHighlightedAnswers(null);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setIsQuizComplete(true);
      }
    }, 500);
  };

  const handleSkip = () => {
    setSelectedOption(null);
    //console.log(timeLimit);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
    questions.push(questions[currentQuestionIndex]);
  };

  const handlePublish = (e) => {
    e.preventDefault();
    localStorage.setItem('user-name', name);
    //console.log(name);
    const md5Hash = MD5(name + score).toString();

    leaderboardClient
      .get(`exec?subjectName=${activeTab}&name=${name}&score=${score}&session=${sessionId}&md5Hash=${md5Hash}`)
      .then((response) => {
        setError(null);
        document.getElementById("resultTitle").innerHTML='';
      })
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setIsLoading(false));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="app">
      {isStartScreen ? (
        <LandingPage onStart={handleStartClick} />
      ) : !isQuizComplete ? (
        <Questions
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          highlightedAnswers={highlightedAnswers}
          handleSubmit={handleSubmit}
          handleSkip={handleSkip}
          timeElapsed={timeElapsed}
        />
      ) : (
        <Results
          score={score}
          activeTab={activeTab}
          name={name}
          setName={setName}
          onPublish={handlePublish}
          leaderboardData={leaderboardData}
        />
      )}
    </div>
  );
};

export default App;
