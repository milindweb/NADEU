/**
 * nadeu.gs - NADEU public data module
 * Fetches Office Bearers from the NADEU spreadsheet (no auth required)
 */

function getOfficeBearers() {
  var ss = ss_(CONFIG.nadeuSheetId);
  var sheet = ss.getSheetByName(CONFIG.nadeu.bearersSheet);
  if (!sheet) {
    return json_({ ok: true, data: [] });
  }
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return json_({ ok: true, data: [] });

  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    result.push(row);
  }
  return json_({ ok: true, data: result });
}
