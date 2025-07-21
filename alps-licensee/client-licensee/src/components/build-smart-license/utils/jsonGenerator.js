/**
 * Generates smart license JSON configuration based on creation mode and input data
 * @param {string} mode - Creation mode ('manual' or 'ai')
 * @param {Object} manualData - Manual form data with ALPS structure or simple form
 * @param {string} aiText - AI input text
 * @returns {string} JSON string of the smart license configuration
 */
export const generateSmartLicenseJson = (mode, manualData, aiText) => {
  let jsonData;
  
  if (mode === 'manual') {
    // Check if it's simple form or ALPS configuration
    const isALPSMode = manualData.devices && Array.isArray(manualData.devices);
    
    if (isALPSMode) {
      // Generate ALPS-compatible smart license structure
      jsonData = {
        smartLicense: {
          id: `SL_${Date.now()}`,
          title: `ALPS Smart License - ${new Date().toLocaleDateString()}`,
          version: "2.0.0",
          creationMode: "manual_alps",
          
          // ALPS Configuration Structure
          alpsConfig: {
            referenceCurrency: manualData.currency || "USD",
            devices: manualData.devices?.map(device => ({
              id: device.id,
              name: device.name,
              price: parseInt(device.price) || 0,
              colour: device.colour,
              popularity: parseInt(device.popularity) || 1,
              quantity: parseInt(device.quantity) || 1,
              numActivated: device.numActivated || 0,
              licensee: device.lee || 0,
              oracle: device.id, // Device ID as oracle
              numRules: device.rules?.length || 0,
              rules: device.rules?.map((rule, ruleIdx) => ({
                id: ruleIdx,
                name: rule.name,
                ip: rule.ip,
                lor: rule.lor,
                device: device.id,
                type: parseInt(rule.type), // 0 = Fixed, 1 = Proportional
                measure: parseInt(rule.measure), // 0 = Usage, 1 = Sales, 2 = Days
                duration: parseInt(rule.duration) || 30,
                percPrice: rule.percPrice,
                customers: rule.customers || false,
                threshAmounts: rule.threshAmounts?.map(thresh => [
                  thresh.threshold === -1 ? -1 : parseInt(thresh.threshold),
                  parseFloat(thresh.amount) || 0
                ]) || [[-1, 1000]]
              })) || []
            })) || [],
            
            licensees: manualData.licensees?.map(licensee => ({
              id: licensee.id,
              name: licensee.name,
              devices: licensee.devices || []
            })) || [],
            
            licensors: manualData.licensors?.map(licensor => ({
              id: licensor.id,
              name: licensor.name,
              ips: licensor.ips || [],
              currentAmount: 0
            })) || [],
            
            ips: manualData.ips?.map(ip => ({
              id: ip.id,
              name: ip.name,
              lor: ip.lor
            })) || []
          },
          
          // Standard Smart License Metadata
          blockchain: {
            network: "ethereum",
            contractAddress: "TBD",
            deploymentTx: "TBD",
            gasEstimate: "TBD"
          },
          
          status: "draft",
          createdAt: new Date().toISOString(),
          
          // License Summary for Quick Reference
          summary: {
            totalDevices: manualData.devices?.length || 0,
            totalRules: manualData.devices?.reduce((sum, device) => sum + (device.rules?.length || 0), 0) || 0,
            totalLicensors: manualData.licensors?.length || 0,
            totalIPs: manualData.ips?.length || 0,
            estimatedComplexity: calculateComplexity(manualData),
            configurationMode: "ALPS Advanced"
          },
          
          // Validation Results
          validation: {
            isValid: validateALPSConfiguration(manualData),
            warnings: getConfigurationWarnings(manualData),
            requiredFields: getRequiredFieldsStatus(manualData)
          }
        }
      };
    } else {
      // Simple form mode
      jsonData = {
        smartLicense: {
          id: `SL_${Date.now()}`,
          title: manualData.title || "Simple Smart License",
          version: "2.0.0",
          creationMode: "manual_simple",
          
          // Simple License Structure
          licensor: manualData.licensor,
          licensee: "TBD", // To be determined when license is executed
          
          intellectualProperty: {
            description: manualData.ipDescription || "Intellectual property as described in agreement",
            type: "General License"
          },
          
          terms: {
            licenseType: manualData.type || "non-exclusive",
            duration: {
              months: parseInt(manualData.duration) || 12,
              startDate: "TBD",
              endDate: "TBD"
            },
            territory: manualData.territory || "Worldwide",
            royaltyRate: parseFloat(manualData.royaltyRate) || 0,
            restrictions: manualData.restrictions || "Standard licensing restrictions apply"
          },
          
          // Standard Smart License Metadata
          blockchain: {
            network: "ethereum",
            contractAddress: "TBD",
            deploymentTx: "TBD",
            gasEstimate: "TBD"
          },
          
          status: "draft",
          createdAt: new Date().toISOString(),
          
          // License Summary
          summary: {
            licenseType: manualData.type || "non-exclusive",
            duration: `${manualData.duration || 12} months`,
            royaltyRate: `${manualData.royaltyRate || 0}%`,
            territory: manualData.territory || "Worldwide",
            configurationMode: "Simple Form"
          },
          
          // Simple Validation
          validation: {
            isValid: validateSimpleConfiguration(manualData),
            warnings: getSimpleConfigurationWarnings(manualData),
            requiredFields: getSimpleRequiredFieldsStatus(manualData)
          }
        }
      };
    }
  } else {
    // AI mode - try to parse ALPS JSON or generate from text
    let parsedConfig = null;
    
    // Try to parse as ALPS JSON first
    try {
      const parsed = JSON.parse(aiText);
      if (parsed.devs && parsed.lors && parsed.ipss) {
        // This looks like ALPS simulator format
        parsedConfig = convertALPSSimulatorToStandardFormat(parsed);
      }
    } catch (e) {
      // Not valid JSON, treat as text for AI analysis
    }
    
    if (parsedConfig) {
      jsonData = {
        smartLicense: {
          id: `SL_AI_${Date.now()}`,
          title: "AI Generated License from ALPS Configuration",
          version: "2.0.0",
          creationMode: "ai_alps",
          
          alpsConfig: parsedConfig,
          
          blockchain: {
            network: "ethereum",
            contractAddress: "TBD",
            deploymentTx: "TBD"
          },
          
          aiAnalysis: {
            inputFormat: "ALPS JSON Configuration",
            confidence: 0.95,
            processingTimestamp: new Date().toISOString(),
            detectedEntities: ["Devices", "Licensors", "IPs", "Rules", "Thresholds"],
            suggestedImprovements: [
              "Review rule thresholds for optimal pricing",
              "Consider device interaction effects",
              "Validate IP ownership assignments"
            ]
          },
          
          status: "draft",
          createdAt: new Date().toISOString()
        }
      };
    } else {
      // Standard AI text processing
      jsonData = {
        smartLicense: {
          id: `SL_AI_${Date.now()}`,
          title: "AI Generated License from Text Analysis",
          version: "2.0.0",
          creationMode: "ai_text",
          
          // Simulated AI extraction - Simple format
          licensor: "AI Detected Licensor",
          licensee: "TBD",
          
          intellectualProperty: {
            description: "AI analyzed intellectual property from provided text",
            type: "AI Determined"
          },
          
          terms: {
            licenseType: "non-exclusive", // Default suggestion
            duration: {
              months: 24, // Default AI suggestion
              startDate: "TBD",
              endDate: "TBD"
            },
            territory: "AI Determined Territory",
            royaltyRate: 3.5, // Default AI suggestion
            restrictions: "AI extracted restrictions from text"
          },
          
          blockchain: {
            network: "ethereum",
            contractAddress: "TBD",
            deploymentTx: "TBD"
          },
          
          aiAnalysis: {
            inputText: aiText.substring(0, 200) + "...",
            confidence: 0.75,
            processingTimestamp: new Date().toISOString(),
            extractedEntities: ["License Terms", "Royalty Structure", "Duration"],
            suggestedImprovements: [
              "Refine license scope and definitions", 
              "Add specific territorial limitations",
              "Specify payment terms and schedules"
            ],
            requiresReview: true
          },
          
          status: "draft",
          createdAt: new Date().toISOString()
        }
      };
    }
  }

  return JSON.stringify(jsonData, null, 2);
};

