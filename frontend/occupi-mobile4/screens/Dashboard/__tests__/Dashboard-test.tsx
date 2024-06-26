import * as React from 'react';
import renderer from 'react-test-renderer';
import { useToast, StyledProvider, Theme } from '@gluestack-ui/themed'; // Ensure correct import paths
import Dashboard from '../Dashboard'; // Adjust the import path as needed

// Mock useToast
jest.mock('@gluestack-ui/themed', () => ({
  ...jest.requireActual('@gluestack-ui/themed'),
  useToast: () => ({
    show: jest.fn(),
  }),
}));

it('renders correctly', () => {
  const tree = renderer.create(
    <StyledProvider theme={Theme}>
      <Dashboard>Snapshot test!</Dashboard>
    </StyledProvider>
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
