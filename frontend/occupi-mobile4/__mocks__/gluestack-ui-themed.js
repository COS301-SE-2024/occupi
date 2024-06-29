// __mocks__/gluestack-ui-themed.js

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