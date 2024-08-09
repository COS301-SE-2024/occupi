// import * as React from 'react';
// import renderer from 'react-test-renderer';
// import NavBar from '../NavBar';
// import { useNavBar } from '../NavBarProvider';

// // Mock the NavBarProvider module
// jest.mock('../NavBarProvider', () => ({
//   useNavBar: jest.fn(),
// }));

// describe('NavBar', () => {
//   it(`renders correctly`, () => {
//     // Mock the useNavBar hook implementation
//     (useNavBar as jest.Mock).mockReturnValue({
//       currentTab: 'Home',
//       setCurrentTab: jest.fn(),
//     });

//     const tree = renderer.create(<NavBar />).toJSON();

//     expect(tree).toMatchSnapshot();
//   });
// });