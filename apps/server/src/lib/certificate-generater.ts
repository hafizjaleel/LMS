import puppeteer from 'puppeteer';
import { randomBytes } from 'node:crypto';


/**
 * Generates a unique certificate ID based on the course ID, user ID, and current timestamp.
 * The format is `CERT-<course_prefix>-<user_prefix>-<timestamp>-<random>`, where
 * `<course_prefix>` is the first 4 characters of the course ID, with non-alphanumeric
 * characters removed,
 * `<user_prefix>` is the first 4 characters of the user ID, with non-alphanumeric
 * characters removed,
 * `<timestamp>` is the current timestamp in base 36,
 * and `<random>` is 6 random hex characters.
 * @param courseId - The course ID to generate the certificate ID for.
 * @param userId - The user ID to generate the certificate ID for.
 * @returns A unique certificate ID string.
 */
export function generateCertificateId(courseId: string, userId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase(); // Base36 timestamp
  const random = randomBytes(3).toString('hex').toUpperCase(); // 6 random hex chars
  const coursePrefix = courseId.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const userPrefix = userId.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
  // Example: CERT-A1B2-C3D4-LK9X2P-4FA8B2
  return `CERT-${coursePrefix}-${userPrefix}-${timestamp}-${random}`;
}


/**
 * Generates the HTML for a certificate of completion given the course name, user name, completed at date, and certificate ID.
 * @param {object} data - The data object containing courseName, userName, completedAt, and certificateId.
 * @returns {string} - The HTML for the certificate of completion.
 */
