/* eslint-disable no-unused-vars */
import React, { useState } from "react";
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
  Alert,
  Badge,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { useBuildSmartLicenseStyles } from "../styles/buildSmartLicenseStyles";
import { validateManualData, validateAiText } from "../utils/jsonGenerator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Typography from "@material-ui/core/Typography";

// Required field indicator component
const RequiredField = ({ children, isRequired = true }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {children}
    {isRequired && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
  </div>
);

// Validation status component
const ValidationStatus = ({ isValid, warnings, requiredFields, mode }) => {
  if (mode === 'ai') {
    return (
      <Alert color={isValid ? "success" : "warning"} style={{ marginBottom: '20px' }}>
        <strong>AI Input Status:</strong> {isValid ? "Valid text provided" : "Please provide sufficient text (minimum 10 characters)"}
      </Alert>
    );
  }

  const missingFields = [];
  if (requiredFields) {
    Object.entries(requiredFields).forEach(([field, hasValue]) => {
      if (!hasValue) {
        missingFields.push(field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
      }
    });
  }

  return (
    <Alert color={isValid ? "success" : "warning"} style={{ marginBottom: '20px' }}>
      <strong>Validation Status:</strong> {isValid ? "All required fields completed" : "Please complete required fields"}
      {!isValid && missingFields.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Missing required fields:</strong>
          <ul style={{ marginBottom: '0', paddingLeft: '20px' }}>
            {missingFields.map((field, idx) => (
              <li key={idx}>{field}</li>
            ))}
          </ul>
        </div>
      )}
      {warnings && warnings.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Warnings:</strong>
          <ul style={{ marginBottom: '0', paddingLeft: '20px' }}>
            {warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </Alert>
  );
};

// Royalty Structure Component with Graph
const RoyaltyStructureComponent = ({ 
  title, 
  value, 
  onChange, 
  type = 'percentage', // 'percentage' or 'amount'
  structureType = 'single', // 'single' or 'graph'
  graphData = [],
  onGraphDataChange,
  unitLabel = 'Units'
}) => {
  const [activeTab, setActiveTab] = useState('1');
  const [newStep, setNewStep] = useState({ units: '', value: '' });

  const addStep = () => {
    if (newStep.units && newStep.value) {
      const step = {
        units: parseInt(newStep.units),
        value: parseFloat(newStep.value),
        id: Date.now()
      };
      const updatedData = [...graphData, step].sort((a, b) => a.units - b.units);
      onGraphDataChange(updatedData);
      setNewStep({ units: '', value: '' });
    }
  };

  const removeStep = (stepId) => {
    const updatedData = graphData.filter(step => step.id !== stepId);
    onGraphDataChange(updatedData);
  };

  const chartData = graphData.map(step => ({
    name: `${step.units} ${unitLabel}`,
    [type === 'percentage' ? 'Percentage' : 'Amount']: step.value,
    units: step.units
  }));

  return (
    <Card style={{ marginBottom: '20px' }}>
      <CardHeader>
        <CardTitle tag="h6">
          <RequiredField>{title}</RequiredField>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={activeTab === '1' ? 'active' : ''}
              onClick={() => setActiveTab('1')}
            >
              Single Value
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === '2' ? 'active' : ''}
              onClick={() => setActiveTab('2')}
            >
              Graph Structure
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>
                    {type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <h5>{value || '0'} {type === 'percentage' ? '%' : '$'}</h5>
                  <small>Single {type === 'percentage' ? 'percentage' : 'amount'} value</small>
                </div>
              </Col>
            </Row>
          </TabPane>

          <TabPane tabId="2">
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Add New Step</Label>
                  <Row>
                    <Col md="6">
                      <Input
                        type="number"
                        min="1"
                        placeholder={unitLabel}
                        value={newStep.units}
                        onChange={(e) => setNewStep({...newStep, units: e.target.value})}
                      />
                    </Col>
                    <Col md="6">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={type === 'percentage' ? '%' : '$'}
                        value={newStep.value}
                        onChange={(e) => setNewStep({...newStep, value: e.target.value})}
                      />
                    </Col>
                  </Row>
                  <Button 
                    color="primary" 
                    size="sm" 
                    onClick={addStep}
                    disabled={!newStep.units || !newStep.value}
                    style={{ marginTop: '10px' }}
                  >
                    Add Step
                  </Button>
                </FormGroup>

                {graphData.length > 0 && (
                  <div>
                    <Label>Current Steps</Label>
                    {graphData.map((step, idx) => (
                      <div key={step.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        margin: '4px 0',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px'
                      }}>
                        <span>
                          {step.units} {unitLabel} → {step.value} {type === 'percentage' ? '%' : '$'}
                        </span>
                        <Button 
                          color="danger" 
                          size="sm"
                          onClick={() => removeStep(step.id)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Col>
              <Col md="6">
                {chartData.length > 0 ? (
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="stepAfter" 
                          dataKey={type === 'percentage' ? 'Percentage' : 'Amount'} 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2, fill: '#fff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ 
                    height: '300px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px'
                  }}>
                    <p>Add steps to see the graph</p>
                  </div>
                )}
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </CardBody>
    </Card>
  );
};

// Manual Configuration Form
const ManualConfigurationForm = ({ manualData, setManualData, validation }) => {
  const updateManualData = (field, value) => {
    setManualData({ ...manualData, [field]: value });
  };

  const updateUsageBase = (type, value) => {
    setManualData({
      ...manualData,
      usageBase: {
        ...manualData.usageBase,
        [type]: value
      }
    });
  };

  const updateUsageBaseGraph = (type, graphData) => {
    setManualData({
      ...manualData,
      usageBase: {
        ...manualData.usageBase,
        [`${type}Graph`]: graphData
      }
    });
  };

  const updateRoyaltyRate = (value) => {
    setManualData({
      ...manualData,
      royaltyRate: value
    });
  };

  const updateRoyaltyRateGraph = (graphData) => {
    setManualData({
      ...manualData,
      royaltyRateGraph: graphData
    });
  };

  return (
    <div>
      <ValidationStatus 
        isValid={validation.isValid} 
        warnings={validation.warnings} 
        requiredFields={validation.requiredFields}
        mode="manual"
      />
      
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="licenseName">
              <RequiredField>License Name</RequiredField>
            </Label>
            <Input
              type="text"
              id="licenseName"
              placeholder="Enter license name"
              value={manualData.name || ''}
              onChange={(e) => updateManualData('name', e.target.value)}
              invalid={!validation.requiredFields?.hasName}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="licensor">
              <RequiredField>Licensor</RequiredField>
            </Label>
            <Input
              type="text"
              id="licensor"
              placeholder="Enter licensor name"
              value={manualData.licensor || ''}
              onChange={(e) => updateManualData('licensor', e.target.value)}
              invalid={!validation.requiredFields?.hasLicensor}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="licensee">
              <RequiredField>Licensee</RequiredField>
            </Label>
            <Input
              type="text"
              id="licensee"
              placeholder="Enter licensee name"
              value={manualData.licensee || ''}
              onChange={(e) => updateManualData('licensee', e.target.value)}
              invalid={!validation.requiredFields?.hasLicensee}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="territory">
              <RequiredField>Territory</RequiredField>
            </Label>
            <Input
              type="text"
              id="territory"
              placeholder="e.g., Worldwide, USA, Europe"
              value={manualData.territory || ''}
              onChange={(e) => updateManualData('territory', e.target.value)}
              invalid={!validation.requiredFields?.hasTerritory}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="durationYears">
              <RequiredField>Duration (Years)</RequiredField>
            </Label>
            <Input
              type="number"
              id="durationYears"
              min="0"
              placeholder="Enter duration in years"
              value={manualData.durationYears || ''}
              onChange={(e) => updateManualData('durationYears', e.target.value)}
              invalid={!validation.requiredFields?.hasDurationYears}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label for="durationDays">
              Duration (Days)
            </Label>
            <Input
              type="number"
              id="durationDays"
              min="0"
              placeholder="Additional days"
              value={manualData.durationDays || ''}
              onChange={(e) => updateManualData('durationDays', e.target.value)}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="12">
          <FormGroup>
            <Label for="ips">
              <RequiredField>Intellectual Properties</RequiredField>
            </Label>
            <Input
              type="textarea"
              id="ips"
              rows="4"
              placeholder="Describe the intellectual properties being licensed"
              value={manualData.ips || ''}
              onChange={(e) => updateManualData('ips', e.target.value)}
              invalid={!validation.requiredFields?.hasIPs}
            />
          </FormGroup>
        </Col>
      </Row>

      {/* Usage Base Configuration */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader>
          <CardTitle tag="h6">
            <RequiredField>Usage Base Configuration</RequiredField>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md="6">
              <RoyaltyStructureComponent
                title="Manufactured"
                value={manualData.usageBase?.manufactured || ''}
                onChange={(value) => updateUsageBase('manufactured', value)}
                type="amount"
                graphData={manualData.usageBase?.manufacturedGraph || []}
                onGraphDataChange={(graphData) => updateUsageBaseGraph('manufactured', graphData)}
                unitLabel="Units"
              />
            </Col>
            <Col md="6">
              <RoyaltyStructureComponent
                title="Sold"
                value={manualData.usageBase?.sold || ''}
                onChange={(value) => updateUsageBase('sold', value)}
                type="amount"
                graphData={manualData.usageBase?.soldGraph || []}
                onGraphDataChange={(graphData) => updateUsageBaseGraph('sold', graphData)}
                unitLabel="Units"
              />
            </Col>
          </Row>
          <Row>
            <Col md="6">
              <RoyaltyStructureComponent
                title="Activated"
                value={manualData.usageBase?.activated || ''}
                onChange={(value) => updateUsageBase('activated', value)}
                type="amount"
                graphData={manualData.usageBase?.activatedGraph || []}
                onGraphDataChange={(graphData) => updateUsageBaseGraph('activated', graphData)}
                unitLabel="Units"
              />
            </Col>
            <Col md="6">
              <RoyaltyStructureComponent
                title="Usage"
                value={manualData.usageBase?.usage || ''}
                onChange={(value) => updateUsageBase('usage', value)}
                type="amount"
                graphData={manualData.usageBase?.usageGraph || []}
                onGraphDataChange={(graphData) => updateUsageBaseGraph('usage', graphData)}
                unitLabel="Hours"
              />
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Royalty Rate Configuration */}
      <RoyaltyStructureComponent
        title="Royalty Rate"
        value={manualData.royaltyRate || ''}
        onChange={updateRoyaltyRate}
        type="percentage"
        graphData={manualData.royaltyRateGraph || []}
        onGraphDataChange={updateRoyaltyRateGraph}
        unitLabel="Units"
      />
    </div>
  );
};

// AI Configuration Form
const AIConfigurationForm = ({ aiText, setAiText, validation }) => {
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
      <ValidationStatus 
        isValid={validation.isValid} 
        warnings={validation.warnings} 
        mode="ai"
      />
      
      <Row>
        <Col md="12">
          <FormGroup>
            <Label for="fileUpload">Upload Document</Label>
            <div className={classes.uploadArea}>
              <input
                accept=".txt,.doc,.docx,.pdf,.json"
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
                  Upload Document
                </Button>
              </label>
              <Typography variant="body2" color="textSecondary">
                Supported formats: TXT, DOC, DOCX, PDF, JSON
              </Typography>
            </div>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md="12">
          <FormGroup>
            <Label for="aiTextInput">
              <RequiredField>Or Enter Text/JSON Manually</RequiredField>
            </Label>
            <Input
              type="textarea"
              id="aiTextInput"
              rows="10"
              placeholder="Paste license agreement text, contract details, or requirements for AI analysis..."
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              invalid={!validation.isValid}
            />
          </FormGroup>
        </Col>
      </Row>
    </div>
  );
};

// Main Step Configuration Component
const StepConfiguration = ({ 
  mode, 
  manualData, 
  setManualData, 
  aiText, 
  setAiText, 
  handleNext, 
  handleBack 
}) => {
  // Enhanced validation logic with detailed feedback
  const getValidation = () => {
    if (mode === 'ai') {
      const isValid = validateAiText(aiText);
      return {
        isValid,
        warnings: isValid ? [] : ["Please provide at least 10 characters of text"],
        requiredFields: { hasText: isValid }
      };
    }
    
    // Manual mode validation
    const hasName = !!(manualData.name && manualData.name.trim());
    const hasLicensor = !!(manualData.licensor && manualData.licensor.trim());
    const hasLicensee = !!(manualData.licensee && manualData.licensee.trim());
    const hasDurationYears = !!(manualData.durationYears && parseInt(manualData.durationYears) > 0);
    const hasTerritory = !!(manualData.territory && manualData.territory.trim());
    const hasIPs = !!(manualData.ips && manualData.ips.trim());
    
    const isValid = hasName && hasLicensor && hasLicensee && hasDurationYears && hasTerritory && hasIPs;
    const warnings = [];
    
    if (!hasName) warnings.push("License name is required");
    if (!hasLicensor) warnings.push("Licensor is required");
    if (!hasLicensee) warnings.push("Licensee is required");
    if (!hasDurationYears) warnings.push("Duration in years is required");
    if (!hasTerritory) warnings.push("Territory is required");
    if (!hasIPs) warnings.push("Intellectual properties description is required");
    
    return {
      isValid,
      warnings,
      requiredFields: {
        hasName,
        hasLicensor,
        hasLicensee,
        hasDurationYears,
        hasTerritory,
        hasIPs
      }
    };
  };
  
  const validation = getValidation();
  const isNextDisabled = !validation.isValid;

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">
          {mode === 'manual' ? 'License Configuration' : 'AI-Assisted Creation'}
        </CardTitle>
        <p className="card-category">
          {mode === 'manual' 
            ? 'Configure license details with royalty structures and usage bases' 
            : 'Provide text or upload a document for AI analysis'
          }
        </p>
      </CardHeader>
      <CardBody>
        {mode === 'manual' ? (
          <ManualConfigurationForm 
            manualData={manualData}
            setManualData={setManualData}
            validation={validation}
          />
        ) : (
          <AIConfigurationForm 
            aiText={aiText}
            setAiText={setAiText}
            validation={validation}
          />
        )}
        
        <Row style={{ marginTop: '30px' }}>
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

// PropTypes
RequiredField.propTypes = {
  children: PropTypes.node.isRequired,
  isRequired: PropTypes.bool,
};

ValidationStatus.propTypes = {
  isValid: PropTypes.bool.isRequired,
  warnings: PropTypes.array,
  requiredFields: PropTypes.object,
  mode: PropTypes.string,
};

RoyaltyStructureComponent.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['percentage', 'amount']),
  structureType: PropTypes.oneOf(['single', 'graph']),
  graphData: PropTypes.array,
  onGraphDataChange: PropTypes.func.isRequired,
  unitLabel: PropTypes.string,
};

ManualConfigurationForm.propTypes = {
  manualData: PropTypes.object.isRequired,
  setManualData: PropTypes.func.isRequired,
  validation: PropTypes.object.isRequired,
};

AIConfigurationForm.propTypes = {
  aiText: PropTypes.string.isRequired,
  setAiText: PropTypes.func.isRequired,
  validation: PropTypes.object.isRequired,
};

StepConfiguration.propTypes = {
  mode: PropTypes.string.isRequired,
  manualData: PropTypes.object.isRequired,
  setManualData: PropTypes.func.isRequired,
  aiText: PropTypes.string.isRequired,
  setAiText: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default StepConfiguration; 