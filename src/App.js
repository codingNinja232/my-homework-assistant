// Importing required modules
import React, { useState, useEffect } from 'react';
import axios from "axios";
import './App.css';

const client = axios.create({
  baseURL: "https://myApi" 
});

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Maths');

  const hardcodedQuestions = [
    { question: "Please wait while the questions are being loaded", options: ["", "", "", ""], answer: 5 },
    { question: "What is the capital of France?", options: ["Berlin", "London", "Paris", "Rome"], answer: 2 },
    { question: "What color is the sky?", options: ["Blue", "Green", "Red", "Yellow"], answer: 0 }
  ];

  useEffect(() => {  
    setQuestions(hardcodedQuestions);
    client.get('exec?subjectName=Maths').then((response) => {
      setQuestions(response.data);
      //console.log(response.data);
    });
  }, []);

  const options = document.querySelectorAll('.option-button');

  const handleAnswerClick = (index) => {
    var correctAnswer= questions[currentQuestionIndex].answer;
    correctAnswer = correctAnswer<4 ? correctAnswer : correctAnswer% 17;
    if (correctAnswer === index) {
      setScore(score + 1);
    }
    if (currentQuestionIndex < questions.length - 1) {
      
      options[correctAnswer].classList.add('correct');
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        options[correctAnswer].classList.remove('correct');
      }, 2000);
      
    } else {
      setIsQuizComplete(true);
    }
  };

  const links = document.querySelectorAll('.tab');

  const handleTabClick = (tab) => {
    links.forEach((link) => {
        console.log("Getting Data for " + tab);
        if (link.id === tab) {
            link.classList.add("active");
            
        }else {
          link.classList.remove("active");
        }        
    });
    client.get('exec?subjectName='+tab, { crossdomain: true }).then((response) => {
      setQuestions(response.data);
    });
    setSelectedTab(tab);
  };

  return (
    <div className="app">
      {!isQuizComplete ? (
        questions.length > 0 && (
          
          <div className="question-container">
            <div className="nav-bar">
            <ul>
              <li><a className="tab active" id="Maths" onClick={() => handleTabClick('Maths')}>Maths</a></li>
              <li><a className="tab" id="SST" onClick={() => handleTabClick('SST')}>SST</a></li>
              <li><a className="tab" id="Science" onClick={() => handleTabClick('Science')}>Science</a></li>
            </ul>
            </div>
            <h2>{questions[currentQuestionIndex].question}</h2>
            <div className="options">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  className="option-button"
                  onClick={() => handleAnswerClick(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )
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