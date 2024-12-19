// Results.js
import React from 'react';

const Results = ({ 
  score, 
  activeTab, 
  name, 
  setName, 
  onPublish, 
  leaderboardData, 
  rank 
}) => {
  return (
    <div className="score-container">
        <h2>{activeTab} Quiz Complete!</h2>
        {!(leaderboardData.length > 0) && <div id='resultTitle'>
        
            <p>Your Score is : {score}</p>
            <p>If you wish to publish the scores to The Glory Board, please enter your name and click publish.</p>
            <form onSubmit={onPublish}>
                <label htmlFor="name">Name: </label>
                <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                />
                <button id="publishResults" type="submit">Publish</button>
            </form>
        </div>
        }
      {rank > 0 && <p>Your Rank: {rank}</p>}
      {leaderboardData.length > 0 && (
        <div className="table">
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
        </div>
      )}
      <p>Date Time: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default Results;
