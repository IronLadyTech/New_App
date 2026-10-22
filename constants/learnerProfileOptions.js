/**
 * Choices for the learner's profile: city, field of work, annual income, B-HAG starters.
 * Field of work and income values match the Zoho Lead picklists exactly
 * (Industry_Field_of_Work, Annual_Income) so they save to Zoho as they are.
 */

/** Shown as one-tap chips above the search. */
export const POPULAR_CITIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

/** Searchable list. Any other city can still be typed and used as it is. */
export const INDIAN_CITIES = [
  'Agartala', 'Agra', 'Ahmedabad', 'Ahmednagar', 'Aizawl', 'Ajmer', 'Akola', 'Aligarh', 'Allahabad (Prayagraj)', 'Alappuzha',
  'Amravati', 'Amritsar', 'Anand', 'Asansol', 'Aurangabad', 'Bareilly', 'Belagavi', 'Bengaluru', 'Bhagalpur', 'Bharuch',
  'Bhavnagar', 'Bhilai', 'Bhopal', 'Bhubaneswar', 'Bikaner', 'Bilaspur', 'Bokaro', 'Chandigarh', 'Chennai', 'Coimbatore',
  'Cuttack', 'Davangere', 'Dehradun', 'Delhi NCR', 'New Delhi', 'Gurugram', 'Noida', 'Ghaziabad', 'Faridabad', 'Dhanbad',
  'Dharwad', 'Durgapur', 'Erode', 'Gandhinagar', 'Gangtok', 'Gaya', 'Goa (Panaji)', 'Gorakhpur', 'Guntur', 'Guwahati',
  'Gwalior', 'Haridwar', 'Hisar', 'Hosur', 'Hubballi', 'Hyderabad', 'Secunderabad', 'Imphal', 'Indore', 'Itanagar',
  'Jabalpur', 'Jaipur', 'Jalandhar', 'Jalgaon', 'Jammu', 'Jamnagar', 'Jamshedpur', 'Jhansi', 'Jodhpur', 'Kakinada',
  'Kannur', 'Kanpur', 'Karnal', 'Kochi', 'Kolhapur', 'Kolkata', 'Kollam', 'Kota', 'Kottayam', 'Kozhikode',
  'Kurnool', 'Lucknow', 'Ludhiana', 'Madurai', 'Malappuram', 'Mangaluru', 'Mathura', 'Meerut', 'Mohali', 'Moradabad',
  'Mumbai', 'Navi Mumbai', 'Thane', 'Mysuru', 'Nagpur', 'Nanded', 'Nashik', 'Nellore', 'Panchkula', 'Panipat',
  'Patiala', 'Patna', 'Puducherry', 'Pune', 'Raipur', 'Rajahmundry', 'Rajkot', 'Ranchi', 'Rohtak', 'Rourkela',
  'Saharanpur', 'Salem', 'Sangli', 'Shillong', 'Shimla', 'Siliguri', 'Solapur', 'Srinagar', 'Surat', 'Thanjavur',
  'Thiruvananthapuram', 'Thrissur', 'Tiruchirappalli', 'Tirunelveli', 'Tirupati', 'Tiruppur', 'Udaipur', 'Udupi', 'Ujjain', 'Vadodara',
  'Varanasi', 'Vellore', 'Vijayawada', 'Visakhapatnam', 'Warangal',
  'Outside India',
];

/** Exactly the Zoho "Industry/Field of Work" picklist, with an icon each. */
export const FIELDS_OF_WORK = [
  { value: 'Banking & Finance', icon: 'account-balance' },
  { value: 'Doctor & Healthcare', icon: 'local-hospital' },
  { value: 'Education', icon: 'school' },
  { value: 'Entrepreneur (Business)', icon: 'rocket-launch' },
  { value: 'HR', icon: 'groups' },
  { value: 'IT & Engineering', icon: 'computer' },
  { value: 'Operations and Admin', icon: 'settings' },
  { value: 'Sales & Marketing', icon: 'campaign' },
  { value: 'Government & PSU', icon: 'account-balance-wallet' },
  { value: 'Lawyer', icon: 'gavel' },
  { value: 'Food/ Agriculture', icon: 'agriculture' },
  { value: 'Logistics/ Transport/ Supply chain', icon: 'local-shipping' },
  { value: 'NGO/ Community Service', icon: 'volunteer-activism' },
  { value: 'Automobile/ Aviation/ Merchant', icon: 'flight' },
  { value: 'Architect/ Interior Designer', icon: 'architecture' },
  { value: 'Science/ Researcher/ Scientist', icon: 'science' },
  { value: 'Saloon/ Parlour Owner', icon: 'content-cut' },
  { value: 'Travel & Tourism', icon: 'luggage' },
  { value: 'Manufacturing', icon: 'precision-manufacturing' },
  { value: 'Other', icon: 'more-horiz' },
];

/**
 * Annual income ranges. All but "Less than 5L" exist in the Zoho "Annual Income"
 * picklist; "Less than 5L" needs adding there by a Zoho admin.
 */
export const SALARY_RANGES = ['Less than 5L', '5L - 10L', '10L - 20L', '20L - 30L', '30L - 50L', '50L - 1Cr', 'Above 1Cr'];

/** "In the next 3 months, I will …" starters, a few per field of work, plus general ones. */
const GENERAL_STARTERS = [
  'get promoted to the next role',
  'lead a bigger team or a new project',
  'start speaking up confidently in leadership meetings',
];

const STARTERS_BY_FIELD = {
  'Banking & Finance': ['move into a branch or business head role', 'lead a high-value portfolio or new product'],
  'Doctor & Healthcare': ['take up a department or clinical lead role', 'start my own clinic or practice'],
  Education: ['become a head of department or principal', 'launch my own course or academy'],
  'Entrepreneur (Business)': ['double my monthly revenue', 'hire and lead my first core team'],
  HR: ['become HR business partner for a larger unit', 'lead a company-wide people initiative'],
  'IT & Engineering': ['move into an engineering manager role', 'lead a high-visibility product launch'],
  'Sales & Marketing': ['hit 150% of my quarterly target', 'lead a region or a new market'],
  'Government & PSU': ['take charge of a new division or project', 'clear my next promotion step'],
  Lawyer: ['become a partner or lead counsel', 'build my independent practice'],
};

export function bhagStarters(field) {
  return [...(STARTERS_BY_FIELD[field] || []), ...GENERAL_STARTERS].slice(0, 4);
}