/**
 * Converts ALPS simulator JSON format to standard format
 * @param {Object} alpsData - ALPS simulator data
 * @returns {Object} Converted ALPS configuration
 */
const convertALPSSimulatorToStandardFormat = (alpsData) => {
  return {
    referenceCurrency: alpsData.refCu || "USD",
    devices: alpsData.devs?.map(dev => ({
      ...dev,
      rules: dev.rules222 || []
    })) || [],
    licensees: alpsData.lees || [],
    licensors: alpsData.lors || [],
    ips: alpsData.ipss || []
  };
};

/**
 * Calculates configuration complexity score
 * @param {Object} data - ALPS configuration data
 * @returns {string} Complexity level
 */
const calculateComplexity = (data) => {
  if (!data.devices) return "Low";
  
  const deviceCount = data.devices.length;
  const totalRules = data.devices.reduce((sum, device) => sum + (device.rules?.length || 0), 0);
  const avgThresholds = data.devices.reduce((sum, device) => 
    sum + device.rules?.reduce((ruleSum, rule) => ruleSum + (rule.threshAmounts?.length || 0), 0) || 0, 0
  ) / Math.max(totalRules, 1);
  
  const complexityScore = deviceCount * 2 + totalRules * 3 + avgThresholds * 1.5;
  
  if (complexityScore < 10) return "Low";
  if (complexityScore < 25) return "Medium";
  return "High";
};

