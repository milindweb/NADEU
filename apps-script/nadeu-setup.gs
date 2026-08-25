/**
 * nadeu-setup.gs - Run this once in Apps Script console to populate Office Bearers
 *
 * Steps:
 * 1. Open https://script.google.com
 * 2. Open your NADEU project
 * 3. Paste this file or copy the function below
 * 4. Run: nadeuSetupBearers()
 */

function nadeuSetupBearers() {
  var ss = SpreadsheetApp.openById('1yEJvqmlTnxhqzxXsF0mTj77TbpGZUKGCTTmC5gA0ftE');
  var sheet = ss.getSheetByName('Office Bearers') || ss.insertSheet('Office Bearers');

  var headers = ['SL NO.', 'NAME & DESIGN / T.NO.', 'RANK', 'UNIT'];
  var data = [
    [1, 'SHRI PRAVIN INGALE, HSK-11, 14842', 'PRESIDENT', 'NAD (K)'],
    [2, 'SHRI NEERAJ KUMAR, T/MATE, 19447', 'WORKING PRESIDENT', 'NAD (K)'],
    [3, 'SHRI SACHIN R MISAL, T/MATE, 18280', 'VICE PRESIDENT', 'NAD (K)'],
    [4, 'SHRI GT KAMALAKAR, SK, 13354', 'VICE PRESIDENT', 'NAD (K)'],
    [5, 'SHRI VIKAS PUNIA, T/MATE, 62658', 'VICE PRESIDENT', 'NAD (T)'],
    [6, 'SMT. NILAKSHI S BARDE, UDC', 'GENERAL SECRETARY', 'NAD (MB)'],
    [7, 'SHRI MANOJ S SAKPAL, (HSK-11) 13335R', 'JT. GENERAL SECRETARY', 'NAD (K)'],
    [8, 'SHRI SURESH TUDDU, 62663', 'SECRETARY', 'NAD (T)'],
    [9, 'SHRI SUNNY SHERAWAT, T/MATE, 62778', 'SECRETARY', 'NAD (K)'],
    [10, 'SHRI RL BIRARE, T/MATE, 18216H', 'SECRETARY', 'NAD (MB)'],
    [11, 'SHRI CV PATIL, FT. ELEC., 11279', 'ORGANISING SECRETARY', 'NAD (K)'],
    [12, 'SHRI GIRISH P MHATRE, T/MATE, 14833', 'ORGANISING SECRETARY', 'NAD (K)'],
    [13, 'SHRI MILIND H THALI, T/MATE, 18222', 'ORGANISING SECRETARY', 'NAD (K)'],
    [14, 'SHRI ANKIT, T/MATE, 62431', 'ORGANISING SECRETARY', 'NAD (K)'],
    [15, 'SHRI DINESH K PATIL, T/MATE, 18208', 'ORGANISING SECRETARY', 'NAD (K)'],
    [16, 'SHRI SANDESH N MHATRE, SKL, 14870', 'TREASURER', 'NAD (K)'],
    [17, 'SHRI MUKESH MHATRE, SKL, 10854', 'ASST. TREASURER', 'NAD (K)'],
    [18, 'SHRI ASHISH KUMAR, 62636', 'MANAGING COMMITTEE', 'NAD (T)'],
    [19, 'SHRI VIPIN KUMAR, T/MATE, 62447', 'MANAGING COMMITTEE', 'NAD (K)'],
    [20, 'SHRI CY THAKUR, HSK-II, 10935', 'MANAGING COMMITTEE', 'NAD (K)'],
    [21, 'SHRI ANKIT CHAUOHARI, T/MATE, 62660', 'MANAGING COMMITTEE', 'NAD (T)'],
    [22, 'SHRI ANUJ SHUKLA, SK, 62771', 'MANAGING COMMITTEE', 'NAD (K)'],
    [23, 'SHRI SD PATIL, FED', 'MANAGING COMMITTEE', 'NAD (K)'],
    [24, 'SHRI DEEPAK, T/MATE, 62622', 'MANAGING COMMITTEE', 'NAD (K)'],
    [25, 'SMT. SHILPA V THALI, 18075', 'MANAGING COMMITTEE', 'NAD (K)'],
    [26, 'SHRI DP PAGARE, 13548', 'MANAGING COMMITTEE', 'NAD (K)'],
    [27, 'SHRI IB MALI, FT. ELEC, 13545', 'MANAGING COMMITTEE', 'NAD (K)'],
    [28, 'SHRI ROHIDAS VEDE, T/MATE', 'MANAGING COMMITTEE', 'NAD (MB)'],
    [29, 'SHRI MAHESH Y PATIL, T/MATE, 13903', 'MANAGING COMMITTEE', 'NAD (K)'],
    [30, 'SHRI AMIT KUMAR, T/MATE, 62763', 'MANAGING COMMITTEE', 'NAD (T)'],
    [31, 'SHRI ASHOK POTE, T/MATE, 18215', 'MANAGING COMMITTEE', 'NAD (K)'],
    [32, 'SHRI RAVI VERMA, 17484', 'MANAGING COMMITTEE', 'NAD (K)'],
    [33, 'SHRI KP TAUSALKAR, SKL, 52965', 'MANAGING COMMITTEE', 'NAD (K)'],
    [34, 'SHRI ML KHAIRNAR, HSK-II 18675', 'MANAGING COMMITTEE', 'NAD (K)'],
    [35, 'SHRI MAYUR G PATIL, T/MATE, 13904', 'MANAGING COMMITTEE', 'NAD (K)'],
    [36, 'SHRI YOGESH PATIL, T/MATE, 18110', 'MANAGING COMMITTEE', 'NAD (K)'],
    [37, 'SHRI MANJEET KUMAR, 62656', 'MANAGING COMMITTEE', 'NAD (T)'],
    [38, 'SHRI BABLU KUMAR, 62657', 'MANAGING COMMITTEE', 'NAD (T)'],
    [39, 'SHRI SUMEET KUMAR, 62637', 'MANAGING COMMITTEE', 'NAD (T)'],
    [40, 'SHRI SATISH KUMAR, 62627', 'MANAGING COMMITTEE', 'NAD (T)'],
    [41, 'SHRI RAKESH KUMAR, FED', 'MANAGING COMMITTEE', 'NAD (K)'],
    [42, 'SHRI TEPAL CHOPRA, T/MATE', 'MANAGING COMMITTEE', 'NAD (K)'],
    [43, 'SHRI RAVIKANT GAIKWAD', 'MANAGING COMMITTEE', 'NAD (K)']
  ];

  // Clear existing data
  sheet.clear();

  // Set headers
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1a3a5f');
  headerRange.setFontColor('white');

  // Set data
  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, headers.length).setValues(data);
  }

  // Auto-fit columns
  sheet.autoResizeColumns(1, headers.length);

  Logger.log('Office Bearers populated: ' + data.length + ' records');
  return 'Done! ' + data.length + ' office bearers added to Office Bearers tab.';
}
