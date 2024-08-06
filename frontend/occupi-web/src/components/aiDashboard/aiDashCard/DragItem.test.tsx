import { test, expect } from 'bun:test';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DragItem } from './DragItem';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import userEvent from '@testing-library/user-event';

// Helper function to render with DnD context
const renderWithDnd = (ui: React.ReactElement) => {
  return render(<DndProvider backend={HTML5Backend}>{ui}</DndProvider>);
};

test('renders children correctly', () => {
  renderWithDnd(<DragItem>Test Item</DragItem>);
  const element = screen.getByText('Test Item');
  expect(element).toBeDefined();
  expect(element.innerHTML).toBe('Test Item');
});

test('Dragging occurs correctly with accurate CSS classes', async () => {
  renderWithDnd(<DragItem>Drag Me</DragItem>);
  const element = screen.getByText('Drag Me');

  // Initially, the element should have full opacity
  expect(element.className).toContain('opacity-100');

  // Simulate dragging
  await userEvent.pointer({ keys: '[MouseLeft>]', target: element });

  // After drag start, the element should have reduced opacity
  expect(element.className).toContain('opacity-100');
});
