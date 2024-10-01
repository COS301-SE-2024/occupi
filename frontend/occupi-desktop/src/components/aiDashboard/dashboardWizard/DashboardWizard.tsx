import React, { useState } from 'react';
import { Modal, Button, ModalBody, ModalFooter, ModalHeader } from "@nextui-org/react";

interface WizardStep {
  title: string;
  content: string;
  target: string;
}

const wizardSteps: WizardStep[] = [
  {
    title: "Welcome to AI Dashboard",
    content: "This wizard will guide you through the main features of the dashboard.",
    target: "body",
  },
  {
    title: "AI Analysis Cards",
    content: "These cards show key metrics about your office space.",
    target: "[data-wizard-target='cards']",
  },
  {
    title: "Predicted Capacity Levels",
    content: "This graph shows the predicted office capacity for the week.",
    target: "[data-wizard-target='graph1']",
  },
  {
    title: "AI Predicted vs Actual Capacity",
    content: "Compare AI predictions with actual office capacity.",
    target: "[data-wizard-target='graph2']",
  },
  {
    title: "Customizable Layout",
    content: "You can drag and resize elements to customize your dashboard.",
    target: "body",
  },
];

interface DashboardWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardWizard: React.FC<DashboardWizardProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const highlightElement = (target: string) => {
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('wizard-highlight');
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      highlightElement(wizardSteps[currentStep].target);
    }
    return () => {
      document.querySelectorAll('.wizard-highlight').forEach(el => el.classList.remove('wizard-highlight'));
    };
  }, [currentStep, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>{wizardSteps[currentStep].title}</ModalHeader>
      <ModalBody>{wizardSteps[currentStep].content}</ModalBody>
      <ModalFooter>
        <Button  color="danger" onClick={onClose}>
          Skip Tutorial
        </Button>
        <Button color="primary" onClick={handlePrevious} disabled={currentStep === 0}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          {currentStep === wizardSteps.length - 1 ? "Finish" : "Next"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DashboardWizard;