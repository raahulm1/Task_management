import React from 'react';

function ProjectNavigation({ activeView, onViewChange, projectName }) {
  const tabs = [
    { key: 'list', label: 'List' },
    { key: 'board', label: 'Board' },
    { key: 'overview', label: 'Overview' },
  ];
  return (
    <div className="mb-4">
      <div className="d-flex align-items-center mb-2">
        <h2 className="mb-0 me-4" style={{ fontWeight: 600 }}>{projectName}</h2>
      </div>
      <div className="d-flex mb-2 border-bottom" style={{ gap: '30px', fontSize: '16px', cursor: 'pointer' }}>
        {tabs.map(tab => (
          <div
            key={tab.key}
            onClick={() => onViewChange(tab.key)}
            style={{
              paddingBottom: '8px',
              borderBottom: activeView === tab.key ? '2px solid #0d6efd' : '2px solid transparent',
              color: activeView === tab.key ? '#0d6efd' : '#aaa',
              fontWeight: activeView === tab.key ? 600 : 400,
              transition: 'border-bottom 0.2s ease, color 0.2s ease'
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectNavigation; 