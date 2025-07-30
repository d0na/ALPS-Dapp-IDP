import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import Typography from "@material-ui/core/Typography";
import { ThemeProvider } from "@material-ui/styles";
import theme from "ColorTheme";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import PropTypes from "prop-types";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Button,
  FormGroup,
  Input,
  Label,
} from "reactstrap";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  button: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  uploadButton: {
    margin: theme.spacing(1),
  },
  textField: {
    margin: theme.spacing(1),
    width: "100%",
  },
  formControl: {
    margin: theme.spacing(3),
  },
}));

function getSteps() {
  return ["Select Creation Mode", "Configure License", "Review & Generate"];
}

function StepContent({ 
  step, 
  mode, 
  setMode, 
  manualData, 
  setManualData, 
  aiText, 
  setAiText, 
  generatedJson, 
  generateJson,
  handleNext,
  handleBack
}) {
  const classes = useStyles();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAiText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  switch (step) {
    case 0:
      return (
        <Card>
          <CardHeader>
            <CardTitle tag="h4">Choose Creation Mode</CardTitle>
            <p className="card-category">
              Select how you want to create your smart license
            </p>
          </CardHeader>
          <CardBody>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Creation Mode</FormLabel>
              <RadioGroup
                aria-label="mode"
                name="mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <FormControlLabel
                  value="manual"
                  control={<Radio />}
                  label="Manual Configuration"
                />
                <Typography variant="body2" color="textSecondary" style={{ marginLeft: 32, marginBottom: 16 }}>
                  Use a structured form to manually configure all license parameters
                </Typography>
                
                <FormControlLabel
                  value="ai"
                  control={<Radio />}
                  label="AI-Assisted Creation"
                />
                <Typography variant="body2" color="textSecondary" style={{ marginLeft: 32 }}>
                  Upload a document or provide text for AI to analyze and generate the license
                </Typography>
              </RadioGroup>
            </FormControl>
            
            <Row>
              <Col md="12" className="text-right">
                <Button
                  color="primary"
                  onClick={handleNext}
                  disabled={!mode}
                >
                  Next
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      );

    case 1:
      return (
        <Card>
          <CardHeader>
            <CardTitle tag="h4">
              {mode === 'manual' ? 'Manual Configuration' : 'AI-Assisted Creation'}
            </CardTitle>
            <p className="card-category">
              {mode === 'manual' 
                ? 'Fill in the license details manually' 
                : 'Provide text or upload a document for AI analysis'
              }
            </p>
          </CardHeader>
          <CardBody>
            {mode === 'manual' ? (
              <div>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="licenseTitle">License Title</Label>
                      <Input
                        type="text"
                        id="licenseTitle"
                        placeholder="Enter license title"
                        value={manualData.title}
                        onChange={(e) => setManualData({...manualData, title: e.target.value})}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="licensorName">Licensor Name</Label>
                      <Input
                        type="text"
                        id="licensorName"
                        placeholder="Enter licensor name"
                        value={manualData.licensor}
                        onChange={(e) => setManualData({...manualData, licensor: e.target.value})}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="licenseType">License Type</Label>
                      <Input
                        type="select"
                        id="licenseType"
                        value={manualData.type}
                        onChange={(e) => setManualData({...manualData, type: e.target.value})}
                      >
                        <option value="">Select license type</option>
                        <option value="exclusive">Exclusive</option>
                        <option value="non-exclusive">Non-Exclusive</option>
                        <option value="sole">Sole</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="duration">Duration (months)</Label>
                      <Input
                        type="number"
                        id="duration"
                        placeholder="Enter duration in months"
                        value={manualData.duration}
                        onChange={(e) => setManualData({...manualData, duration: e.target.value})}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="royaltyRate">Royalty Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        id="royaltyRate"
                        placeholder="Enter royalty rate"
                        value={manualData.royaltyRate}
                        onChange={(e) => setManualData({...manualData, royaltyRate: e.target.value})}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="territory">Territory</Label>
                      <Input
                        type="text"
                        id="territory"
                        placeholder="e.g., Worldwide, USA, Europe"
                        value={manualData.territory}
                        onChange={(e) => setManualData({...manualData, territory: e.target.value})}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <FormGroup>
                      <Label for="ipDescription">Intellectual Property Description</Label>
                      <Input
                        type="textarea"
                        id="ipDescription"
                        rows="4"
                        placeholder="Describe the intellectual property being licensed"
                        value={manualData.ipDescription}
                        onChange={(e) => setManualData({...manualData, ipDescription: e.target.value})}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <FormGroup>
                      <Label for="restrictions">Restrictions & Limitations</Label>
                      <Input
                        type="textarea"
                        id="restrictions"
                        rows="3"
                        placeholder="Enter any restrictions or limitations"
                        value={manualData.restrictions}
                        onChange={(e) => setManualData({...manualData, restrictions: e.target.value})}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </div>
            ) : (
              <div>
                <Row>
                  <Col md="12">
                    <FormGroup>
                      <Label for="fileUpload">Upload Document</Label>
                      <div style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
                        <input
                          accept=".txt,.doc,.docx,.pdf"
                          style={{ display: 'none' }}
                          id="file-upload"
                          type="file"
                          onChange={handleFileUpload}
                        />
                        <label htmlFor="file-upload">
                          <Button
                            variant="contained"
                            color="primary"
                            component="span"
                            className={classes.uploadButton}
                          >
                            <CloudUploadIcon style={{ marginRight: 8 }} />
                            Upload Document
                          </Button>
                        </label>
                        <Typography variant="body2" color="textSecondary">
                          Supported formats: TXT, DOC, DOCX, PDF
                        </Typography>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <FormGroup>
                      <Label for="aiTextInput">Or Enter Text Manually</Label>
                      <Input
                        type="textarea"
                        id="aiTextInput"
                        rows="10"
                        placeholder="Paste or type the license agreement text, contract details, or requirements that you want AI to analyze and convert into a smart license..."
                        value={aiText}
                        onChange={(e) => setAiText(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </div>
            )}
            
            <Row>
              <Col md="12" className="text-right">
                <Button
                  color="secondary"
                  onClick={handleBack}
                  className="mr-2"
                >
                  Back
                </Button>
                <Button
                  color="primary"
                  onClick={handleNext}
                  disabled={mode === 'manual' ? !manualData.title : !aiText}
                >
                  Next
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      );

    case 2:
      return (
        <Card>
          <CardHeader>
            <CardTitle tag="h4">Review & Generate Smart License</CardTitle>
            <p className="card-category">
              Review the generated smart license JSON configuration
            </p>
          </CardHeader>
          <CardBody>
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label for="generatedJson">Generated Smart License JSON</Label>
                  <Input
                    type="textarea"
                    id="generatedJson"
                    rows="15"
                    value={generatedJson}
                    readOnly
                    style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '12px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <Button
                  color="info"
                  onClick={generateJson}
                  block
                >
                  Regenerate JSON
                </Button>
              </Col>
              <Col md="6">
                <Button
                  color="success"
                  block
                  onClick={() => {
                    // Here you would typically save/deploy the smart license
                    alert('Smart License created successfully!');
                  }}
                >
                  Create Smart License
                </Button>
              </Col>
            </Row>
            <Row>
              <Col md="12" className="text-right" style={{ marginTop: '15px' }}>
                <Button
                  color="secondary"
                  onClick={handleBack}
                >
                  Back
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      );

    default:
      return "Unknown step";
  }
}

StepContent.propTypes = {
  step: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
  manualData: PropTypes.shape({
    title: PropTypes.string,
    licensor: PropTypes.string,
    type: PropTypes.string,
    duration: PropTypes.string,
    royaltyRate: PropTypes.string,
    territory: PropTypes.string,
    ipDescription: PropTypes.string,
    restrictions: PropTypes.string,
  }).isRequired,
  setManualData: PropTypes.func.isRequired,
  aiText: PropTypes.string.isRequired,
  setAiText: PropTypes.func.isRequired,
  generatedJson: PropTypes.string.isRequired,
  generateJson: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

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

  getSteps = () => {
    return getSteps();
  };

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
          title: manualData.title,
          licensor: manualData.licensor,
          licensee: "TBD", // To be determined when license is executed
          intellectualProperty: {
            description: manualData.ipDescription,
            type: "Patent/Copyright/Trademark", // Could be expanded
          },
          terms: {
            licenseType: manualData.type,
            duration: {
              months: parseInt(manualData.duration) || 0,
              startDate: "TBD",
              endDate: "TBD"
            },
            territory: manualData.territory,
            royaltyRate: parseFloat(manualData.royaltyRate) || 0,
            restrictions: manualData.restrictions
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
            licenseType: "AI Analyzed",
            duration: {
              months: 12, // Default AI suggestion
              startDate: "TBD",
              endDate: "TBD"
            },
            territory: "AI Determined Territory",
            royaltyRate: 5.0, // Default AI suggestion
            restrictions: "AI extracted restrictions from text"
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

  render() {
    const { activeStep, mode, manualData, aiText, generatedJson } = this.state;
    const steps = this.getSteps();

    return (
      <div className="content">
        <Row>
          <Col md="12">
            <ThemeProvider theme={theme}>
              <div style={{ width: '100%' }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepButton onClick={() => this.handleStep(index)}>
                        {label}
                      </StepButton>
                    </Step>
                  ))}
                </Stepper>

                <div>
                  <StepContent
                    step={activeStep}
                    mode={mode}
                    setMode={(newMode) => this.setState({ mode: newMode })}
                    manualData={manualData}
                    setManualData={(newData) => this.setState({ manualData: newData })}
                    aiText={aiText}
                    setAiText={(newText) => this.setState({ aiText: newText })}
                    generatedJson={generatedJson}
                    generateJson={this.generateJson}
                    handleNext={this.handleNext}
                    handleBack={this.handleBack}
                  />
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