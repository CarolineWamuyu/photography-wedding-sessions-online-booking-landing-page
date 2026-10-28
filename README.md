# Ever After Studio

A responsive wedding photography landing page built with semantic HTML, CSS, and vanilla JavaScript. The site uses the photographs provided in `images/`; there are no frontend package dependencies or build steps.

> **Portfolio demo:** Ever After Studio, the package names/prices, and the website copy are fictional sample content. Confirm all business details with the real photographer before publishing. The uploaded images are used as provided; confirm that you have permission to publish them.

## Run locally

Open `index.html` in a browser, or serve the project folder with VS Code Live Server. The booking form validates in the browser and posts valid enquiries to the configured Apps Script web-app endpoint in `js/script.js`.

The deployment URL is a public endpoint, not a secret. The spreadsheet ID and notification email remain private in Apps Script Script Properties.

## Google Apps Script setup

`appscript/Code.gs` includes:

- `setup()` is the one-time setup function you run manually in the Apps Script editor. It checks the settings and creates/prepares the private `Bookings` sheet.
- `doGet()` is the web-app URL health check. Apps Script runs it automatically when someone opens the `/exec` URL; you do not select or run it for setup.
- `doPost(event)` is the web-app form endpoint. Apps Script runs it automatically when the website posts an enquiry.
- `submitBooking(data)` validates the enquiry, appends it to the sheet, and sends a notification email.

### One-time Apps Script setup

1. Create or open the private Google Sheet that should store enquiries. Do not share it publicly.
2. Open the Apps Script project used by the web app. In the editor, replace its server code with the full contents of `appscript/Code.gs`, then save.
3. In Apps Script, click the **gear icon (Project Settings)** in the left sidebar. Scroll down to **Script properties**, click **Add script property** (or **Edit script properties**), then add these two rows:
   - **Property:** `SPREADSHEET_ID` — **Value:** preferably the Google Sheet ID: copy the text between `/d/` and `/edit` in the Sheet URL. For example, in `https://docs.google.com/spreadsheets/d/1AbC_example_ID_123/edit#gid=0`, the ID is `1AbC_example_ID_123`. The script also accepts the full Google Sheets URL and extracts its ID. Do not use the Apps Script project ID, deployment ID, or `/exec` URL here.
   - **Property:** `NOTIFICATION_EMAIL` — **Value:** the email inbox where you want booking notifications delivered (usually the photographer's email address).
   
   Click **Save script properties**. These values are private server-side settings; do not put them in website HTML or JavaScript, and do not share the Sheet ID or private Sheet URL publicly.
4. Return to the Apps Script editor by clicking **Editor** (`<>`) in the left sidebar. In the function dropdown beside **Run**, choose **`setup`** and click **Run**. This is the manual setup step; it creates the `Bookings` tab and header row in the configured Sheet. Approve the requested Google permissions. Check **Executions** in the left sidebar or the execution log for “Setup complete”, then open the Sheet and confirm the tab is present.
5. From the function dropdown, choose **`doGet`** and click **Run** only if you want to test the URL health check. `doGet` is a special web-app handler that Apps Script runs automatically for a browser GET request; it is not the setup function.
6. Open **Deploy → Manage deployments**, edit the web-app deployment, choose a **new version**, and deploy it. Keep execution set to the photographer/owner and choose the access policy appropriate for the public website.
7. The deployment URL is already configured as `BOOKING_ENDPOINT` in `js/script.js`. Keep that endpoint current if you create a new deployment URL. Publish the website files after updating them.
8. Open the deployment’s `/exec` URL. Its JSON response should say `"ready": true`. Then submit one controlled test enquiry from the website and verify that it adds a row to the `Bookings` tab and sends an email to `NOTIFICATION_EMAIL`. A test submission writes real data and triggers a real email, so use test details you control and remove the test row afterward if appropriate.

The website submits the form to `doPost` using a hidden response frame. Personal data is sent in the POST body, not in the URL. A successful enquiry is not a booking confirmation.

The website currently includes a mock WhatsApp/call number (`+254 700 000 000`) and placeholder Instagram, Facebook, and TikTok profile links. Replace them with the photographer's real contact number and social profile URLs in `index.html` before publishing.

### Privacy and operations

- Keep the Sheet private and limit Apps Script project/editor access to trusted maintainers.
- Script properties hold the spreadsheet ID and recipient address; never put either setting or personal enquiry data in frontend code. The deployment URL is an endpoint, not a password; the Sheet and configuration stay private.
- The notification email intentionally contains no submitted personal details. Review the private Sheet to follow up.
- Apply the photographer's retention, access, and deletion policies to enquiry data. Update the consent wording and privacy notice to meet applicable Kenyan privacy requirements before launch.
- The honeypot is only a basic spam deterrent. Add appropriate rate limiting or other abuse controls before relying on a public deployment.
- The script validates fields server-side as well as the browser. Test quotas and email delivery in the owner's account.

## Responsive browser checklist

The project includes mobile-first layouts, a keyboard-operable navigation menu, visible focus styles, reduced-motion support, lazy-loaded below-the-fold images, responsive package cards, and stacked form fields on narrow screens. No interactive viewport/browser test has been performed as part of this source setup. Check the page in browser responsive mode at:

- 360px and 390px: no horizontal scrolling; open/close the menu; tab through form fields; test the date picker, consent checkbox, and package selection.
- 768px: navigation, gallery crops, package cards, and form columns fit without clipping.
- 1024px and 1440px: check content widths, image crops, whitespace, and header alignment.
- At every width, keyboard-test focus visibility, verify the reduced-motion setting, and confirm all image paths load.
- Submit the form with missing fields and with valid demo values: errors should be shown accessibly; a valid test submission should add one row to the private Sheet and send a notification.

## Replacing the demo

Replace local photos in `images/` and update the corresponding references and alt text in `index.html`. Keep descriptive alt text for meaningful images, and use empty alt text only for decorative imagery. Replace fictional packages, prices, copy, brand details, and the consent/privacy wording with photographer-approved information.
