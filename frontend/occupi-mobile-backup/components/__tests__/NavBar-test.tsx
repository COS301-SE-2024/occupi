import * as React from 'react';
import renderer from 'react-test-renderer';
import NavBar from '../NavBar';

it(`renders correctly`, () => {
  const tree = renderer.create(<NavBar>Snapshot test!</NavBar>).toJSON();

  expect(tree).toMatchSnapshot();
});
