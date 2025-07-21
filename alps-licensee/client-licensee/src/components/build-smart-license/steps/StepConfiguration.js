import React, { useState } from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
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
  // Table,
} from "reactstrap";
import { useBuildSmartLicenseStyles } from "../styles/buildSmartLicenseStyles";
import { validateAiText } from "../utils/jsonGenerator";

// ALPS Color scheme
const colorScheme = ["#8dd3c7","#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"];

const getSchemeColor = (index) => {
  return index < colorScheme.length ? colorScheme[index] : "#000000";
};

// Simple Manual Form (Original)
const SimpleManualForm = ({ manualData, setManualData }) => (
  <div>
    <Row>
      <Col md="6">
        <FormGroup>
          <Label for="licenseTitle">License Title</Label>
          <Input
            type="text"
            id="licenseTitle"
            placeholder="Enter license title"
            value={manualData.title || ''}
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
            value={manualData.licensor || ''}
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
            value={manualData.type || ''}
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
            value={manualData.duration || ''}
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
            value={manualData.royaltyRate || ''}
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
            value={manualData.territory || ''}
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
            value={manualData.ipDescription || ''}
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
            value={manualData.restrictions || ''}
            onChange={(e) => setManualData({...manualData, restrictions: e.target.value})}
          />
        </FormGroup>
      </Col>
    </Row>
  </div>
);

