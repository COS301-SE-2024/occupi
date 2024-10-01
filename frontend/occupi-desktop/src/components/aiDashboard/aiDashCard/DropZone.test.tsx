import { test, expect } from 'bun:test';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DropZone } from './DropZone';
import { TestBackend } from 'react-dnd-test-backend';
import { DndProvider as TestDndProvider } from 'react-dnd';

// Helper function to render with Test DnD context
const renderWithTestDnd = (ui: React.ReactElement) => {
  const backend = TestBackend;
  return render(<TestDndProvider backend={backend}>{ui}</TestDndProvider>);
};

test('renders children correctly', () => {
  renderWithTestDnd(<DropZone onDrop={() => {}}>Test Drop Zone</DropZone>);
  const element = screen.getByText('Test Drop Zone');
  expect(element).toBeDefined();
  expect(element.innerHTML).toBe('Test Drop Zone');
});

