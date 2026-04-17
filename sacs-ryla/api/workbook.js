function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("workbook");

  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.session_id || "",
    data.dc_title || "",
    data.dc_context || "",
    new Date()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}