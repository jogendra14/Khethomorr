export const PRODUCT_TEMPLATES = {
  Fans: {
    productType: 'fan',
    fields: {
      fanDesign: {
        label: 'Fan Design',
        type: 'select',
        options: ['Aerodynamic', 'Classic', 'Modern', 'Traditional', 'Slim', 'Decorative'],
        placeholder: 'Select fan design'
      },
      color: {
        label: 'Color',
        type: 'select',
        options: ['White', 'Black', 'Silver', 'Gold', 'Brown', 'Wooden'],
        placeholder: 'Select color'
      },
      motor: {
        label: 'Motor Type',
        type: 'select',
        options: ['100% Copper', 'Aluminum', 'Steel', 'BLDC'],
        placeholder: 'Select motor type'
      },
      sweepSize: {
        label: 'Sweep Size',
        type: 'select',
        options: ['900mm', '1200mm', '1400mm', '1500mm', '1600mm'],
        placeholder: 'Select sweep size'
      },
      bladeCount: {
        label: 'Blade Count',
        type: 'select',
        options: ['3', '4', '5', '6'],
        placeholder: 'Select blade count'
      },
      material: {
        label: 'Material',
        type: 'select',
        options: ['Aluminum', 'Steel', 'Plastic', 'Wood', 'Composite'],
        placeholder: 'Select material'
      },
      fanWattage: {
        label: 'Wattage',
        type: 'text',
        placeholder: 'e.g., 75W'
      },
      airDelivery: {
        label: 'Air Delivery',
        type: 'text',
        placeholder: 'e.g., 210 CMM'
      },
      fanRpm: {
        label: 'RPM',
        type: 'text',
        placeholder: 'e.g., 1350 RPM'
      },
      weight: {
        label: 'Weight',
        type: 'text',
        placeholder: 'e.g., 4.2 kg'
      }
    }
  },
  Lighting: {
    productType: 'lighting',
    fields: {
      lightType: {
        label: 'Light Type',
        type: 'select',
        options: ['LED', 'CFL', 'Tube Light', 'Panel Light', 'Flood Light', 'Downlight'],
        placeholder: 'Select light type'
      },
      wattage: {
        label: 'Wattage',
        type: 'select',
        options: ['5W', '7W', '9W', '12W', '15W', '20W', '25W', '30W'],
        placeholder: 'Select wattage'
      },
      colorTemperature: {
        label: 'Color Temperature',
        type: 'select',
        options: ['Warm White (2700K)', 'Neutral White (4000K)', 'Cool White (6500K)'],
        placeholder: 'Select color temperature'
      },
      lumens: {
        label: 'Lumens',
        type: 'text',
        placeholder: 'e.g., 800 lumens'
      },
      beamAngle: {
        label: 'Beam Angle',
        type: 'select',
        options: ['15°', '30°', '45°', '60°', '90°', '120°'],
        placeholder: 'Select beam angle'
      },
      dimmable: {
        label: 'Dimmable',
        type: 'select',
        options: ['Yes', 'No'],
        placeholder: 'Select dimmable'
      },
      ipRating: {
        label: 'IP Rating',
        type: 'select',
        options: ['IP20', 'IP44', 'IP54', 'IP65', 'IP67'],
        placeholder: 'Select IP rating'
      },
      material: {
        label: 'Material',
        type: 'select',
        options: ['Aluminum', 'Plastic', 'Glass', 'Stainless Steel'],
        placeholder: 'Select material'
      },
      color: {
        label: 'Color',
        type: 'select',
        options: ['White', 'Black', 'Silver', 'Gold', 'Chrome'],
        placeholder: 'Select color'
      }
    }
  },
  Electricals: {
    productType: 'electricals',
    fields: {
      electricalType: {
        label: 'Product Type',
        type: 'select',
        options: ['Switch', 'Socket', 'MCB', 'Wire', 'Regulator', 'Distribution Box', 'Extension Board'],
        placeholder: 'Select product type'
      },
      rating: {
        label: 'Rating',
        type: 'select',
        options: ['5A', '10A', '16A', '20A', '32A', '40A', '50A', '63A'],
        placeholder: 'Select rating'
      },
      voltage: {
        label: 'Voltage',
        type: 'select',
        options: ['220V', '240V', '415V'],
        placeholder: 'Select voltage'
      },
      pole: {
        label: 'Pole Type',
        type: 'select',
        options: ['Single Pole', 'Double Pole', 'Triple Pole', 'Four Pole'],
        placeholder: 'Select pole type'
      },
      color: {
        label: 'Color',
        type: 'select',
        options: ['White', 'Black', 'Silver', 'Grey', 'Gold', 'Chrome'],
        placeholder: 'Select color'
      },
      material: {
        label: 'Material',
        type: 'select',
        options: ['Plastic', 'Metal', 'Glass', 'Polycarbonate', 'Stainless Steel'],
        placeholder: 'Select material'
      },
      wireLength: {
        label: 'Wire Length',
        type: 'select',
        options: ['5 meters', '10 meters', '15 meters', '20 meters', '30 meters', '50 meters', '100 meters'],
        placeholder: 'Select wire length'
      },
      wireSize: {
        label: 'Wire Size',
        type: 'select',
        options: ['0.5 mm²', '1.0 mm²', '1.5 mm²', '2.5 mm²', '4.0 mm²', '6.0 mm²', '10 mm²'],
        placeholder: 'Select wire size'
      }
    }
  },
  Appliances: {
    productType: 'appliances',
    fields: {
      applianceType: {
        label: 'Appliance Type',
        type: 'select',
        options: ['Kitchen', 'Bathroom', 'Home', 'Office'],
        placeholder: 'Select appliance type'
      },
      power: {
        label: 'Power Rating',
        type: 'select',
        options: ['500W', '750W', '1000W', '1500W', '2000W', '2500W'],
        placeholder: 'Select power rating'
      },
      voltage: {
        label: 'Voltage',
        type: 'select',
        options: ['220V', '240V'],
        placeholder: 'Select voltage'
      },
      capacity: {
        label: 'Capacity',
        type: 'text',
        placeholder: 'e.g., 5L'
      },
      material: {
        label: 'Material',
        type: 'select',
        options: ['Stainless Steel', 'Plastic', 'Glass', 'Aluminum', 'Copper'],
        placeholder: 'Select material'
      },
      color: {
        label: 'Color',
        type: 'select',
        options: ['White', 'Black', 'Silver', 'Red', 'Blue', 'Green'],
        placeholder: 'Select color'
      },
      specialFeatures: {
        label: 'Special Features',
        type: 'text',
        placeholder: 'e.g., Auto shut-off, Timer'
      }
    }
  },
  "Solar Product": {
    productType: 'solar',
    fields: {
      solarType: {
        label: 'Solar Product Type',
        type: 'select',
        options: ['Solar Panel', 'Solar Inverter', 'Solar Battery', 'Solar Charge Controller', 'Solar UPS'],
        placeholder: 'Select solar type'
      },
      powerRating: {
        label: 'Power Rating',
        type: 'select',
        options: ['100W', '200W', '300W', '400W', '500W', '1000W', '1500W', '2000W', '3000W', '5000W'],
        placeholder: 'Select power rating'
      },
      voltage: {
        label: 'Voltage',
        type: 'select',
        options: ['12V', '24V', '48V', '96V', '120V'],
        placeholder: 'Select voltage'
      },
      efficiency: {
        label: 'Efficiency',
        type: 'text',
        placeholder: 'e.g., 22.5%'
      },
      panelType: {
        label: 'Panel Type',
        type: 'select',
        options: ['Monocrystalline', 'Polycrystalline', 'Thin Film', 'Bifacial'],
        placeholder: 'Select panel type'
      },
      batteryType: {
        label: 'Battery Type',
        type: 'select',
        options: ['Lead Acid', 'Lithium-ion', 'Gel Battery', 'AGM'],
        placeholder: 'Select battery type'
      },
      capacity: {
        label: 'Capacity',
        type: 'text',
        placeholder: 'e.g., 100Ah'
      }
    }
  },
  "Smart Home": {
    productType: 'smartHome',
    fields: {
      smartType: {
        label: 'Smart Product Type',
        type: 'select',
        options: ['Smart Switch', 'Smart Plug', 'Smart Camera', 'Smart Bulb', 'Smart Sensor', 'Smart Lock'],
        placeholder: 'Select smart type'
      },
      connectivity: {
        label: 'Connectivity',
        type: 'select',
        options: ['Wi-Fi', 'Bluetooth', 'Zigbee', 'Z-Wave', 'RF', 'Infrared'],
        placeholder: 'Select connectivity'
      },
      compatibility: {
        label: 'Compatibility',
        type: 'select',
        options: ['Alexa', 'Google Assistant', 'Siri', 'HomeKit', 'SmartThings', 'All'],
        placeholder: 'Select compatibility'
      },
      voltage: {
        label: 'Voltage',
        type: 'select',
        options: ['12V', '24V', '120V', '220V', '240V'],
        placeholder: 'Select voltage'
      },
      color: {
        label: 'Color',
        type: 'select',
        options: ['White', 'Black', 'Silver'],
        placeholder: 'Select color'
      },
      features: {
        label: 'Features',
        type: 'text',
        placeholder: 'e.g., Motion sensor, Night vision'
      }
    }
  },
  "Safety & Security": {
    productType: 'safety',
    fields: {
      securityType: {
        label: 'Product Type',
        type: 'select',
        options: ['CCTV', 'Door Lock', 'Video Door Phone', 'Security System', 'Access Control'],
        placeholder: 'Select security type'
      },
      resolution: {
        label: 'Resolution',
        type: 'select',
        options: ['1080p', '2MP', '4MP', '5MP', '8MP', '4K'],
        placeholder: 'Select resolution'
      },
      lensType: {
        label: 'Lens Type',
        type: 'select',
        options: ['Fixed', 'Varifocal', 'Pan Tilt Zoom', 'Fisheye'],
        placeholder: 'Select lens type'
      },
      nightVision: {
        label: 'Night Vision',
        type: 'select',
        options: ['Yes', 'No'],
        placeholder: 'Select night vision'
      },
      lockType: {
        label: 'Lock Type',
        type: 'select',
        options: ['Digital', 'Biometric', 'Mechanical', 'Smart Lock', 'Magnetic'],
        placeholder: 'Select lock type'
      },
      ipRating: {
        label: 'IP Rating',
        type: 'select',
        options: ['IP20', 'IP44', 'IP54', 'IP65', 'IP66', 'IP67', 'IP68'],
        placeholder: 'Select IP rating'
      },
      connectivity: {
        label: 'Connectivity',
        type: 'select',
        options: ['Wi-Fi', 'Ethernet', 'Bluetooth', 'Zigbee', 'GSM'],
        placeholder: 'Select connectivity'
      }
    }
  },
  Others: {
    productType: 'others',
    fields: {
      productTypeName: {
        label: 'Product Type Name',
        type: 'text',
        placeholder: 'e.g., Accessories, Spare Parts'
      },
      material: {
        label: 'Material',
        type: 'select',
        options: ['Plastic', 'Metal', 'Glass', 'Rubber', 'Composite', 'Wood'],
        placeholder: 'Select material'
      },
      color: {
        label: 'Color',
        type: 'select',
        options: ['White', 'Black', 'Silver', 'Custom'],
        placeholder: 'Select color'
      },
      specifications: {
        label: 'Additional Specifications',
        type: 'textarea',
        placeholder: 'Enter any additional specifications'
      }
    }
  }
};

// Helper function to get template by category
export const getTemplateByCategory = (category) => {
  return PRODUCT_TEMPLATES[category] || PRODUCT_TEMPLATES.Others;
};

// Helper function to get all field names for a category
export const getFieldNamesByCategory = (category) => {
  const template = getTemplateByCategory(category);
  return Object.keys(template.fields);
};

// Helper function to get product type from category
export const getProductTypeFromCategory = (category) => {
  const template = PRODUCT_TEMPLATES[category];
  return template ? template.productType : 'others';
};