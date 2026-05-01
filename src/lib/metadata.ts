// Automated Year Generator
export const getYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1970; year--) {
    years.push(year.toString());
  }
  // Add decade ranges
  years.push('2020s', '2010s', '2000s', '90s', '80s', '70s');
  return years;
};

// Comprehensive Countries List (ISO)
// Pakistan at the top
export const COUNTRIES = [
  'Pakistan',
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway',
  'Oman',
  'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe'
];

// Major World Languages
// Urdu at the top
export const LANGUAGES = [
  'Urdu dub', 'Urdu sub',
  'English dub', 'English sub',
  'Arabic dub', 'Arabic sub',
  'Bengali dub', 'Bengali sub',
  'Chinese dub', 'Chinese sub',
  'French dub', 'French sub',
  'German dub', 'German sub',
  'Hindi dub', 'Hindi sub',
  'Indonesian dub', 'Indonesian sub',
  'Italian dub', 'Italian sub',
  'Japanese dub', 'Japanese sub',
  'Korean dub', 'Korean sub',
  'Malay dub', 'Malay sub',
  'Portuguese dub', 'Portuguese sub',
  'Punjabi dub', 'Punjabi sub',
  'Russian dub', 'Russian sub',
  'Spanish dub', 'Spanish sub',
  'Tamil dub', 'Tamil sub',
  'Telugu dub', 'Telugu sub',
  'Thai dub', 'Thai sub',
  'Turkish dub', 'Turkish sub',
  'Vietnamese dub', 'Vietnamese sub'
];

export const GENRES = [
  'Pakistani', 'Western', 'Action', 'Horror', 'Anime', 'Trending', 'Latest', 'Most Watched',
  'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 'TV Movie', 'Thriller', 'War'
];

export const REGIONS = [
  'Pakistani', 'Bollywood', 'South Indian', 'Korean', 'Chinese', 'International'
];

export const STATUSES = [
  'upcoming', 'ongoing', 'finished'
];

export const SORT_OPTIONS = ['For You', 'Hottest', 'Latest', 'A-Z'];
