const actualModule = jest.requireActual('@gluestack-ui/themed');

module.exports = {
  ...actualModule,
  Icon: 'Icon',
  View: 'View',
  ScrollView: 'ScrollView',
  Text: 'Text',
  Image: 'Image',
  Box: 'Box',
  // Add any other components you're using from @gluestack-ui/themed
};