import React from 'react';

const Questions = ({
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  selectedOption,
  setSelectedOption,
  highlightedAnswers,
  handleSubmit,
  handleSkip,
  timeElapsed
}) => {
  return (
    <div>
      <div className="question-container" style={{ userSelect: 'none' }}>
        <div className="question">{questions[currentQuestionIndex]?.question}</div>
        <div className="options">
          {questions[currentQuestionIndex]?.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${
                highlightedAnswers?.correct === index
                  ? 'correct'
                  : highlightedAnswers?.wrong === index
                  ? 'wrong'
                  : selectedOption === index
                  ? 'selected'
                  : ''
              }`}
              onClick={() => setSelectedOption(index)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="actions">
          <button onClick={handleSkip} className="skip-button">
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className="submit-button"
            disabled={selectedOption === null}
          >
            Submit
          </button>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${timeElapsed}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default Questions;