/**
 * Validates ALPS configuration
 * @param {Object} data - ALPS configuration data
 * @returns {boolean} True if configuration is valid
 */
const validateALPSConfiguration = (data) => {
  if (!data.devices || data.devices.length === 0) return false;
  if (!data.licensors || data.licensors.length === 0) return false;
  if (!data.ips || data.ips.length === 0) return false;
  
  // Check that each device has at least one rule
  for (const device of data.devices) {
    if (!device.rules || device.rules.length === 0) return false;
  }
  
  return true;
};

/**
 * Validates simple configuration
 * @param {Object} data - Simple form data
 * @returns {boolean} True if configuration is valid
 */
const validateSimpleConfiguration = (data) => {
  return Boolean(data.title && data.licensor);
};

/**
 * Gets ALPS configuration warnings
 * @param {Object} data - ALPS configuration data
 * @returns {Array} Array of warning messages
 */
const getConfigurationWarnings = (data) => {
  const warnings = [];
  
  if (!data.devices || data.devices.length === 0) {
    warnings.push("No devices configured");
  }
  
  if (data.devices) {
    data.devices.forEach((device, idx) => {
      if (!device.name || device.name.trim() === "") {
        warnings.push(`Device ${idx} has no name`);
      }
      if (!device.rules || device.rules.length === 0) {
        warnings.push(`Device ${device.name || idx} has no rules`);
      }
      if (parseInt(device.price) <= 0) {
        warnings.push(`Device ${device.name || idx} has invalid price`);
      }
    });
  }
  
  return warnings;
};

/**
 * Gets simple configuration warnings
 * @param {Object} data - Simple form data
 * @returns {Array} Array of warning messages
 */
const getSimpleConfigurationWarnings = (data) => {
  const warnings = [];
  
  if (!data.title || data.title.trim() === "") {
    warnings.push("License title is required");
  }
  if (!data.licensor || data.licensor.trim() === "") {
    warnings.push("Licensor name is required");
  }
  if (!data.type) {
    warnings.push("License type not specified");
  }
  if (!data.duration || parseInt(data.duration) <= 0) {
    warnings.push("Invalid or missing duration");
  }
  if (!data.royaltyRate || parseFloat(data.royaltyRate) < 0) {
    warnings.push("Invalid royalty rate");
  }
  
  return warnings;
};

/**
 * Gets ALPS required fields status
 * @param {Object} data - ALPS configuration data
 * @returns {Object} Status of required fields
 */
const getRequiredFieldsStatus = (data) => {
  return {
    hasDevices: !!(data.devices && data.devices.length > 0),
    hasLicensors: !!(data.licensors && data.licensors.length > 0),
    hasIPs: !!(data.ips && data.ips.length > 0),
    allDevicesHaveRules: data.devices?.every(device => device.rules && device.rules.length > 0) || false,
    allDevicesHaveValidPrices: data.devices?.every(device => parseInt(device.price) > 0) || false
  };
};

/**
 * Gets simple required fields status
 * @param {Object} data - Simple form data
 * @returns {Object} Status of required fields
 */
const getSimpleRequiredFieldsStatus = (data) => {
  return {
    hasTitle: !!(data.title && data.title.trim()),
    hasLicensor: !!(data.licensor && data.licensor.trim()),
    hasType: !!data.type,
    hasDuration: !!(data.duration && parseInt(data.duration) > 0),
    hasRoyaltyRate: !!(data.royaltyRate && parseFloat(data.royaltyRate) >= 0),
    hasTerritory: !!(data.territory && data.territory.trim())
  };
};

/**
 * Validates manual ALPS data completeness
 * @param {Object} manualData - Manual ALPS form data
 * @returns {boolean} True if data is valid for JSON generation
 */
export const validateManualData = (manualData) => {
  // Check if it's ALPS mode
  if (manualData.devices && Array.isArray(manualData.devices)) {
    return manualData.devices.length > 0;
  }
  // Simple mode validation
  return Boolean(manualData.title && manualData.licensor);
};

/**
 * Validates AI text input
 * @param {string} aiText - AI input text
 * @returns {boolean} True if text is valid for AI processing
 */
export const validateAiText = (aiText) => {
  return Boolean(aiText && aiText.trim().length > 10);
}; 