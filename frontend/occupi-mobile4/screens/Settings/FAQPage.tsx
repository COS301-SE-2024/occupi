import React from 'react';
import { ScrollView, useColorScheme } from 'react-native';
import { View, Text, Accordion, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent } from '@gluestack-ui/themed';
import { router } from 'expo-router';

const FAQPage = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const faqData = [
    {
      section: "Profile Page FAQs",
      questions: [
        {
          question: "How do I edit my profile information?",
          answer: "To edit your profile, go to the Profile page and tap the 'Edit' button. You can then modify your personal details, contact information, and preferences."
        },
        {
          question: "Can I change my profile picture?",
          answer: "Yes, you can change your profile picture. On the Profile page, tap your current picture or the camera icon to upload a new photo or choose one from your device."
        },
        {
          question: "Where can I adjust my notification settings?",
          answer: "Notification settings can be found in the Profile page under 'Settings' or 'Preferences'. Here you can customize what notifications you receive and how."
        },
        {
          question: "How do I manage my account preferences?",
          answer: "Account preferences are located in the Profile section. Look for options like 'Account Settings' or 'Preferences' to adjust your account-related choices."
        },
        {
          question: "Can I customize the app's appearance?",
          answer: "Yes, the app offers appearance customization. In the Profile or Settings section, look for 'Appearance' or 'Theme' options to change colors, dark/light mode, etc."
        },
      ]
    },
    {
      section: "Book a Room FAQs",
      questions: [
        {
          question: "How do I search for available rooms?",
          answer: "Use the search bar on the Book a Room page. Enter your desired dates, location, and any specific requirements to see available options."
        },
        {
          question: "Can I filter rooms by specific amenities?",
          answer: "Yes, you can use filters to narrow down rooms by amenities. Look for a filter option on the search results page to select specific features you need."
        },
        {
          question: "What's the booking process?",
          answer: "Select your desired room, choose your dates, review the details and price, and then click 'Book Now'. Follow the prompts to complete your reservation."
        },
        {
          question: "How far in advance can I book a room?",
          answer: "Booking windows vary, but typically you can book rooms up to 6-12 months in advance, depending on the property's policies."
        },
        {
          question: "Is there a cancellation policy?",
          answer: "Yes, cancellation policies are specific to each booking. You can find the policy details on the room information page before confirming your reservation."
        },
      ]
    },
    {
      section: "My Bookings FAQs",
      questions: [
        {
          question: "Where can I see all my current bookings?",
          answer: "All your current bookings are listed on the My Bookings page. You can access this from the main menu or dashboard."
        },
        {
          question: "How do I modify an existing booking?",
          answer: "To modify a booking, find it in your My Bookings list and tap 'Modify' or 'Edit'. Follow the prompts to make changes, subject to availability and policy."
        },
        {
          question: "Can I cancel a booking? If so, how?",
          answer: "Yes, you can cancel bookings from the My Bookings page. Find the booking you want to cancel and tap 'Cancel'. Be aware of any cancellation fees or policies."
        },
        {
          question: "Is there a way to view my booking history?",
          answer: "Yes, your booking history should be available on the My Bookings page. Look for a 'History' or 'Past Bookings' tab to view previous reservations."
        },
        {
          question: "How do I get a receipt for my booking?",
          answer: "Receipts are usually emailed to you after your stay. You can also find them in the My Bookings section - look for a 'Receipt' or 'Invoice' option for each booking."
        },
      ]
    },
    {
      section: "Login/Signup FAQs",
      questions: [
        {
          question: "How do I create a new account?",
          answer: "On the login screen, look for a 'Sign Up' or 'Create Account' option. Fill in the required information and follow the prompts to set up your new account."
        },
        {
          question: "What should I do if I forget my password?",
          answer: "On the login screen, tap 'Forgot Password'. Enter your email address, and we'll send you instructions to reset your password."
        },
        {
          question: "Can I use social media accounts to sign up or log in?",
          answer: "Yes, we offer social media login options. Look for icons of supported platforms (like Facebook or Google) on the login/signup page to use these services."
        },
        {
          question: "Is there a verification process for new accounts?",
          answer: "Yes, we usually send a verification email to confirm your email address. Some accounts may require additional verification steps for security."
        },
        {
          question: "How secure is my login information?",
          answer: "We use industry-standard encryption to protect your login information. We also recommend using a strong, unique password and enabling two-factor authentication if available."
        },
      ]
    },
    {
      section: "Dashboard FAQs",
      questions: [
        {
          question: "What information is displayed on my dashboard?",
          answer: "Your dashboard shows an overview of your account, including recent bookings, upcoming reservations, account statistics, and quick access to key features."
        },
        {
          question: "How often is the dashboard data updated?",
          answer: "Dashboard data is typically updated in real-time or very frequently to provide the most current information about your account and bookings."
        },
        {
          question: "Can I customize the dashboard layout?",
          answer: "Some elements of the dashboard may be customizable. Look for a 'Customize' or 'Edit Layout' option to arrange the information according to your preferences."
        },
        {
          question: "How do I interpret the graphs and statistics shown?",
          answer: "Hover over or tap on graph elements for more detailed information. There may also be a 'Help' or 'Info' icon near each graph explaining what the data represents."
        },
        {
          question: "Is there a way to export dashboard data?",
          answer: "Check for an 'Export' or 'Download' option on your dashboard. This feature, if available, allows you to save your data in various formats for personal record-keeping or analysis."
        },
      ]
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDarkMode ? 'black' : 'white', paddingHorizontal: 16, paddingTop: 60 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDarkMode ? 'white' : 'black', marginBottom: 20 }}>Frequently Asked Questions</Text>
      <Accordion type="single" defaultValue="item-1" backgroundColor={isDarkMode ? 'black' : 'white'} marginBottom={70} shadowColor="transparent">
        {faqData.map((section, sectionIndex) => (
          <View key={`section-${sectionIndex}`} style={{ marginBottom: 20, backgroundColor: isDarkMode ? 'black' : 'white'}}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDarkMode ? 'white' : 'black', marginBottom: 10 }}>{section.section}</Text>
            {section.questions.map((item, index) => (
              <AccordionItem key={`item-${sectionIndex}-${index}`} value={`item-${sectionIndex}-${index}`} style={{ backgroundColor: isDarkMode ? 'black' : 'white'}}>
                <AccordionHeader style={{ backgroundColor: isDarkMode ? '#2C2C2E' : '#F3F3F3', borderRadius: 10, marginBottom: 10 }}>
                  <AccordionTrigger>
                    <Text style={{ color: isDarkMode ? 'white' : 'black', fontSize: 16, fontWeight: 'bold' }}>{item.question}</Text>
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionContent style={{ backgroundColor: isDarkMode ? 'black' : 'white', borderRadius: 10 }}>
                  <Text style={{ color: isDarkMode ? '#CCCCCC' : '#333333', fontSize: 14 }}>{item.answer}</Text>
                </AccordionContent>
              </AccordionItem>
            ))}
          </View>
        ))}
      </Accordion>
      {/* Add testID to an element that triggers navigation, for example: */}
      <Text testID="profile-link" style={{ color: isDarkMode ? 'white' : 'black' }} onPress={() => router.push('/profile')}>
        Go to Profile
      </Text>
    </ScrollView>
  );
};

export default FAQPage;