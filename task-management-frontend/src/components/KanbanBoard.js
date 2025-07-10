// src/components/KanbanBoard.js
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const columns = [
  { id: "todo", title: "To-Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
];

function KanbanBoard({ tasks, onStatusChange }) {
  const grouped = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    onStatusChange(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "flex", gap: "1rem" }}>
        {columns.map(col => (
          <Droppable droppableId={col.id} key={col.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  flex: 1,
                  minHeight: 300,
                  background: "#f4f4f4",
                  padding: 10,
                  borderRadius: 4,
                }}
              >
                <h3>{col.title}</h3>
                {grouped[col.id].map((task, idx) => (
                  <Draggable draggableId={task.id} index={idx} key={task.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          padding: 10,
                          margin: "0 0 8px 0",
                          background: "#fff",
                          borderRadius: 4,
                          ...provided.draggableProps.style,
                        }}
                      >
                        <strong>{task.title}</strong>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;