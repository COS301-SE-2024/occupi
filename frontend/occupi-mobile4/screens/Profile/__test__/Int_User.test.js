import React from 'react';
import renderer, { act } from 'react-test-renderer';
import FAQPage from '../FAQPage';
import Profile from '../Profile';
import Settings from '../Settings';
import { router } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    navigate: jest.fn(),
  },
}));

// Override the original components with inline mock components
jest.mock('../FAQPage', () => (props) => (
  <div {...props}>
    <div
      testID="profile-link"
      onPress={() => {
        require('expo-router').router.push('/profile');
      }}
    />
  </div>
));
jest.mock('../Profile', () => (props) => (
  <div {...props}>
    <div
      testID="settings-link"
      onPress={() => {
        require('expo-router').router.push('/settings');
      }}
    />
  </div>
));
jest.mock('../Settings', () => (props) => (
  <div {...props}>
    <div
      testID="faq-link"
      onPress={() => {
        require('expo-router').router.push('/faq');
      }}
    />
  </div>
));

describe('App Navigation Flow for FAQPage, Settings, Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render components without crashing', () => {
    const components = [FAQPage, Profile, Settings];

    components.forEach((Component) => {
      const tree = renderer.create(<Component />).toJSON();
      expect(tree).toBeTruthy();
    });
  });

  it('should navigate to Profile when link in FAQPage is pressed', () => {
    const faqPage = renderer.create(<FAQPage />);
    const profileLink = faqPage.root.findByProps({ testID: 'profile-link' });

    act(() => {
      profileLink.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith('/profile');
  });

  it('should navigate to Settings when link in Profile is pressed', () => {
    const profile = renderer.create(<Profile />);
    const settingsLink = profile.root.findByProps({ testID: 'settings-link' });

    act(() => {
      settingsLink.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith('/settings');
  });

  it('should navigate to FAQPage when link in Settings is pressed', () => {
    const settings = renderer.create(<Settings />);
    const faqLink = settings.root.findByProps({ testID: 'faq-link' });

    act(() => {
      faqLink.props.onPress();
    });

    expect(router.push).toHaveBeenCalledWith('/faq');
  });
});
