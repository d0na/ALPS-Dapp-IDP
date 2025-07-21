import React from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import { ThemeProvider } from "@material-ui/styles";
import theme from "ColorTheme";
import { Row, Col } from "reactstrap";
import {
  StepModeSelection,
  StepConfiguration,
  StepReviewGenerate,
  generateSmartLicenseJson
} from "components/build-smart-license";

const STEPS = ["Select Creation Mode", "Configure License", "Review & Generate"];

class BuildSmartLicense extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0,
      mode: '',
      manualData: {
        title: '',
        licensor: '',
        type: '',
        duration: '',
        royaltyRate: '',
        territory: '',
        ipDescription: '',
        restrictions: ''
      },
      aiText: '',
      generatedJson: ''
    };
  }

  handleNext = () => {
    const { activeStep } = this.state;
    if (activeStep === 1) {
      // Generate JSON when moving to step 3
      this.generateJson();
    }
    this.setState({ activeStep: activeStep + 1 });
  };

  handleBack = () => {
    this.setState({ 
      activeStep: this.state.activeStep - 1 
    });
  };

  handleStep = (step) => {
    this.setState({ activeStep: step });
  };

  generateJson = () => {
    const { mode, manualData, aiText } = this.state;
    const jsonString = generateSmartLicenseJson(mode, manualData, aiText);
    this.setState({ generatedJson: jsonString });
  };

  handleCreateLicense = (jsonData) => {
    // Here you could integrate with blockchain deployment, API calls, etc.
    console.log('Creating smart license with data:', jsonData);
    alert('Smart License created and ready for deployment!');
    
    // Optional: Reset the form or redirect to a success page
    // this.setState({ activeStep: 0, mode: '', manualData: {...}, aiText: '', generatedJson: '' });
  };

  renderStepContent = () => {
    const { activeStep, mode, manualData, aiText, generatedJson } = this.state;

    switch (activeStep) {
      case 0:
        return (
          <StepModeSelection
            mode={mode}
            setMode={(newMode) => this.setState({ mode: newMode })}
            handleNext={this.handleNext}
          />
        );
      
      case 1:
        return (
          <StepConfiguration
            mode={mode}
            manualData={manualData}
            setManualData={(newData) => this.setState({ manualData: newData })}
            aiText={aiText}
            setAiText={(newText) => this.setState({ aiText: newText })}
            handleNext={this.handleNext}
            handleBack={this.handleBack}
          />
        );
      
      case 2:
        return (
          <StepReviewGenerate
            generatedJson={generatedJson}
            generateJson={this.generateJson}
            handleBack={this.handleBack}
            onCreateLicense={this.handleCreateLicense}
          />
        );
      
      default:
        return null;
    }
  };

  render() {
    const { activeStep } = this.state;

    return (
      <div className="content">
        <Row>
          <Col md="12">
            <ThemeProvider theme={theme}>
              <div style={{ width: '100%' }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {STEPS.map((label, index) => (
                    <Step key={label}>
                      <StepButton onClick={() => this.handleStep(index)}>
                        {label}
                      </StepButton>
                    </Step>
                  ))}
                </Stepper>

                <div style={{ marginTop: '20px' }}>
                  {this.renderStepContent()}
                </div>
              </div>
            </ThemeProvider>
          </Col>
        </Row>
      </div>
    );
  }
}

export default BuildSmartLicense; 