const fetch = require('node-fetch');
async function run() {
  const sources=['NDTV Profit', 'Business Standard', 'TechCrunch India', 'Google News - Unicorn', 'Google News - Tech India', 'Google News - Funding', 'TICE News', 'Entrackr', 'Google News', 'Finshots', 'IndianStartupNews', 'The Ken', 'Morning Context', 'Entrepreneur India', 'StartupTalky', 'LiveMint', 'Moneycontrol', 'Economic Times', 'VCCircle', 'Inc42', 'YourStory', 'PTI', 'PNN'];
  const encoded = encodeURIComponent(sources.join(','));
  console.log("Encoded length:", encoded.length);
}
run();