const DeviceRuleForm = ({ rule, ruleIndex, deviceIndex, licensors, ips, onRuleUpdate }) => {
  const handleRuleChange = (field, value) => {
    onRuleUpdate(deviceIndex, ruleIndex, { ...rule, [field]: value });
  };

  const handleThresholdChange = (threshIndex, field, value) => {
    const newThresholds = [...rule.threshAmounts];
    newThresholds[threshIndex] = { ...newThresholds[threshIndex], [field]: value };
    handleRuleChange('threshAmounts', newThresholds);
  };

  const addThreshold = () => {
    const newThresholds = [...rule.threshAmounts];
    const lastThresh = newThresholds[newThresholds.length - 1];
    newThresholds.push({
      threshold: parseInt(lastThresh.threshold) + 1000,
      amount: lastThresh.amount
    });
    handleRuleChange('threshAmounts', newThresholds);
  };

  const removeThreshold = (threshIndex) => {
    if (rule.threshAmounts.length > 1) {
      const newThresholds = rule.threshAmounts.filter((_, idx) => idx !== threshIndex);
      handleRuleChange('threshAmounts', newThresholds);
    }
  };

  return (
    <Card style={{ marginBottom: '10px', border: '1px solid #ddd' }}>
      <CardBody>
        <Row>
          <Col md="6">
            <FormGroup>
              <Label>Rule Name</Label>
              <Input
                type="text"
                value={rule.name}
                onChange={(e) => handleRuleChange('name', e.target.value)}
                placeholder="Enter rule name"
              />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label>IP (Licensor)</Label>
              <Input
                type="select"
                value={rule.ip}
                onChange={(e) => handleRuleChange('ip', e.target.value)}
              >
                <option value="">Select IP</option>
                {ips.map((ip, idx) => (
                  <option key={idx} value={idx}>
                    {ip.name} ({licensors[ip.lor]?.name})
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>
        </Row>
        
        <Row>
          <Col md="3">
            <FormGroup>
              <Label>Royalty Type</Label>
              <Input
                type="select"
                value={rule.type}
                onChange={(e) => handleRuleChange('type', e.target.value)}
              >
                <option value="0">Fixed</option>
                <option value="1">Proportional</option>
              </Input>
            </FormGroup>
          </Col>
          <Col md="3">
            <FormGroup>
              <Label>Royalty Base</Label>
              <Input
                type="select"
                value={rule.measure}
                onChange={(e) => handleRuleChange('measure', e.target.value)}
              >
                <option value="0">Usage</option>
                <option value="1">Sales</option>
                <option value="2">Days</option>
              </Input>
            </FormGroup>
          </Col>
          <Col md="3">
            <FormGroup>
              <Label>Duration (days)</Label>
              <Input
                type="number"
                min="1"
                value={rule.duration}
                onChange={(e) => handleRuleChange('duration', e.target.value)}
              />
            </FormGroup>
          </Col>
          <Col md="3">
            <FormGroup check style={{ marginTop: '30px' }}>
              <Label check>
                <Input
                  type="checkbox"
                  checked={rule.percPrice}
                  onChange={(e) => handleRuleChange('percPrice', e.target.checked)}
                />
                Percentage of Price
              </Label>
            </FormGroup>
          </Col>
        </Row>

        <div style={{ marginTop: '15px' }}>
          <Label>Threshold Amounts</Label>
          {rule.threshAmounts.map((thresh, threshIdx) => (
            <Row key={threshIdx} style={{ marginBottom: '5px' }}>
              <Col md="4">
                {threshIdx === 0 ? (
                  <span>Default Amount</span>
                ) : (
                  <Input
                    type="number"
                    min="1"
                    value={thresh.threshold}
                    onChange={(e) => handleThresholdChange(threshIdx, 'threshold', e.target.value)}
                    placeholder="Threshold"
                  />
                )}
              </Col>
              <Col md="4">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={thresh.amount}
                  onChange={(e) => handleThresholdChange(threshIdx, 'amount', e.target.value)}
                  placeholder="Amount"
                />
              </Col>
              <Col md="4">
                {threshIdx > 0 && (
                  <Button 
                    color="danger" 
                    size="sm"
                    onClick={() => removeThreshold(threshIdx)}
                  >
                    Remove
                  </Button>
                )}
              </Col>
            </Row>
          ))}
          <Button color="info" size="sm" onClick={addThreshold}>
            Add Threshold
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

const DeviceForm = ({ device, deviceIndex, licensors, ips, onDeviceUpdate }) => {
  const [activeRuleTab, setActiveRuleTab] = useState(0);

  const handleDeviceChange = (field, value) => {
    onDeviceUpdate(deviceIndex, { ...device, [field]: value });
  };

  const handleRuleUpdate = (deviceIdx, ruleIdx, updatedRule) => {
    const newRules = [...device.rules];
    newRules[ruleIdx] = updatedRule;
    handleDeviceChange('rules', newRules);
  };

  const addRule = () => {
    const newRule = {
      id: device.rules.length,
      name: `rule_${device.rules.length}`,
      ip: "",
      lor: 0,
      type: "0",
      measure: "0",
      duration: "30",
      percPrice: true,
      threshAmounts: [{ threshold: -1, amount: "1000" }]
    };
    handleDeviceChange('rules', [...device.rules, newRule]);
    setActiveRuleTab(device.rules.length);
  };

  const removeRule = (ruleIndex) => {
    if (device.rules.length > 1) {
      const newRules = device.rules.filter((_, idx) => idx !== ruleIndex);
      handleDeviceChange('rules', newRules);
      setActiveRuleTab(Math.max(0, activeRuleTab - 1));
    }
  };

  return (
    <Card style={{ marginBottom: '20px' }}>
      <CardHeader>
        <CardTitle tag="h5">{device.name}</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col md="4">
            <FormGroup>
              <Label>Device Name</Label>
              <Input
                type="text"
                value={device.name}
                onChange={(e) => handleDeviceChange('name', e.target.value)}
                placeholder="Enter device name"
              />
            </FormGroup>
          </Col>
          <Col md="4">
            <FormGroup>
              <Label>Price (cents)</Label>
              <Input
                type="number"
                min="0"
                value={device.price}
                onChange={(e) => handleDeviceChange('price', e.target.value)}
                placeholder="Enter price in cents"
              />
            </FormGroup>
          </Col>
          <Col md="4">
            <FormGroup>
              <Label>Color</Label>
              <div 
                style={{ 
                  backgroundColor: device.colour, 
                  height: '35px', 
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {device.colour}
              </div>
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col md="6">
            <FormGroup>
              <Label>Usage Popularity (1-50)</Label>
              <Input
                type="range"
                min="1"
                max="50"
                value={device.popularity}
                onChange={(e) => handleDeviceChange('popularity', e.target.value)}
              />
              <small>Current: {device.popularity}</small>
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label>Sales Quantity (1-30)</Label>
              <Input
                type="range"
                min="1"
                max="30"
                value={device.quantity}
                onChange={(e) => handleDeviceChange('quantity', e.target.value)}
              />
              <small>Current: {device.quantity}</small>
            </FormGroup>
          </Col>
        </Row>

        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h6>Licensing Rules ({device.rules.length})</h6>
            <Button color="primary" size="sm" onClick={addRule}>
              Add Rule
            </Button>
          </div>

          {device.rules.length > 0 && (
            <div>
              <Tabs 
                value={activeRuleTab} 
                onChange={(e, newValue) => setActiveRuleTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {device.rules.map((rule, idx) => (
                  <Tab 
                    key={idx} 
                    label={`Rule ${idx}`}
                    onClick={() => setActiveRuleTab(idx)}
                  />
                ))}
              </Tabs>

              {device.rules.map((rule, ruleIdx) => (
                <Box 
                  key={ruleIdx}
                  hidden={activeRuleTab !== ruleIdx}
                  style={{ marginTop: '10px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                    {device.rules.length > 1 && (
                      <Button 
                        color="danger" 
                        size="sm"
                        onClick={() => removeRule(ruleIdx)}
                      >
                        Remove Rule
                      </Button>
                    )}
                  </div>
                  <DeviceRuleForm
                    rule={rule}
                    ruleIndex={ruleIdx}
                    deviceIndex={deviceIndex}
                    licensors={licensors}
                    ips={ips}
                    onRuleUpdate={handleRuleUpdate}
                  />
                </Box>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

const LicensorsIPsManagement = ({ licensors, ips, setManualData, manualData }) => {
  const addLicensor = () => {
    const newLicensor = {
      id: licensors.length,
      name: `Licensor${licensors.length + 1}`,
      ips: []
    };
    setManualData({
      ...manualData,
      licensors: [...licensors, newLicensor]
    });
  };

  const removeLicensor = (licensorIndex) => {
    if (licensors.length > 1) {
      const newLicensors = licensors.filter((_, idx) => idx !== licensorIndex);
      // Update IPs that reference this licensor
      const updatedIps = ips.map(ip => ip.lor === licensorIndex ? { ...ip, lor: 0 } : ip);
      setManualData({
        ...manualData,
        licensors: newLicensors,
        ips: updatedIps
      });
    }
  };

  const updateLicensor = (licensorIndex, field, value) => {
    const newLicensors = [...licensors];
    newLicensors[licensorIndex] = { ...newLicensors[licensorIndex], [field]: value };
    setManualData({
      ...manualData,
      licensors: newLicensors
    });
  };

  const addIP = () => {
    const newIP = {
      id: ips.length,
      name: `IP${ips.length}`,
      lor: 0
    };
    setManualData({
      ...manualData,
      ips: [...ips, newIP]
    });
  };

  const removeIP = (ipIndex) => {
    if (ips.length > 1) {
      const newIps = ips.filter((_, idx) => idx !== ipIndex);
      setManualData({
        ...manualData,
        ips: newIps
      });
    }
  };

  const updateIP = (ipIndex, field, value) => {
    const newIps = [...ips];
    newIps[ipIndex] = { ...newIps[ipIndex], [field]: value };
    setManualData({
      ...manualData,
      ips: newIps
    });
  };

  return (
    <Row>
      <Col md="6">
        <Card>
          <CardHeader>
            <CardTitle tag="h6">
              Licensors ({licensors.length})
              <Button color="success" size="sm" className="ml-2" onClick={addLicensor}>
                Add Licensor
              </Button>
            </CardTitle>
          </CardHeader>
          <CardBody>
            {licensors.map((licensor, idx) => (
              <div key={idx} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <Row>
                  <Col md="8">
                    <FormGroup>
                      <Input
                        type="text"
                        value={licensor.name}
                        onChange={(e) => updateLicensor(idx, 'name', e.target.value)}
                        placeholder="Licensor name"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    {licensors.length > 1 && (
                      <Button 
                        color="danger" 
                        size="sm"
                        onClick={() => removeLicensor(idx)}
                      >
                        Remove
                      </Button>
                    )}
                  </Col>
                </Row>
                <small>IPs owned: {ips.filter(ip => ip.lor === idx).map(ip => ip.name).join(', ') || 'None'}</small>
              </div>
            ))}
          </CardBody>
        </Card>
      </Col>
      <Col md="6">
        <Card>
          <CardHeader>
            <CardTitle tag="h6">
              Intellectual Properties ({ips.length})
              <Button color="warning" size="sm" className="ml-2" onClick={addIP}>
                Add IP
              </Button>
            </CardTitle>
          </CardHeader>
          <CardBody>
            {ips.map((ip, idx) => (
              <div key={idx} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="text"
                        value={ip.name}
                        onChange={(e) => updateIP(idx, 'name', e.target.value)}
                        placeholder="IP name"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <Input
                        type="select"
                        value={ip.lor}
                        onChange={(e) => updateIP(idx, 'lor', parseInt(e.target.value))}
                      >
                        {licensors.map((licensor, lorIdx) => (
                          <option key={lorIdx} value={lorIdx}>
                            {licensor.name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="2">
                    {ips.length > 1 && (
                      <Button 
                        color="danger" 
                        size="sm"
                        onClick={() => removeIP(idx)}
                      >
                        ×
                      </Button>
                    )}
                  </Col>
                </Row>
              </div>
            ))}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

const ALPSManualForm = ({ manualData, setManualData }) => {
  const [activeDeviceTab, setActiveDeviceTab] = useState(0);

  // Initialize ALPS data structure if not exists
  if (!manualData.devices) {
    const initialData = {
      ...manualData,
      devices: [{
        id: 0,
        name: "Device1",
        price: "3500",
        colour: getSchemeColor(0),
        popularity: "25",
        quantity: "15",
        numActivated: 0,
        rules: [{
          id: 0,
          name: "rule_0",
          ip: "",
          lor: 0,
          type: "0",
          measure: "0",
          duration: "30",
          percPrice: true,
          threshAmounts: [{ threshold: -1, amount: "1000" }]
        }]
      }],
      licensees: [{
        id: 0,
        name: "Licensee1",
        devices: [0]
      }],
      licensors: [{
        id: 0,
        name: "Licensor1",
        ips: [0]
      }],
      ips: [{
        id: 0,
        name: "IP0",
        lor: 0
      }],
      currency: "USD"
    };
    setManualData(initialData);
    return null;
  }

  const addDevice = () => {
    const newDevice = {
      id: manualData.devices.length,
      name: `Device${manualData.devices.length + 1}`,
      price: "5000",
      colour: getSchemeColor(manualData.devices.length),
      popularity: "20",
      quantity: "10",
      numActivated: 0,
      rules: [{
        id: 0,
        name: "rule_0",
        ip: "",
        lor: 0,
        type: "0",
        measure: "0",
        duration: "30",
        percPrice: true,
        threshAmounts: [{ threshold: -1, amount: "1000" }]
      }]
    };
    
    setManualData({
      ...manualData,
      devices: [...manualData.devices, newDevice]
    });
    setActiveDeviceTab(manualData.devices.length);
  };

  const removeDevice = (deviceIndex) => {
    if (manualData.devices.length > 1) {
      const newDevices = manualData.devices.filter((_, idx) => idx !== deviceIndex);
      setManualData({
        ...manualData,
        devices: newDevices
      });
      setActiveDeviceTab(Math.max(0, activeDeviceTab - 1));
    }
  };

  const updateDevice = (deviceIndex, updatedDevice) => {
    const newDevices = [...manualData.devices];
    newDevices[deviceIndex] = updatedDevice;
    setManualData({
      ...manualData,
      devices: newDevices
    });
  };

  return (
    <div>
      <Row style={{ marginBottom: '20px' }}>
        <Col md="4">
          <Card>
            <CardBody>
              <h6>Quick Actions</h6>
              <Button color="success" size="sm" onClick={addDevice} className="mr-2">
                Add Device
              </Button>
            </CardBody>
          </Card>
        </Col>
        <Col md="8">
          <Card>
            <CardBody>
              <h6>Current Configuration</h6>
              <Row>
                <Col>Devices: {manualData.devices?.length || 0}</Col>
                <Col>Licensors: {manualData.licensors?.length || 0}</Col>
                <Col>IPs: {manualData.ips?.length || 0}</Col>
                <Col>Rules: {manualData.devices?.reduce((sum, device) => sum + (device.rules?.length || 0), 0) || 0}</Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <LicensorsIPsManagement 
        licensors={manualData.licensors}
        ips={manualData.ips}
        setManualData={setManualData}
        manualData={manualData}
      />

      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h5>Devices Configuration</h5>
        </div>

        {manualData.devices && manualData.devices.length > 0 && (
          <div>
            <Tabs 
              value={activeDeviceTab} 
              onChange={(e, newValue) => setActiveDeviceTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {manualData.devices.map((device, idx) => (
                <Tab 
                  key={idx} 
                  label={device.name}
                  onClick={() => setActiveDeviceTab(idx)}
                />
              ))}
            </Tabs>

            {manualData.devices.map((device, deviceIdx) => (
              <Box 
                key={deviceIdx}
                hidden={activeDeviceTab !== deviceIdx}
                style={{ marginTop: '20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                  {manualData.devices.length > 1 && (
                    <Button 
                      color="danger" 
                      size="sm"
                      onClick={() => removeDevice(deviceIdx)}
                    >
                      Remove Device
                    </Button>
                  )}
                </div>
                <DeviceForm
                  device={device}
                  deviceIndex={deviceIdx}
                  licensors={manualData.licensors}
                  ips={manualData.ips}
                  onDeviceUpdate={updateDevice}
                />
              </Box>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
                  <CloudUploadIcon style={{ marginRight: 8 }} />
                  Upload Document
                </Button>
              </label>
              <Typography variant="body2" color="textSecondary">
                Supported formats: TXT, DOC, DOCX, PDF, JSON (ALPS Config)
              </Typography>
            </div>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md="12">
          <FormGroup>
            <Label for="aiTextInput">Or Enter Text/JSON Manually</Label>
            <Input
              type="textarea"
              id="aiTextInput"
              rows="10"
              placeholder="Paste ALPS configuration JSON, license agreement text, or requirements for AI analysis..."
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
  const [configMode, setConfigMode] = useState('simple'); // 'simple' or 'alps'
  
  // Validation logic
  const isSimpleValid = mode === 'simple' && manualData.title && manualData.licensor;
  const isALPSValid = mode === 'alps' && manualData.devices && manualData.devices.length > 0;
  const isAIValid = validateAiText(aiText);
  
  const isNextDisabled = mode === 'manual' 
    ? (configMode === 'simple' ? !isSimpleValid : !isALPSValid)
    : !isAIValid;

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">
          {mode === 'manual' ? 'License Configuration' : 'AI-Assisted Creation'}
        </CardTitle>
        <p className="card-category">
          {mode === 'manual' 
            ? 'Choose between simple form or advanced ALPS device configuration' 
            : 'Upload ALPS configuration or provide text for AI analysis'
          }
        </p>
      </CardHeader>
      <CardBody>
        {mode === 'manual' ? (
          <div>
            {/* Mode Toggle for Manual */}
            <Row style={{ marginBottom: '20px' }}>
              <Col md="12">
                <div style={{ textAlign: 'center' }}>
                  <Button 
                    color={configMode === 'simple' ? 'primary' : 'secondary'}
                    onClick={() => setConfigMode('simple')}
                    className="mr-3"
                  >
                    Simple Form
                  </Button>
                  <Button 
                    color={configMode === 'alps' ? 'primary' : 'secondary'}
                    onClick={() => setConfigMode('alps')}
                  >
                    ALPS Configuration
                  </Button>
                </div>
              </Col>
            </Row>

            {configMode === 'simple' ? (
              <SimpleManualForm 
                manualData={manualData}
                setManualData={setManualData}
              />
            ) : (
              <ALPSManualForm 
                manualData={manualData}
                setManualData={setManualData}
              />
            )}
          </div>
        ) : (
          <AIConfigurationForm 
            aiText={aiText}
            setAiText={setAiText}
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
SimpleManualForm.propTypes = {
  manualData: PropTypes.object.isRequired,
  setManualData: PropTypes.func.isRequired,
};

DeviceRuleForm.propTypes = {
  rule: PropTypes.object.isRequired,
  ruleIndex: PropTypes.number.isRequired,
  deviceIndex: PropTypes.number.isRequired,
  licensors: PropTypes.array.isRequired,
  ips: PropTypes.array.isRequired,
  onRuleUpdate: PropTypes.func.isRequired,
};

DeviceForm.propTypes = {
  device: PropTypes.object.isRequired,
  deviceIndex: PropTypes.number.isRequired,
  licensors: PropTypes.array.isRequired,
  ips: PropTypes.array.isRequired,
  onDeviceUpdate: PropTypes.func.isRequired,
};

LicensorsIPsManagement.propTypes = {
  licensors: PropTypes.array.isRequired,
  ips: PropTypes.array.isRequired,
  setManualData: PropTypes.func.isRequired,
  manualData: PropTypes.object.isRequired,
};

ALPSManualForm.propTypes = {
  manualData: PropTypes.object.isRequired,
  setManualData: PropTypes.func.isRequired,
};

AIConfigurationForm.propTypes = {
  aiText: PropTypes.string.isRequired,
  setAiText: PropTypes.func.isRequired,
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