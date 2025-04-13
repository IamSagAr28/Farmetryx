const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { createWorker } = require('tesseract.js');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Multer: Setting destination for file upload');
        const uploadDir = path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            console.log('Multer: Creating uploads directory');
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        console.log('Multer: Upload directory:', uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        console.log('Multer: Setting filename for uploaded file');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Multer: Generated filename:', filename);
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('Multer: Checking file type:', file.mimetype);
    if (file.mimetype.startsWith('image/')) {
        console.log('Multer: File type accepted');
        cb(null, true);
    } else {
        console.log('Multer: File type rejected');
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Debug middleware for API routes
router.use((req, res, next) => {
    console.log('API Route accessed:', req.method, req.path);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    next();
});

// Market Prices endpoint
router.get('/market-prices', async (req, res) => {
    try {
        const { crop, state } = req.query;
        console.log('Received request for market prices:', { crop, state });

        if (!crop) {
            return res.status(400).json({ error: 'Crop parameter is required' });
        }

        // Sample market data for different states with more districts
        const stateDistricts = {
            'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kakinada', 'Rajahmundry', 'Anantapur', 'Kadapa', 'Ongole', 'Eluru', 'Tadepalligudem', 'Narasaraopet', 'Tenali', 'Bhimavaram', 'Tadipatri', 'Proddatur', 'Chittoor', 'Hindupur'],
            'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Tawang', 'Bomdila', 'Pasighat', 'Ziro', 'Along', 'Tezu', 'Daporijo', 'Aalo', 'Anini', 'Changlang', 'Khonsa', 'Roing', 'Yingkiong', 'Basar', 'Seppa', 'Koloriang', 'Mechuka', 'Hayuliang'],
            'Assam': ['Guwahati', 'Dibrugarh', 'Jorhat', 'Silchar', 'Tezpur', 'Nagaon', 'Tinsukia', 'Barpeta', 'Dhubri', 'Goalpara', 'Bongaigaon', 'Kokrajhar', 'Dhemaji', 'Lakhimpur', 'Sivasagar', 'Dima Hasao', 'Karbi Anglong', 'Karimganj', 'Hailakandi', 'Cachar'],
            'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chapra', 'Motihari', 'Siwan', 'Hajipur', 'Saharsa', 'Madhubani', 'Samastipur', 'Bettiah', 'Kishanganj', 'Jamui'],
            'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Raigarh', 'Ambikapur', 'Jagdalpur', 'Rajnandgaon', 'Dhamtari', 'Mahasamund', 'Janjgir', 'Kanker', 'Kawardha', 'Balod', 'Baloda Bazar', 'Bemetara', 'Mungeli', 'Sakti', 'Baikunthpur'],
            'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Valpoi', 'Curchorem', 'Quepem', 'Canacona', 'Pernem', 'Sanguem', 'Sanquelim', 'Cuncolim', 'Benaulim', 'Cavelossim', 'Colva', 'Calangute', 'Candolim', 'Anjuna'],
            'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Anand', 'Bharuch', 'Nadiad', 'Palanpur', 'Himatnagar', 'Junagadh', 'Gandhidham', 'Morbi', 'Surendranagar', 'Navsari', 'Valsad', 'Veraval', 'Porbandar'],
            'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Bhiwani', 'Sirsa', 'Jind', 'Kaithal', 'Rewari', 'Palwal', 'Narnaul', 'Bahadurgarh', 'Jhajjar', 'Fatehabad', 'Hansi'],
            'Himachal Pradesh': ['Shimla', 'Mandi', 'Solan', 'Dharamshala', 'Bilaspur', 'Kullu', 'Chamba', 'Una', 'Hamirpur', 'Nahan', 'Palampur', 'Kangra', 'Mandi', 'Kasauli', 'Dalhousie', 'Manali', 'Kufri', 'Chail', 'Narkanda', 'Rampur'],
            'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chatra', 'Koderma', 'Gumla', 'Lohardaga', 'Simdega', 'Pakur', 'Godda', 'Sahibganj', 'Dumka', 'Jamtara', 'Khunti'],
            'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Hassan', 'Mandya', 'Chitradurga', 'Kolar', 'Gangawati', 'Robertsonpet', 'Bhadravati'],
            'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Kannur', 'Kottayam', 'Malappuram', 'Manjeri', 'Thalassery', 'Ponnani', 'Taliparamba', 'Neyyattinkara', 'Kayamkulam', 'Kodungallur', 'Kasaragod', 'Kanhangad', 'Nedumangad'],
            'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara', 'Vidisha', 'Shivpuri', 'Guna'],
            'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Kolhapur', 'Aurangabad', 'Solapur', 'Amravati', 'Thane', 'Pimpri-Chinchwad', 'Kalyan-Dombivli', 'Vasai-Virar', 'Navi Mumbai', 'Malegaon', 'Nanded', 'Sangli', 'Latur', 'Dhule', 'Ahmednagar', 'Jalgaon'],
            'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Ukhrul', 'Senapati', 'Tamenglong', 'Chandel', 'Jiribam', 'Kakching', 'Lilong', 'Mayang Imphal', 'Moirang', 'Nambol', 'Oinam', 'Sekmai', 'Wangjing', 'Yairipok', 'Kangpokpi', 'Saikul'],
            'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Williamnagar', 'Baghmara', 'Nongpoh', 'Mairang', 'Mawkyrwat', 'Nongpoh', 'Resubelpara', 'Amlarem', 'Khliehriat', 'Mawphlang', 'Mawkyrwat', 'Mawshynrut', 'Mawryngkneng', 'Mawlaikyntan', 'Mawkyrwat', 'Mawshynrut'],
            'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip', 'Lawngtlai', 'Mamit', 'Khawzawl', 'Saitual', 'Hnahthial', 'Khawbung', 'Thenzawl', 'Vairengte', 'Bilkhawthlir', 'Darlawn', 'Phullen', 'Reiek', 'Sihhmui', 'Tlabung'],
            'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek', 'Mon', 'Longleng', 'Kiphire', 'Peren', 'Noklak', 'Tseminyu', 'Bhandari', 'Tuli', 'Niuland', 'Chumukedima', 'Medziphema', 'Jalukie', 'Pfutsero'],
            'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda', 'Bargarh', 'Jeypore', 'Rayagada', 'Jagatsinghpur', 'Kendrapara', 'Boudh', 'Nabarangpur', 'Koraput', 'Malkangiri', 'Nayagarh'],
            'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Pathankot', 'Mohali', 'Hoshiarpur', 'Moga', 'Firozpur', 'Sangrur', 'Barnala', 'Faridkot', 'Fazilka', 'Gurdaspur', 'Kapurthala', 'Mansa', 'Muktsar', 'Rupnagar', 'Tarn Taran'],
            'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sri Ganganagar', 'Sikar', 'Pali', 'Tonk', 'Hanumangarh', 'Dausa', 'Churu', 'Nagaur', 'Jhunjhunu', 'Barmer', 'Jaisalmer'],
            'Sikkim': ['Gangtok', 'Namchi', 'Mangan', 'Gyalshing', 'Ravangla', 'Singtam', 'Rangpo', 'Jorethang', 'Pelling', 'Lachen', 'Lachung', 'Yuksom', 'Rumtek', 'Rhenock', 'Rongli', 'Soreng', 'Melli', 'Rangpo', 'Jorethang', 'Namthang'],
            'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Tiruppur', 'Dindigul', 'Thanjavur', 'Tiruvannamalai', 'Kancheepuram', 'Nagercoil', 'Kumbakonam', 'Hosur', 'Karaikudi', 'Neyveli', 'Cuddalore'],
            'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Suryapet', 'Miryalaguda', 'Siddipet', 'Jangaon', 'Mancherial', 'Kamareddy', 'Adilabad', 'Nirmal', 'Medak', 'Sangareddy', 'Vikarabad', 'Jagtial'],
            'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia', 'Khowai', 'Teliamura', 'Ambassa', 'Kumarghat', 'Sabroom', 'Bishalgarh', 'Sonamura', 'Kamalpur', 'Kailasahar', 'Dharamnagar', 'Khowai', 'Teliamura', 'Ambassa', 'Kumarghat', 'Sabroom'],
            'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Allahabad', 'Meerut', 'Ghaziabad', 'Noida', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Faizabad', 'Jhansi', 'Bareilly', 'Mathura', 'Shahjahanpur', 'Firozabad', 'Etawah', 'Mirzapur'],
            'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Ramnagar', 'Mussoorie', 'Nainital', 'Almora', 'Pithoragarh', 'Srinagar', 'Kotdwara', 'Manglaur', 'Laksar', 'Sitarganj', 'Khatima', 'Tanakpur', 'Bazpur'],
            'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Kharagpur', 'Haldia', 'Krishnanagar', 'Berhampore', 'Raiganj', 'Balurghat', 'Jalpaiguri', 'Purulia', 'Bankura', 'Cooch Behar', 'Darjeeling', 'Alipurduar', 'Jangipur']
        };

        // Get districts for the selected state or all states if none selected
        let districts = [];
        if (state) {
            if (stateDistricts[state]) {
                districts = stateDistricts[state];
            } else {
                // If state is not found, return a helpful error message
                return res.status(400).json({ 
                    error: `State '${state}' not found. Available states are: ${Object.keys(stateDistricts).join(', ')}` 
                });
            }
        } else {
            // If no state selected, get all districts from all states
            districts = Object.values(stateDistricts).flat();
        }

        // Generate market data for each district
        const marketData = districts.map(district => {
            // Generate base price for the district
            const basePrice = Math.floor(Math.random() * 1000) + 500;
            const minPrice = Math.floor(basePrice * 0.7);
            const maxPrice = Math.floor(basePrice * 1.3);
            
            // Determine market trend
            const trends = ['Rising', 'Falling', 'Stable'];
            const trend = trends[Math.floor(Math.random() * 3)];
            
            // Generate market insight based on trend
            const insights = {
                'Rising': [
                    'Market showing upward trend due to high demand',
                    'Prices increasing due to seasonal factors',
                    'Growing demand from local markets'
                ],
                'Falling': [
                    'Market showing downward trend due to oversupply',
                    'Prices decreasing due to good harvest',
                    'Reduced demand from wholesale markets'
                ],
                'Stable': [
                    'Market is stable with moderate demand',
                    'Prices steady with balanced supply and demand',
                    'Normal market conditions prevailing'
                ]
            };
            
            const insight = insights[trend][Math.floor(Math.random() * 3)];

            // Find the state for this district
            const districtState = state || Object.keys(stateDistricts).find(s => stateDistricts[s].includes(district));

            return {
                district: district,
                prices: [{
                    market: `${district} APMC`,
                    crop: crop,
                    price: basePrice,
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    state: districtState,
                    date: new Date().toISOString().split('T')[0],
                    trend: trend,
                    insight: insight
                }]
            };
        });

        // Sort districts alphabetically
        marketData.sort((a, b) => a.district.localeCompare(b.district));

        console.log('Sending market data for districts:', marketData.map(d => d.district));
        return res.json(marketData);
    } catch (error) {
        console.error('Error in market prices endpoint:', error);
        res.status(500).json({ 
            error: 'Failed to fetch market prices',
            details: error.message 
        });
    }
});

