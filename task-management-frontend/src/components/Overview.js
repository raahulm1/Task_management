import React from 'react';

function Overview({ tasks, projectName }) {
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(task => (task.status || "").toLowerCase() === 'todo').length;
  const inProgressTasks = tasks.filter(task => (task.status || "").toLowerCase() === 'in progress').length;
  const completedTasks = tasks.filter(task => (task.status || "").toLowerCase() === 'completed').length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="row">
      <div className="col-md-3 mb-3">
        <div className="card bg-primary text-white">
          <div className="card-body text-center">
            <h5 className="card-title">Total Tasks</h5>
            <h2 className="card-text">{totalTasks}</h2>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 mb-3">
        <div className="card bg-warning text-dark">
          <div className="card-body text-center">
            <h5 className="card-title">To Do</h5>
            <h2 className="card-text">{todoTasks}</h2>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 mb-3">
        <div className="card bg-info text-white">
          <div className="card-body text-center">
            <h5 className="card-title">In Progress</h5>
            <h2 className="card-text">{inProgressTasks}</h2>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 mb-3">
        <div className="card bg-success text-white">
          <div className="card-body text-center">
            <h5 className="card-title">Completed</h5>
            <h2 className="card-text">{completedTasks}</h2>
          </div>
        </div>
      </div>
      
      <div className="col-12">
        <div className="card bg-dark text-white">
          <div className="card-body">
            <h5 className="card-title">Project Progress</h5>
            <div className="progress mb-2">
              <div 
                className="progress-bar bg-success" 
                role="progressbar" 
                style={{ width: `${completionRate}%` }}
                aria-valuenow={completionRate} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                {completionRate}%
              </div>
            </div>
            <p className="card-text">
              {completionRate}% of tasks completed ({completedTasks} out of {totalTasks})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview; 