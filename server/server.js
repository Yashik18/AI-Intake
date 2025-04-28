require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const morgan = require('morgan');
const fs = require('fs');
const csv = require('csv-parser');
const XLSX = require('xlsx');

const app = express();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_PROD_URL 
    : process.env.FRONTEND_DEV_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// API Routes
const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// In-memory vendor data cache
let vendorData = [];

// Function to load vendor data from Excel file and convert to CSV if needed
const loadVendorData = async () => {
  try {
    const vendorsExcelPath = path.join(__dirname, 'data', 'vendors.xlsx');
    const vendorsCsvPath = path.join(__dirname, 'data', 'vendors.csv');

    // Check if CSV exists, if not convert Excel to CSV
    if (!fs.existsSync(vendorsCsvPath) && fs.existsSync(vendorsExcelPath)) {
      console.log('[INFO] Converting vendors.xlsx to vendors.csv');
      const workbook = XLSX.readFile(vendorsExcelPath);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const csvData = XLSX.utils.sheet_to_csv(firstSheet);
      fs.writeFileSync(vendorsCsvPath, csvData);
    }

    // Read the CSV file
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(vendorsCsvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(`[INFO] Loaded ${results.length} vendors from data file`);
          vendorData = results;
          resolve(results);
        })
        .on('error', (error) => {
          console.error('[ERROR] Failed to load vendor data:', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('[ERROR] Vendor data processing error:', error);
    throw error;
  }
};

// Vendor endpoints
router.get('/vendors', (req, res) => {
  const { city, category } = req.query;
  
  if (!city && !category) {
    return res.json({
      success: true,
      data: vendorData
    });
  }
  
  // Filter vendors based on city and/or category
  let filteredVendors = [...vendorData];
  
  if (city) {
    filteredVendors = filteredVendors.filter(vendor => 
      vendor.City && vendor.City.toLowerCase() === city.toLowerCase()
    );
  }
  
  if (category) {
    filteredVendors = filteredVendors.filter(vendor => 
      vendor.Category && vendor.Category.toLowerCase() === category.toLowerCase()
    );
  }
  
  res.json({
    success: true,
    data: filteredVendors
  });
});

router.post('/submit-form', async (req, res) => {
  try {
    const formData = req.body;
    
    // Generate a unique form ID
    const formId = `FORM-${Date.now()}`;
    
    console.log(`[INFO] Form submitted with ID: ${formId}`);
    
    // Find matching vendors
    let matchingVendors = [...vendorData];
    
    if (formData.region) {
      matchingVendors = matchingVendors.filter(vendor => 
        vendor.City && vendor.City.toLowerCase() === formData.region.toLowerCase()
      );
    }
    
    if (formData.category) {
      matchingVendors = matchingVendors.filter(vendor => 
        vendor.Category && vendor.Category.toLowerCase() === formData.category.toLowerCase()
      );
    }
    
    res.status(200).json({
      success: true,
      formId,
      matchingVendors: matchingVendors.slice(0, 5) // Limit to top 5 matches
    });
    
  } catch (error) {
    console.error('[ERROR] Form submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process form submission',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// AI Generation Endpoint (Gemini)
router.post('/ai-generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    console.log("[REQUEST] Received prompt:", prompt);

    if (!prompt) {
      console.warn("[VALIDATION] No prompt provided");
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Prompt is required' 
      });
    }

    // Get the Gemini model
    console.log("[MODEL] Initializing Gemini model...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });

    console.log("[GENERATION] Generating content...");
    const result = await model.generateContent({
      contents: [{
        parts: [{
          text: `You are an AI assistant that helps fill project intake forms. 
          Based on this prompt: ${prompt}, return valid JSON with these fields:
          businessUnit, region, endUser, priority, industry, category,
          costCenter, projectName, projectBudget, currency, dueDate,
          projectDescription, and items array with name, description,
          quantity, uom, benchmarkPrice. Only return the JSON object.`
        }]
      }]
    });

    const response = await result.response;
    const text = await response.text();
    
    console.log("[RESPONSE] Raw text from Gemini:\n", text);

    // Improved JSON parsing
    let aiResponse;
    try {
      aiResponse = JSON.parse(text);
      console.log("[PARSE] Parsed JSON directly.");
    } catch (e) {
      console.warn("[PARSE] Direct parse failed. Attempting to extract JSON...");
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      aiResponse = JSON.parse(jsonMatch[0]);
      console.log("[PARSE] Successfully extracted and parsed JSON.");
    }

    // Validate and sanitize response structure
    if (!aiResponse.items || !Array.isArray(aiResponse.items)) {
      console.warn("[VALIDATION] No items array found. Initializing with default.");
      aiResponse.items = [{
        name: "",
        description: "",
        quantity: "",
        uom: "",
        benchmarkPrice: ""
      }];
    }

    console.log("[SUCCESS] Sending AI response.");
    res.json({
      success: true,
      data: aiResponse
    });

  } catch (error) {
    console.error('[ERROR] AI Generation Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate AI content',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.use('/api', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize server
const startServer = async () => {
  try {
    // Load vendor data before starting server
    await loadVendorData();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();