// Disease Detection endpoint
router.post('/detect-disease', upload.single('image'), async (req, res) => {
    try {
        console.log('Disease detection endpoint hit');
        console.log('Request file:', req.file);
        console.log('Request body:', req.body);

        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        // For now, return sample data
        const sampleData = {
            disease: 'Leaf Rust',
            confidence: '85%',
            description: 'Leaf rust is a fungal disease that affects the leaves of plants, causing yellow or brown spots.',
            symptoms: [
                'Yellow or brown spots on leaves',
                'Premature leaf drop',
                'Reduced plant vigor',
                'Stunted growth'
            ],
            treatment: [
                'Apply fungicide containing chlorothalonil or mancozeb',
                'Remove and destroy infected leaves',
                'Improve air circulation around plants',
                'Water plants at the base to avoid wetting leaves'
            ],
            prevention: [
                'Plant disease-resistant varieties',
                'Maintain proper spacing between plants',
                'Avoid overhead watering',
                'Clean up plant debris regularly',
                'Rotate crops annually'
            ]
        };

        // Clean up the uploaded file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting uploaded file:', err);
        });

        res.json(sampleData);
    } catch (error) {
        console.error('Error in disease detection:', error);
        res.status(500).json({ 
            error: 'Failed to process image',
            details: error.message 
        });
    }
});

// Debug endpoint to verify route registration
router.get('/test', (req, res) => {
    res.json({ message: 'API routes are working' });
});

module.exports = router; 