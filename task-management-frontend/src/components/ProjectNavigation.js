import React from 'react';

function ProjectNavigation({ activeView, onViewChange, projectName }) {
  return (
    <div className="mb-4">
      <div className="d-flex align-items-center mb-2">
        <h2 className="mb-0 me-4" style={{ fontWeight: 600 }}>{projectName}</h2>
      </div>
      <div className="d-flex">
        <div className="btn-group" role="group" aria-label="Project view navigation">
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
          <button
            type="button"
            className={`btn ${activeView === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onViewChange('overview')}
          >
            Overview
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectNavigation; 