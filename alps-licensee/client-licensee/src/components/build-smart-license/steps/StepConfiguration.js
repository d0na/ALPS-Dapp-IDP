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

// Rules Configuration Component
const RulesConfiguration = ({ rules, setRules }) => {
  const [activeRuleIndex, setActiveRuleIndex] = useState(0);

  const addRule = () => {
    const newRule = {
      id: Date.now(),
      name: `Rule ${rules.length + 1}`,
      validityStart: '',
      validityEnd: '',
      evaluationInterval: {
        years: '',
        months: '',
        days: ''
      },
      royaltyBase: [
        { id: Date.now(), type: 'manufactured', oracle: '' }
      ],
      royaltyRate: {
        type: 'lumpsum', // lumpsum, proportional, graphs, custom
        lumpsumValue: '',
        proportionalValue: '',
        proportionalRB: '',
        customFunc: 'sum',
        customInputs: [],
        graphs: [],
        min: '',
        max: ''
      }
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (ruleId) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const updateRule = (ruleId, field, value) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    ));
  };

  const updateRuleNested = (ruleId, path, value) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        const newRule = { ...rule };
        const keys = path.split('.');
        let current = newRule;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newRule;
      }
      return rule;
    }));
  };

  // Royalty Base management
  const addRoyaltyBase = (ruleId) => {
    const rule = rules.find(r => r.id === ruleId);
    const newRB = {
      id: Date.now(),
      type: 'manufactured',
      oracle: ''
    };
    updateRuleNested(ruleId, 'royaltyBase', [...rule.royaltyBase, newRB]);
  };

  const removeRoyaltyBase = (ruleId, rbId) => {
    const rule = rules.find(r => r.id === ruleId);
    const newRB = rule.royaltyBase.filter(rb => rb.id !== rbId);
    updateRuleNested(ruleId, 'royaltyBase', newRB);
  };

  const updateRoyaltyBase = (ruleId, rbId, field, value) => {
    const rule = rules.find(r => r.id === ruleId);
    const newRB = rule.royaltyBase.map(rb => 
      rb.id === rbId ? { ...rb, [field]: value } : rb
    );
    updateRuleNested(ruleId, 'royaltyBase', newRB);
  };

  // Custom function management with tree structure
  const addCustomInput = (ruleId, parentPath = '') => {
    const rule = rules.find(r => r.id === ruleId);
    const newInput = {
      id: Date.now(),
      type: 'constant', // constant, func, rb
      value: '',
      func: 'sum',
      rb: '',
      inputs: [] // For nested functions
    };
    
    if (parentPath) {
      // Add to nested function
      const pathParts = parentPath.split('.');
      const newInputs = [...rule.royaltyRate.customInputs];
      let current = newInputs;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[parseInt(pathParts[i])].inputs;
      }
      current[parseInt(pathParts[pathParts.length - 1])].inputs.push(newInput);
      updateRuleNested(ruleId, 'royaltyRate.customInputs', newInputs);
    } else {
      // Add to main level
      updateRuleNested(ruleId, 'royaltyRate.customInputs', [...rule.royaltyRate.customInputs, newInput]);
    }
  };

  const removeCustomInput = (ruleId, inputIndex, parentPath = '') => {
    const rule = rules.find(r => r.id === ruleId);
    let newInputs = [...rule.royaltyRate.customInputs];
    
    if (parentPath) {
      // Remove from nested function
      const pathParts = parentPath.split('.');
      let current = newInputs;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[parseInt(pathParts[i])].inputs;
      }
      current.splice(parseInt(pathParts[pathParts.length - 1]), 1);
    } else {
      // Remove from main level
      newInputs.splice(inputIndex, 1);
    }
    
    updateRuleNested(ruleId, 'royaltyRate.customInputs', newInputs);
  };

  const updateCustomInput = (ruleId, inputIndex, field, value, parentPath = '') => {
    const rule = rules.find(r => r.id === ruleId);
    let newInputs = [...rule.royaltyRate.customInputs];
    
    if (parentPath) {
      // Update nested function
      const pathParts = parentPath.split('.');
      let current = newInputs;
      
      // Navigate to the parent level
      for (let i = 0; i < pathParts.length - 1; i++) {
        const pathIndex = parseInt(pathParts[i]);
        if (current[pathIndex] && current[pathIndex].inputs) {
          current = current[pathIndex].inputs;
        } else {
          console.error('Invalid path:', parentPath);
          return;
        }
      }
      
      // Update the target input
      const targetIndex = parseInt(pathParts[pathParts.length - 1]);
      if (current[targetIndex]) {
        current[targetIndex] = { 
          ...current[targetIndex], 
          [field]: value 
        };
      } else {
        console.error('Target input not found:', targetIndex);
        return;
      }
    } else {
      // Update main level
      if (newInputs[inputIndex]) {
        newInputs[inputIndex] = { ...newInputs[inputIndex], [field]: value };
      } else {
        console.error('Main level input not found:', inputIndex);
        return;
      }
    }
    
    updateRuleNested(ruleId, 'royaltyRate.customInputs', newInputs);
  };

  const getOperationInputs = (operation) => {
    switch (operation) {
      case 'sum': return 2;
      case 'multiply': return 2;
      case 'divide': return 2;
      case 'subtract': return 2;
      case 'max': return 2;
      case 'min': return 2;
      default: return 2;
    }
  };

  const renderCustomInputs = (rule, inputs, parentPath = '') => {
    const depth = parentPath ? parentPath.split('.').length : 0;
    const indentLevel = depth * 20;
    
    return inputs.map((input, idx) => (
      <div key={input.id} style={{ 
        border: '1px solid #ddd', 
        padding: '15px', 
        margin: '10px 0', 
        borderRadius: '4px',
        backgroundColor: '#f8f9fa',
        marginLeft: `${indentLevel}px`,
        borderLeft: depth > 0 ? '3px solid #007bff' : '1px solid #ddd'
      }}>
        {/* Level indicator */}
        {depth > 0 && (
          <div style={{ 
            marginBottom: '10px', 
            fontSize: '12px', 
            color: '#6c757d',
            fontWeight: 'bold'
          }}>
            ↳ Level {depth} - Input {idx + 1}
          </div>
        )}
        
        <Row>
          <Col md="4">
            <FormGroup>
              <Label>Input {idx + 1} Type</Label>
              <Input
                type="select"
                value={input.type}
                onChange={(e) => {
                  updateCustomInput(rule.id, idx, 'type', e.target.value, parentPath);
                  
                  // If selecting "Function", automatically create the required inputs
                  if (e.target.value === 'func') {
                    const inputsNeeded = getOperationInputs('sum'); // Default to sum function
                    const newInputs = [];
                    for (let i = 0; i < inputsNeeded; i++) {
                      newInputs.push({ 
                        id: Date.now() + i, 
                        type: 'constant', 
                        value: '', 
                        func: 'sum', 
                        rb: '',
                        inputs: []
                      });
                    }
                    updateCustomInput(rule.id, idx, 'inputs', newInputs, parentPath);
                  }
                }}
              >
                <option value="constant">Constant</option>
                <option value="func">Function</option>
                <option value="rb">Royalty Base</option>
              </Input>
            </FormGroup>
          </Col>
          <Col md="6">
            {input.type === 'constant' && (
              <FormGroup>
                <Label>Constant Value</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={input.value}
                  onChange={(e) => updateCustomInput(rule.id, idx, 'value', e.target.value, parentPath)}
                  placeholder="Enter constant value"
                />
              </FormGroup>
            )}
            {input.type === 'func' && (
              <FormGroup>
                <Label>Function</Label>
                <Input
                  type="select"
                  value={input.func}
                  onChange={(e) => {
                    updateCustomInput(rule.id, idx, 'func', e.target.value, parentPath);
                    const inputsNeeded = getOperationInputs(e.target.value);
                    const currentInputs = input.inputs.length;
                    if (currentInputs < inputsNeeded) {
                      // Add missing inputs
                      const newInputs = [...input.inputs];
                      for (let i = currentInputs; i < inputsNeeded; i++) {
                        newInputs.push({ 
                          id: Date.now() + i, 
                          type: 'constant', 
                          value: '', 
                          func: 'sum', 
                          rb: '',
                          inputs: []
                        });
                      }
                      updateCustomInput(rule.id, idx, 'inputs', newInputs, parentPath);
                    } else if (currentInputs > inputsNeeded) {
                      // Remove excess inputs
                      updateCustomInput(rule.id, idx, 'inputs', input.inputs.slice(0, inputsNeeded), parentPath);
                    }
                  }}
                >
                  <option value="sum">Sum</option>
                  <option value="multiply">Multiply</option>
                  <option value="divide">Divide</option>
                  <option value="subtract">Subtract</option>
                  <option value="max">Max</option>
                  <option value="min">Min</option>
                </Input>
              </FormGroup>
            )}
            {input.type === 'rb' && (
              <FormGroup>
                <Label>Royalty Base</Label>
                <Input
                  type="select"
                  value={input.rb}
                  onChange={(e) => {
                    try {
                      updateCustomInput(rule.id, idx, 'rb', e.target.value, parentPath);
                    } catch (error) {
                      console.error('Error updating Royalty Base:', error);
                      // Fallback: update the input directly without path navigation
                      const rule = rules.find(r => r.id === rule.id);
                      if (rule && rule.royaltyRate && rule.royaltyRate.customInputs) {
                        const newInputs = [...rule.royaltyRate.customInputs];
                        if (parentPath) {
                          // Simple fallback for nested inputs
                          const pathParts = parentPath.split('.');
                          let current = newInputs;
                          for (let i = 0; i < pathParts.length - 1; i++) {
                            const pathIndex = parseInt(pathParts[i]);
                            if (current[pathIndex] && current[pathIndex].inputs) {
                              current = current[pathIndex].inputs;
                            }
                          }
                          const targetIndex = parseInt(pathParts[pathParts.length - 1]);
                          if (current[targetIndex]) {
                            current[targetIndex].rb = e.target.value;
                            updateRuleNested(rule.id, 'royaltyRate.customInputs', newInputs);
                          }
                        } else {
                          // Main level fallback
                          if (newInputs[idx]) {
                            newInputs[idx].rb = e.target.value;
                            updateRuleNested(rule.id, 'royaltyRate.customInputs', newInputs);
                          }
                        }
                      }
                    }
                  }}
                >
                  <option value="">Select RB</option>
                  {rule.royaltyBase.map((rb, rbIdx) => (
                    <option key={rbIdx} value={rb.type}>{rb.type}</option>
                  ))}
                </Input>
              </FormGroup>
            )}
          </Col>
          <Col md="2">
            <Button
              color="danger"
              size="sm"
              onClick={() => removeCustomInput(rule.id, idx, parentPath)}
              style={{ marginTop: '30px' }}
            >
              Remove
            </Button>
          </Col>
        </Row>
        
        {/* Render nested inputs for functions */}
        {input.type === 'func' && input.inputs && input.inputs.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '4px', 
              marginBottom: '10px',
              border: '1px solid #bbdefb'
            }}>
              <Label style={{ fontWeight: 'bold', color: '#1976d2' }}>
                ↳ Nested Function: {input.func} (Level {depth + 1})
              </Label>
            </div>
            {renderCustomInputs(rule, input.inputs, parentPath ? `${parentPath}.${idx}` : `${idx}`)}
            <Button
              color="info"
              size="sm"
              onClick={() => addCustomInput(rule.id, parentPath ? `${parentPath}.${idx}` : `${idx}`)}
              style={{ marginTop: '10px' }}
            >
              Add Nested Input
            </Button>
          </div>
        )}
      </div>
    ));
  };

  const generateRoyaltyRateSummary = (rule) => {
    const { royaltyRate } = rule;
    
    switch (royaltyRate.type) {
      case 'lumpsum':
        return `Lumpsum: $${royaltyRate.lumpsumValue || '0'} (Fixed amount)`;
      
      case 'proportional':
        return `Proportional: $${royaltyRate.proportionalValue || '0'} × ${royaltyRate.proportionalRB || 'RB'} (Multiply by Royalty Base)`;
      
      case 'graphs': {
        const graphCount = royaltyRate.graphs.data?.length || 0;
        return `Graphs: ${graphCount} steps configured (Step-based calculation)`;
      }
      
      case 'custom': {
        const inputCount = royaltyRate.customInputs?.length || 0;
        if (inputCount === 0) {
          return `Custom: ${royaltyRate.customFunc || 'sum'} function (No inputs configured)`;
        }
        
        // Analyze custom inputs to create a detailed description
        const inputDescriptions = royaltyRate.customInputs.map((input, index) => {
          switch (input.type) {
            case 'constant':
              return `const(${input.value || '0'})`;
            case 'rb':
              return `RB(${input.rb || 'none'})`;
            case 'func': {
              const nestedInputCount = input.inputs?.length || 0;
              return `func(${input.func || 'sum'})[${nestedInputCount} inputs]`;
            }
            default:
              return 'unknown';
          }
        });
        
        const inputsDesc = inputDescriptions.join(' + ');
        return `Custom: ${royaltyRate.customFunc || 'sum'}(${inputsDesc}) (${inputCount} inputs)`;
      }
      
      default:
        return 'No royalty rate configured';
    }
  };

  const renderRoyaltyRateSection = (rule) => {
    const { royaltyRate } = rule;

    return (
      <div>
        {/* Summary Field */}
        <Row style={{ marginBottom: '20px' }}>
          <Col md="12">
            <FormGroup>
              <Label>Configuration Summary</Label>
              <Input
                type="text"
                value={generateRoyaltyRateSummary(rule)}
                readOnly
                style={{ 
                  backgroundColor: '#e9ecef', 
                  fontWeight: 'bold',
                  color: '#495057'
                }}
              />
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col md="6">
            <FormGroup>
              <Label>Royalty Rate Type</Label>
              <Input
                type="select"
                value={royaltyRate.type}
                onChange={(e) => updateRuleNested(rule.id, 'royaltyRate.type', e.target.value)}
              >
                <option value="lumpsum">Lumpsum</option>
                <option value="proportional">Proportional</option>
                <option value="graphs">Graphs</option>
                <option value="custom">Custom</option>
              </Input>
            </FormGroup>
          </Col>
          <Col md="3">
            <FormGroup>
              <Label>Min Value</Label>
              <Input
                type="number"
                step="0.01"
                value={royaltyRate.min || ''}
                onChange={(e) => updateRuleNested(rule.id, 'royaltyRate.min', e.target.value)}
                placeholder="Min value"
              />
            </FormGroup>
          </Col>
          <Col md="3">
            <FormGroup>
              <Label>Max Value</Label>
              <Input
                type="number"
                step="0.01"
                value={royaltyRate.max || ''}
                onChange={(e) => updateRuleNested(rule.id, 'royaltyRate.max', e.target.value)}
                placeholder="Max value"
              />
            </FormGroup>
          </Col>
        </Row>

        {royaltyRate.type === 'lumpsum' && (
          <FormGroup>
            <Label>Lumpsum Value ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={royaltyRate.lumpsumValue}
              onChange={(e) => updateRuleNested(rule.id, 'royaltyRate.lumpsumValue', e.target.value)}
              placeholder="Enter lumpsum value"
            />
          </FormGroup>
        )}

        {royaltyRate.type === 'proportional' && (
          <Row>
            <Col md="6">
              <FormGroup>
                <Label>Value ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={royaltyRate.proportionalValue}
                  onChange={(e) => updateRuleNested(rule.id, 'royaltyRate.proportionalValue', e.target.value)}
                  placeholder="Enter value"
                />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label>Royalty Base (Multiply)</Label>
                <Input
                  type="select"
                  value={royaltyRate.proportionalRB}
                  onChange={(e) => updateRuleNested(rule.id, 'royaltyRate.proportionalRB', e.target.value)}
                >
                  <option value="">Select RB</option>
                  {rule.royaltyBase.map((rb, idx) => (
                    <option key={idx} value={rb.type}>{rb.type}</option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
          </Row>
        )}

        {royaltyRate.type === 'graphs' && (
          <RoyaltyStructureComponent
            title="Graph Royalty Rate"
            value={royaltyRate.graphs.value || ''}
            onChange={(value) => updateRuleNested(rule.id, 'royaltyRate.graphs.value', value)}
            type="percentage"
            graphData={royaltyRate.graphs.data || []}
            onGraphDataChange={(graphData) => updateRuleNested(rule.id, 'royaltyRate.graphs.data', graphData)}
            unitLabel="Units"
          />
        )}

        {royaltyRate.type === 'custom' && (
          <div>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Function</Label>
                  <Input
                    type="select"
                    value={royaltyRate.customFunc}
                    onChange={(e) => {
                      updateRuleNested(rule.id, 'royaltyRate.customFunc', e.target.value);
                      const inputsNeeded = getOperationInputs(e.target.value);
                      const currentInputs = royaltyRate.customInputs.length;
                      if (currentInputs < inputsNeeded) {
                        // Add missing inputs
                        const newInputs = [...royaltyRate.customInputs];
                        for (let i = currentInputs; i < inputsNeeded; i++) {
                          newInputs.push({ 
                            id: Date.now() + i, 
                            type: 'constant', 
                            value: '', 
                            func: 'sum', 
                            rb: '',
                            inputs: []
                          });
                        }
                        updateRuleNested(rule.id, 'royaltyRate.customInputs', newInputs);
                      } else if (currentInputs > inputsNeeded) {
                        // Remove excess inputs
                        updateRuleNested(rule.id, 'royaltyRate.customInputs', royaltyRate.customInputs.slice(0, inputsNeeded));
                      }
                    }}
                  >
                    <option value="sum">Sum</option>
                    <option value="multiply">Multiply</option>
                    <option value="divide">Divide</option>
                    <option value="subtract">Subtract</option>
                    <option value="max">Max</option>
                    <option value="min">Min</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <div style={{ marginTop: '20px' }}>
              <Label>Function Inputs</Label>
              {renderCustomInputs(rule, royaltyRate.customInputs)}
              <Button
                color="info"
                size="sm"
                onClick={() => addCustomInput(rule.id)}
                style={{ marginTop: '10px' }}
              >
                Add Input
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const resetRule = (ruleId) => {
    const rule = rules.find(r => r.id === ruleId);
    const resetRule = {
      ...rule,
      name: '',
      validityStart: '',
      validityEnd: '',
      evaluationInterval: {
        years: '',
        months: '',
        days: ''
      },
      royaltyBase: [
        { id: Date.now(), type: 'manufactured', oracle: '' }
      ],
      royaltyRate: {
        type: 'lumpsum',
        lumpsumValue: '',
        proportionalValue: '',
        proportionalRB: '',
        customFunc: 'sum',
        customInputs: [],
        graphs: [],
        min: '',
        max: ''
      }
    };
    updateRule(ruleId, '', resetRule);
  };

  const resetAllRules = () => {
    setRules([]);
  };

  return (
    <Card style={{ marginBottom: '20px' }}>
      <CardHeader>
        <CardTitle tag="h6">
          <RequiredField>Rules Configuration</RequiredField>
        </CardTitle>
      </CardHeader>
      <CardBody>
        {rules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>No rules configured yet.</p>
            <Button color="primary" onClick={addRule}>
              Add First Rule
            </Button>
          </div>
        ) : (
          <div>
            <Row style={{ marginBottom: '20px' }}>
              <Col md="8">
                <Button color="primary" onClick={addRule} style={{ marginRight: '10px' }}>
                  Add Rule
                </Button>
                <Button color="warning" onClick={resetAllRules} style={{ marginRight: '10px' }}>
                  Reset All Rules
                </Button>
                <small>Total Rules: {rules.length}</small>
              </Col>
            </Row>

            <Nav tabs>
              {rules.map((rule, index) => (
                <NavItem key={rule.id}>
                  <NavLink
                    className={activeRuleIndex === index ? 'active' : ''}
                    onClick={() => setActiveRuleIndex(index)}
                  >
                    {rule.name || `Rule ${index + 1}`}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>

            <TabContent activeTab={activeRuleIndex}>
              {rules.map((rule, index) => (
                <TabPane key={rule.id} tabId={index}>
                  <div style={{ padding: '20px 0' }}>
                    
                    {/* Basic Information and Royalty Evaluation Interval - Side by Side */}
                    <Row>
                      <Col md="6">
                        {/* Basic Information Section */}
                        <div style={{ 
                          border: '2px solid #e9ecef', 
                          borderRadius: '8px', 
                          padding: '20px', 
                          marginBottom: '20px',
                          backgroundColor: '#f8f9fa',
                          height: '100%'
                        }}>
                          <h6 style={{ color: '#495057', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                            Basic Information
                          </h6>
                          <FormGroup>
                            <Label>Rule Name</Label>
                            <Input
                              type="text"
                              value={rule.name}
                              onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
                              placeholder="Enter rule name"
                            />
                          </FormGroup>

                          <Row>
                            <Col md="6">
                              <FormGroup>
                                <Label>Validity Start Date</Label>
                                <Input
                                  type="date"
                                  value={rule.validityStart}
                                  onChange={(e) => updateRule(rule.id, 'validityStart', e.target.value)}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup>
                                <Label>Validity End Date</Label>
                                <Input
                                  type="date"
                                  value={rule.validityEnd}
                                  onChange={(e) => updateRule(rule.id, 'validityEnd', e.target.value)}
                                />
                              </FormGroup>
                            </Col>
                          </Row>

                          <Button
                            color="danger"
                            onClick={() => removeRule(rule.id)}
                            disabled={rules.length === 1}
                            style={{ marginTop: '10px' }}
                          >
                            Remove Rule
                          </Button>
                        </div>
                      </Col>

                      <Col md="6">
                        {/* Royalty Evaluation Interval Section */}
                        <div style={{ 
                          border: '2px solid #e9ecef', 
                          borderRadius: '8px', 
                          padding: '20px', 
                          marginBottom: '20px',
                          backgroundColor: '#f8f9fa',
                          height: '100%'
                        }}>
                          <h6 style={{ color: '#495057', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                            Royalty Evaluation Interval
                          </h6>
                          <Row>
                            <Col md="4">
                              <FormGroup>
                                <Label>Years</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={rule.evaluationInterval.years}
                                  onChange={(e) => updateRuleNested(rule.id, 'evaluationInterval.years', e.target.value)}
                                  placeholder="0"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup>
                                <Label>Months</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="11"
                                  value={rule.evaluationInterval.months}
                                  onChange={(e) => updateRuleNested(rule.id, 'evaluationInterval.months', e.target.value)}
                                  placeholder="0"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup>
                                <Label>Days</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={rule.evaluationInterval.days}
                                  onChange={(e) => updateRuleNested(rule.id, 'evaluationInterval.days', e.target.value)}
                                  placeholder="0"
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>

                    {/* Royalty Base and Royalty Rate - Side by Side */}
                    <Row>
                      <Col md="6">
                        {/* Royalty Base Section */}
                        <div style={{ 
                          border: '2px solid #e9ecef', 
                          borderRadius: '8px', 
                          padding: '20px', 
                          marginBottom: '20px',
                          backgroundColor: '#f8f9fa',
                          height: '100%'
                        }}>
                          <h6 style={{ color: '#495057', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                            Royalty Base (RB)
                          </h6>
                          <Button
                            color="info"
                            size="sm"
                            onClick={() => addRoyaltyBase(rule.id)}
                            style={{ marginBottom: '15px' }}
                          >
                            Add RB
                          </Button>
                          {rule.royaltyBase.map((rb, rbIndex) => (
                            <Row key={rb.id}>
                              <Col md="5">
                                <FormGroup>
                                  <Label>Type</Label>
                                  <Input
                                    type="select"
                                    value={rb.type}
                                    onChange={(e) => updateRoyaltyBase(rule.id, rb.id, 'type', e.target.value)}
                                  >
                                    <option value="manufactured">Manufactured</option>
                                    <option value="sold">Sold</option>
                                    <option value="activated">Activated</option>
                                    <option value="time">Time</option>
                                    <option value="usage">Usage</option>
                                  </Input>
                                </FormGroup>
                              </Col>
                              <Col md="5">
                                <FormGroup>
                                  <Label>Oracle Address</Label>
                                  <Input
                                    type="text"
                                    value={rb.oracle}
                                    onChange={(e) => updateRoyaltyBase(rule.id, rb.id, 'oracle', e.target.value)}
                                    placeholder="Enter Oracle address"
                                  />
                                </FormGroup>
                              </Col>
                              <Col md="2">
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => removeRoyaltyBase(rule.id, rb.id)}
                                  style={{ marginTop: '30px' }}
                                  disabled={rule.royaltyBase.length === 1}
                                >
                                  Remove
                                </Button>
                              </Col>
                            </Row>
                          ))}
                        </div>
                      </Col>

                      <Col md="6">
                        {/* Royalty Rate Section */}
                        <div style={{ 
                          border: '2px solid #e9ecef', 
                          borderRadius: '8px', 
                          padding: '20px', 
                          marginBottom: '20px',
                          backgroundColor: '#f8f9fa',
                          height: '100%'
                        }}>
                          <h6 style={{ color: '#495057', marginBottom: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                            Royalty Rate
                          </h6>
                          {renderRoyaltyRateSection(rule)}
                        </div>
                      </Col>
                    </Row>

                    {/* Reset Button */}
                    <Row>
                      <Col md="12" style={{ textAlign: 'center' }}>
                        <Button
                          color="warning"
                          onClick={() => resetRule(rule.id)}
                          style={{ marginTop: '10px' }}
                        >
                          Reset This Rule
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </TabPane>
              ))}
            </TabContent>
          </div>
        )}
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

      {/* Rules Configuration */}
      <RulesConfiguration 
        rules={manualData.rules || []}
        setRules={(rules) => updateManualData('rules', rules)}
      />

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

RulesConfiguration.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    validityStart: PropTypes.string,
    validityEnd: PropTypes.string,
    evaluationInterval: PropTypes.shape({
      years: PropTypes.string,
      months: PropTypes.string,
      days: PropTypes.string
    }),
    royaltyBase: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      oracle: PropTypes.string
    })),
    royaltyRate: PropTypes.shape({
      type: PropTypes.oneOf(['lumpsum', 'proportional', 'graphs', 'custom']),
      lumpsumValue: PropTypes.string,
      proportionalValue: PropTypes.string,
      proportionalRB: PropTypes.string,
      customFunc: PropTypes.string,
      customInputs: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.oneOf(['constant', 'func', 'rb']),
        value: PropTypes.string,
        func: PropTypes.string,
        rb: PropTypes.string,
        inputs: PropTypes.array // For nested functions
      })),
      graphs: PropTypes.object,
      min: PropTypes.string,
      max: PropTypes.string
    })
  })).isRequired,
  setRules: PropTypes.func.isRequired,
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