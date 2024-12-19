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
  const [rank, setRank] = useState(0);
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
    console.log(tab);
    setActiveTab(tab);
    setIsStartScreen(false);
    setIsLoading(true);
    console.log('before call' +tab);
    client
      .get(`exec?subjectName=${tab}`)
      .then((response) => {
        console.log('in call' +tab);
        setQuestions(response.data);
        setError(null);
      })
      .catch(() => setError('Failed to load questions.'))
      .finally(() => setIsLoading(false));
    console.log('in call' +tab);
    leaderboardClient
      .get(`exec?subjectName=${tab}&method=createSession`)
      .then((response) => {
        console.log('in leaderboardClient call' +tab);
        setSessionId(response.data.newSessionId);
        setError(null);
      })
      .catch(() => setError('Failed to create session.'))
      .finally(() => setIsLoading(false));
  };

  const handleSubmit = () => {
    const correctAnswer = questions[currentQuestionIndex]?.answer % 17;

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
    questions.push(questions[currentQuestionIndex]);
  };

  const handlePublish = (e) => {
    e.preventDefault();
    const md5Hash = MD5(name + score).toString();

    leaderboardClient
      .get(`exec?subjectName=${activeTab}&name=${name}&score=${score}&session=${sessionId}&md5Hash=${md5Hash}`)
      .then((response) => {
        setLeaderboardData(response.data.leaderBoard);
        setRank(response.data.rank);
        setError(null);
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
          setCurrentQuestionIndex={setCurrentQuestionIndex}
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
          rank={rank}
        />
      )}
    </div>
  );
};

export default App;
