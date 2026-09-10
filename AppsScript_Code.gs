/**
 * Cover Pro Canvassing — Apps Script backend
 * ------------------------------------------
 * SETUP:
 * 1. Create a new Google Sheet. Name it "Cover Pro Canvassing Data".
 * 2. In the Sheet: Extensions -> Apps Script. Delete any starter code,
 *    paste this whole file in, save.
 * 3. Update NOTIFY_EMAIL below to your real email address.
 * 4. Click Deploy -> New deployment -> gear icon -> Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    Click Deploy, authorize when prompted (click through the "unsafe" warning
 *    -- that's normal for your own script), then copy the Web App URL.
 * 5. Paste that URL into all three HTML files where it says YOUR_SCRIPT_URL.
 * 6. Run the "setupSheets" function once manually (Run button, top toolbar,
 *    with setupSheets selected in the dropdown) to build the tabs and formulas.
 */

const NOTIFY_EMAIL = "YOUR_EMAIL@example.com"; // <-- change this

function doPost(e) {
  try {
    const data = e.parameter; // works with standard form submissions (hidden-iframe method)
    const type = data.form_type;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (type === "Door Log") {
      appendDoorLog(ss, data);
    } else if (type === "Time Clock") {
      appendTimeClock(ss, data);
    } else if (type === "New Hire Info") {
      appendNewHire(ss, data);
    }

    notifyByEmail(type, data);

    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function appendDoorLog(ss, d) {
  const sheet = ss.getSheetByName("Door Log");
  sheet.appendRow([
    new Date(),
    d["Canvasser Name"] || "",
    d["Street / Neighborhood"] || "",
    d["House Number"] || "",
    d["Outcome"] || "",
    d["First Name"] || "",
    d["Last Name"] || "",
    d["Complete Address"] || "",
    d["Phone Number"] || "",
    d["Email Address"] || "",
    d["1st Preferred Date"] || "",
    d["1st Preferred Time"] || "",
    d["2nd Preferred Date"] || "",
    d["2nd Preferred Time"] || "",
    d["Which Time Do They Prefer"] || "",
    d["Notes"] || "",
    "Pending",   // Office Status - default
    "No"         // Job Sold - default, you update this manually later
  ]);
}

function appendTimeClock(ss, d) {
  const sheet = ss.getSheetByName("Time Clock");
  sheet.appendRow([
    new Date(),
    d["Canvasser Name"] || "",
    d["Action"] || ""
  ]);
}

function appendNewHire(ss, d) {
  const sheet = ss.getSheetByName("New Hire Info");
  sheet.appendRow([
    new Date(),
    d["Full Name"] || "",
    d["Phone Number"] || "",
    d["Email Address"] || "",
    d["Physical Address"] || "",
    d["Emergency Contact Name"] || "",
    d["Emergency Contact Phone"] || "",
    d["Shirt Size"] || "",
    d["Payment App"] || "",
    d["Payment Handle"] || ""
  ]);
}

function notifyByEmail(type, d) {
  let subject = "New " + type + " Submission";
  let body = "";
  Object.keys(d).forEach(function(key) {
    if (key !== "form_type") body += key + ": " + d[key] + "\n";
  });
  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

/**
 * Run this once manually to build all tabs, headers, and the payroll tally formulas.
 * Safe to re-run -- it won't duplicate existing sheets.
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const doorLogHeaders = ["Timestamp","Canvasser Name","Street/Neighborhood","House Number","Outcome",
    "First Name","Last Name","Complete Address","Phone Number","Email Address",
    "1st Preferred Date","1st Preferred Time","2nd Preferred Date","2nd Preferred Time",
    "Which Time Preferred","Notes","Office Status","Job Sold"];
  ensureSheet(ss, "Door Log", doorLogHeaders);

  const timeClockHeaders = ["Timestamp","Canvasser Name","Action"];
  ensureSheet(ss, "Time Clock", timeClockHeaders);

  const newHireHeaders = ["Timestamp","Full Name","Phone Number","Email Address","Physical Address",
    "Emergency Contact Name","Emergency Contact Phone","Shirt Size","Payment App","Payment Handle"];
  ensureSheet(ss, "New Hire Info", newHireHeaders);

  buildPayrollTab(ss);
}

function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#17242F").setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);
}

function buildPayrollTab(ss) {
  let sheet = ss.getSheetByName("Payroll Tally");
  if (!sheet) {
    sheet = ss.insertSheet("Payroll Tally");
  }
  sheet.clear();

  sheet.getRange("A1").setValue("Payroll Tally — Auto-Calculated").setFontWeight("bold").setFontSize(14);
  sheet.getRange("A2").setValue("Type a canvasser's exact name in column A below. Everything else fills in automatically.");
  sheet.getRange("A2").setFontStyle("italic").setFontColor("#666666");

  const headers = ["Canvasser Name","Confirmed Appts (Door Log)","Appt Bonus ($20 each)",
    "Jobs Sold","Job Sold Bonus ($100 each)","Total Bonus ($)"];
  sheet.getRange(4, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(4, 1, 1, headers.length).setFontWeight("bold").setBackground("#17242F").setFontColor("#FFFFFF");

  for (let row = 5; row <= 20; row++) {
    // Confirmed appointment count for this canvasser
    sheet.getRange(row, 2).setFormula(
      `=IF($A${row}="","",COUNTIFS('Door Log'!$B:$B,$A${row},'Door Log'!$Q:$Q,"Confirmed"))`
    );
    // Appt bonus
    sheet.getRange(row, 3).setFormula(`=IF($A${row}="","",B${row}*20)`);
    // Jobs sold count
    sheet.getRange(row, 4).setFormula(
      `=IF($A${row}="","",COUNTIFS('Door Log'!$B:$B,$A${row},'Door Log'!$R:$R,"Yes"))`
    );
    // Job sold bonus
    sheet.getRange(row, 5).setFormula(`=IF($A${row}="","",D${row}*100)`);
    // Total
    sheet.getRange(row, 6).setFormula(`=IF($A${row}="","",C${row}+E${row})`);
    sheet.getRange(row, 3).setNumberFormat("$#,##0.00");
    sheet.getRange(row, 5).setNumberFormat("$#,##0.00");
    sheet.getRange(row, 6).setNumberFormat("$#,##0.00");
  }

  sheet.setColumnWidths(1, 6, 170);
}
