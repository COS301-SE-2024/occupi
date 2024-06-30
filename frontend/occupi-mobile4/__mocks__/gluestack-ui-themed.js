// __mocks__/gluestack-ui-themed.js

import React from 'react';

const mockComponent = (name) => {
  return function(props) {
    return React.createElement(name, props, props.children);
  };
};
  
  module.exports = {
    Box: mockComponent('Box'),
    Center: mockComponent('Center'),
    useToast: () => ({
      show: jest.fn(),
    }),
    Text: mockComponent('Text'),
    Button: mockComponent('Button'),
    Input: mockComponent('Input'),
    Icon: mockComponent('Icon'),
    Image: mockComponent('Image'),
    Spinner: mockComponent('Spinner'),
    ScrollView: mockComponent('ScrollView'),
    FlatList: mockComponent('FlatList'),

  };

  module.exports = {
    Text: 'Text',
    View: 'View',
    Image: 'Image',
    Card: 'Card',
    Toast: 'Toast',
    useToast: () => ({
      show: jest.fn(),
    }),
    ToastTitle: 'ToastTitle',
    Button: 'Button',
    ButtonText: 'ButtonText',
  };