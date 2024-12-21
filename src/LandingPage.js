import React from 'react';

const LandingPage = ({ onStart }) => {
  return (
    <div className="start-screen">
      <h1>Welcome to The Glory Board!</h1>
      <p>
        Test your knowledge across various subjects. You will get 2-4 minutes to complete the quiz. Each question has 4 possible answers.
        You get 1 point for a correct answer and -0.25 points for a wrong answer.
        You can skip the question without changing your score.
      </p>
      <br />
      <p>Select a category to start:</p>
      <div className="nav-bar">
        <button className="start-button" onClick={() => onStart('Maths')}>Maths</button>
        <button className="start-button" onClick={() => onStart('SST')}>SST</button>
        <button className="start-button" onClick={() => onStart('Science')}>Science</button>
        <button className="start-button" onClick={() => onStart('English')}>English</button>
        <button className="start-button" onClick={() => onStart('Marathi')}>मराठी</button>
        <button className="start-button" onClick={() => onStart('Hindi')}>हिंदी</button>
      </div>
    </div>
  );
};

export default LandingPage;
