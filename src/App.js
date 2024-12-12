// Importing required modules
import React, { useState, useEffect } from 'react';
import axios from "axios";
import './App.css';

const client = axios.create({
  baseURL: "http://myapi" 
});

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const hardcodedQuestions = [
    { question: "Please wait while the questions are being loaded", options: ["", "", "", ""], answer: 5 },
    { question: "What is the capital of France?", options: ["Berlin", "London", "Paris", "Rome"], answer: 2 },
    { question: "What color is the sky?", options: ["Blue", "Green", "Red", "Yellow"], answer: 0 },
    { question: "What is 5 x 3?", options: ["15", "20", "10", "25"], answer: 0 },
    { question: "Which is a mammal?", options: ["Shark", "Frog", "Dog", "Eagle"], answer: 2 },
    { question: "What is the boiling point of water?", options: ["90°C", "100°C", "80°C", "110°C"], answer: 1 },
    { question: "What planet do we live on?", options: ["Mars", "Venus", "Earth", "Jupiter"], answer: 2 },
    { question: "What is 10 / 2?", options: ["3", "4", "5", "6"], answer: 2 },
    { question: "What is the largest ocean?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], answer: 2 },
    { question: "What is 7 - 3?", options: ["5", "4", "3", "2"], answer: 1 },
  ];

  useEffect(() => {  
    setQuestions(hardcodedQuestions);
    client.get().then((response) => {
      setQuestions(response.data);
      //console.log(response.data);
    });
  }, []);

  const handleAnswerClick = (index) => {
    if (questions[currentQuestionIndex].answer === index) {
      setScore(score + 1);
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsQuizComplete(true);
    }
  };

  return (
    <div className="app">
      {!isQuizComplete ? (
        questions.length > 0 && (
          <div className="question-container">
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