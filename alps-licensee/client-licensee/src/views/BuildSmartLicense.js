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
} from "components/build-smart-license";

const STEPS = ["Select Creation Mode", "Configure License", "Review & Generate"];

class BuildSmartLicense extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0,
      mode: '',
      manualData: {
        name: '',
        licensor: '',
        licensee: '',
        durationYears: '',
        durationDays: '',
        territory: '',
        ips: '',
        rules: [],
        usageBase: {
          manufactured: '',
          manufacturedGraph: [],
          sold: '',
          soldGraph: [],
          activated: '',
          activatedGraph: [],
          usage: '',
          usageGraph: []
        },
        royaltyRate: '',
        royaltyRateGraph: []
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
    
    let jsonData;
    
    if (mode === 'manual') {
      jsonData = {
        smartLicense: {
          id: `SL_${Date.now()}`,
          title: manualData.name,
          licensor: manualData.licensor,
          licensee: manualData.licensee,
          intellectualProperty: {
            description: manualData.ips,
            type: "Patent/Copyright/Trademark", // Could be expanded
          },
          terms: {
            duration: {
              years: parseInt(manualData.durationYears) || 0,
              days: parseInt(manualData.durationDays) || 0,
              startDate: "TBD",
              endDate: "TBD"
            },
            territory: manualData.territory,
            royaltyRate: parseFloat(manualData.royaltyRate) || 0,
            royaltyRateGraph: manualData.royaltyRateGraph || []
          },
          rules: manualData.rules || [],
          usageBase: {
            manufactured: parseFloat(manualData.usageBase?.manufactured) || 0,
            manufacturedGraph: manualData.usageBase?.manufacturedGraph || [],
            sold: parseFloat(manualData.usageBase?.sold) || 0,
            soldGraph: manualData.usageBase?.soldGraph || [],
            activated: parseFloat(manualData.usageBase?.activated) || 0,
            activatedGraph: manualData.usageBase?.activatedGraph || [],
            usage: parseFloat(manualData.usageBase?.usage) || 0,
            usageGraph: manualData.usageBase?.usageGraph || []
          },
          status: "draft",
          createdAt: new Date().toISOString(),
          blockchain: {
            network: "ethereum",
            contractAddress: "TBD",
            deploymentTx: "TBD"
          }
        }
      };
    } else {
      // AI mode - simulate AI processing
      jsonData = {
        smartLicense: {
          id: `SL_AI_${Date.now()}`,
          title: "AI Generated License",
          licensor: "Extracted from text",
          licensee: "TBD",
          intellectualProperty: {
            description: "AI analyzed intellectual property from provided text",
            type: "AI Determined",
          },
          terms: {
            duration: {
              years: 1, // Default AI suggestion
              days: 0,
              startDate: "TBD",
              endDate: "TBD"
            },
            territory: "AI Determined Territory",
            royaltyRate: 5.0, // Default AI suggestion
            royaltyRateGraph: []
          },
          rules: [],
          usageBase: {
            manufactured: 0,
            manufacturedGraph: [],
            sold: 0,
            soldGraph: [],
            activated: 0,
            activatedGraph: [],
            usage: 0,
            usageGraph: []
          },
          aiAnalysis: {
            inputText: aiText.substring(0, 200) + "...", // Truncated for display
            confidence: 0.85,
            extractedEntities: ["Licensor", "Territory", "Duration", "Royalty"],
            suggestedImprovements: ["Clarify payment terms", "Define territory boundaries"]
          },
          status: "draft",
          createdAt: new Date().toISOString(),
          blockchain: {
            network: "ethereum",
            contractAddress: "TBD",
            deploymentTx: "TBD"
          }
        }
      };
    }

    this.setState({ 
      generatedJson: JSON.stringify(jsonData, null, 2) 
    });
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