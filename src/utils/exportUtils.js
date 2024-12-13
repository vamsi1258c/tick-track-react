import { utils, writeFile } from 'xlsx';

// Convert to Title Case
const toTitleCase = (str) => {
  if (str) {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  return str;
};

// Remove HTML Tags
const removeHtmlTags = (str) => {
  return str ? str.replace(/<\/?[^>]+(>|$)/g, '') : '';
};

// Utility function to extract fullname from objects like assignee and creator
const extractFullName = (value) => {
  console.log(value);
  if (value && value.fullname) {
    return value.fullname || '';
  }
  return value || '';
};

// Utility function for CSV export
export const exportToCSV = (data, headers, fileName) => {
  const cleanData = data.map((row) => {
    const cleanedRow = { ...row };

    // Handle assignee and creator fields
    headers.forEach((header) => {
      if (header === 'assignee' || header === 'creator') {
        cleanedRow[header] = extractFullName(cleanedRow[header]); // Extract fullname for these columns
      }
      if (cleanedRow.description) {
        cleanedRow.description = removeHtmlTags(String(cleanedRow.description));
      }
    });

    return cleanedRow;
  });

  const csvContent = [
    headers.map((header) => toTitleCase(header)).join(','),
    ...cleanData.map((row) =>
      headers
        .map((header) => `"${(String(row[header]) || '').replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  link.click();
};

// Utility function to export data to Excel
export const exportToExcel = (data, headers, fileName) => {
  const cleanData = data.map((row) => {
    const cleanedRow = { ...row };

    // Handle assignee and creator fields
    headers.forEach((header) => {
      if (header === 'assignee' || header === 'creator') {
        cleanedRow[header] = extractFullName(cleanedRow[header]);
      }
      if (cleanedRow.description) {
        cleanedRow.description = removeHtmlTags(String(cleanedRow.description));
      }
    });

    return cleanedRow;
  });

  // Map data based on headers
  const ws_data = [
    headers,
    ...cleanData.map((row) =>
      headers.map((header) => String(row[header] || ''))
    ),
  ];

  // Convert headers to Title Case
  const titleCaseHeaders = headers.map((header) => toTitleCase(header));

  // Create a new worksheet with title-cased headers
  const ws = utils.aoa_to_sheet([titleCaseHeaders, ...ws_data.slice(1)]);

  // Create a new workbook
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Sheet 1');

  // Write to file
  writeFile(wb, `${fileName}.xlsx`);
};