export function generateCertificateHTML(data: {
  courseName: string;
  userName: string;
  completedAt: Date;
  certificateId: string;
}): string {
  const { courseName, userName, completedAt, certificateId } = data;
  const formattedDate = completedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Georgia', serif;
      background: white;
      margin: 0;
      padding: 0;
      width: 297mm;
      height: 210mm;
      overflow: hidden;
    }
    
    .certificate {
      width: 297mm;
      height: 210mm;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 15mm;
      position: relative;
      overflow: hidden;
    }
    
    .certificate::before {
      content: '';
      position: absolute;
      top: 10mm;
      left: 10mm;
      right: 10mm;
      bottom: 10mm;
      border: 3px solid #2c3e50;
      z-index: 1;
    }
    
    .certificate::after {
      content: '';
      position: absolute;
      top: 12mm;
      left: 12mm;
      right: 12mm;
      bottom: 12mm;
      border: 1px solid #95a5a6;
      z-index: 1;
    }
    
    .decorative-corner {
      position: absolute;
      width: 40mm;
      height: 40mm;
      z-index: 2;
    }
    
    .corner-tl {
      top: 8mm;
      left: 8mm;
      border-top: 4px solid #667eea;
      border-left: 4px solid #667eea;
    }
    
    .corner-tr {
      top: 8mm;
      right: 8mm;
      border-top: 4px solid #764ba2;
      border-right: 4px solid #764ba2;
    }
    
    .corner-bl {
      bottom: 8mm;
      left: 8mm;
      border-bottom: 4px solid #667eea;
      border-left: 4px solid #667eea;
    }
    
    .corner-br {
      bottom: 8mm;
      right: 8mm;
      border-bottom: 4px solid #764ba2;
      border-right: 4px solid #764ba2;
    }
    
    .content-wrapper {
      position: relative;
      z-index: 3;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 18mm 25mm 15mm 25mm;
    }
    
    .header {
      text-align: center;
      margin-bottom: 8mm;
    }
    
    .logo {
      width: 120px;
      height: 50px;
      margin: 0 auto 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .logo img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .title {
      font-size: 42px;
      color: #2c3e50;
      font-weight: bold;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 5px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      font-size: 16px;
      color: #7f8c8d;
      font-style: italic;
      letter-spacing: 1px;
    }
    
    .main-content {
      text-align: center;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 10mm 0;
    }
    
    .presented-to {
      font-size: 14px;
      color: #7f8c8d;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .recipient-name {
      font-size: 48px;
      color: #2c3e50;
      font-weight: bold;
      margin: 8px 0;
      position: relative;
      display: inline-block;
    }
    
    .recipient-name::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 3px;
      background: linear-gradient(90deg, transparent, #667eea, #764ba2, transparent);
    }
    
    .description {
      font-size: 15px;
      color: #2c3e50;
      line-height: 1.6;
      margin: 12px auto;
      max-width: 600px;
    }
    
    .course-name {
      font-size: 26px;
      color: #764ba2;
      font-weight: bold;
      margin: 10px 0;
      font-style: italic;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 10mm;
      padding-top: 8mm;
      border-top: 1px solid #e0e0e0;
    }
    
    .signature-block {
      text-align: center;
      flex: 1;
    }
    
    .signature-line {
      width: 150px;
      border-top: 2px solid #2c3e50;
      margin: 0 auto 5px;
    }
    
    .signature-label {
      font-size: 12px;
      color: #2c3e50;
      font-weight: bold;
      margin-bottom: 2px;
    }
    
    .signature-title {
      font-size: 11px;
      color: #7f8c8d;
      font-style: italic;
    }
    
    .meta-info {
      text-align: center;
      flex: 1;
    }
    
    .date {
      font-size: 13px;
      color: #2c3e50;
      margin-bottom: 5px;
      font-weight: 600;
    }
    
    .certificate-id {
      font-size: 11px;
      color: #7f8c8d;
      font-family: 'Courier New', monospace;
    }
    
    .seal {
      position: absolute;
      bottom: 25mm;
      right: 25mm;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      z-index: 4;
    }
    
    .seal-inner {
      width: 60px;
      height: 60px;
      border: 2px dashed white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-weight: bold;
      text-align: center;
      line-height: 1.2;
    }
    
    @media print {
      body {
        background: white;
      }
      
      .certificate {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="decorative-corner corner-tl"></div>
    <div class="decorative-corner corner-tr"></div>
    <div class="decorative-corner corner-bl"></div>
    <div class="decorative-corner corner-br"></div>
    
    <div class="content-wrapper">
      <div class="header">
        <div class="logo">
          <img src="https://media.licdn.com/dms/image/v2/D4E0BAQF_dZUadw6wQg/company-logo_200_200/B4EZouqGvXIwAI-/0/1761719381491/qubes_in_logo?e=2147483647&v=beta&t=sitsC1dPQXQUTFQp19jc30OSYCcHLTCC1LSx34l1cFE" alt="Qubes LMS Logo" />
        </div>
        <div class="title">Certificate of Completion</div>
        <div class="subtitle">of Excellence in Learning</div>
      </div>
      
      <div class="main-content">
        <div class="presented-to">This is proudly presented to</div>
        <div class="recipient-name">${userName}</div>
        
        <div class="description">
          For successfully completing the comprehensive course
        </div>
        
        <div class="course-name">"${courseName}"</div>
        
        <div class="description">
          With dedication and commitment to professional excellence
        </div>
      </div>
      
      <div class="footer">
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">Authorized Signature</div>
          <div class="signature-title">Course Instructor</div>
        </div>
        
        <div class="meta-info">
          <div class="date">${formattedDate}</div>
          <div class="certificate-id">Certificate ID: ${certificateId}</div>
        </div>
        
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">Authorized Signature</div>
          <div class="signature-title">Academic Director</div>
        </div>
      </div>
    </div>
    
    <div class="seal">
      <div class="seal-inner">
        CERTIFIED<br>AUTHENTIC
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates a PDF from the given HTML string.
 *
 * @param {string} html - The HTML string to generate a PDF from.
 * @returns {Promise<Buffer>} - A promise that resolves with the generated PDF as a Buffer.
 */
export async function generatePDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });
  
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdf = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });
  
  await browser.close();
  
  return Buffer.from(pdf);
}
