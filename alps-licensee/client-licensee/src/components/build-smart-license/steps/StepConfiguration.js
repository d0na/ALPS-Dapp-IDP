import React from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
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
import { useBuildSmartLicenseStyles } from "../styles/buildSmartLicenseStyles";
import { validateManualData, validateAiText } from "../utils/jsonGenerator";

const ManualConfigurationForm = ({ manualData, setManualData }) => (
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
);

const AIConfigurationForm = ({ aiText, setAiText }) => {
  const classes = useBuildSmartLicenseStyles();

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

  return (
    <div>
      <Row>
        <Col md="12">
          <FormGroup>
            <Label for="fileUpload">Upload Document</Label>
            <div className={classes.uploadArea}>
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
  );
};

const StepConfiguration = ({ 
  mode, 
  manualData, 
  setManualData, 
  aiText, 
  setAiText, 
  handleNext, 
  handleBack 
}) => {
  const isNextDisabled = mode === 'manual' 
    ? !validateManualData(manualData) 
    : !validateAiText(aiText);

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
          <ManualConfigurationForm 
            manualData={manualData}
            setManualData={setManualData}
          />
        ) : (
          <AIConfigurationForm 
            aiText={aiText}
            setAiText={setAiText}
          />
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
              disabled={isNextDisabled}
            >
              Next
            </Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

// PropTypes for sub-components
ManualConfigurationForm.propTypes = {
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
};

AIConfigurationForm.propTypes = {
  aiText: PropTypes.string.isRequired,
  setAiText: PropTypes.func.isRequired,
};

StepConfiguration.propTypes = {
  mode: PropTypes.string.isRequired,
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
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default StepConfiguration; 