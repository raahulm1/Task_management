import React from 'react';

function ProjectNavigation({ activeView, onViewChange, projectName }) {
  return (
    <div className="mb-4">
      <h2 className="mb-3 text-center">{projectName}</h2>
      <div className="d-flex justify-content-center">
        <div className="btn-group" role="group" aria-label="Project view navigation">
          <button
            type="button"
            className={`btn ${activeView === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onViewChange('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={`btn ${activeView === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onViewChange('list')}
          >
            List
          </button>
          <button
            type="button"
            className={`btn ${activeView === 'board' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onViewChange('board')}
          >
            Board
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectNavigation; 