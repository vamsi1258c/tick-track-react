import ExcelJS from 'exceljs';

// Convert to Title Case
const toTitleCase = (str) => {
  if (str) {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
  return str
}

// Remove HTML Tags
const removeHtmlTags = (str) => {
  return str ? str.replace(/<\/?[^>]+(>|$)/g, '') : ''
}

// Utility function to extract fullname from objects like assignee and creator
const extractFullName = (value) => {
  if (value && value.fullname) {
    return value.fullname || ''
  }
  return value || ''
}

// Utility function for CSV export
export const exportToCSV = (data, headers, fileName) => {
  const cleanData = data.map((row) => {
    const cleanedRow = { ...row }

    // Handle assignee and creator fields
    headers.forEach((header) => {
      if (header === 'assignee' || header === 'creator') {
        cleanedRow[header] = extractFullName(cleanedRow[header]) // Extract fullname for these columns
      }
      if (cleanedRow.description) {
        cleanedRow.description = removeHtmlTags(String(cleanedRow.description))
      }
    })

    return cleanedRow
  })

  const csvContent = [
    headers.map((header) => toTitleCase(header)).join(','),
    ...cleanData.map((row) =>
      headers
        .map((header) => `"${(String(row[header]) || '').replace(/"/g, '""')}"`)
        .join(',')
    )
  ].join('\n')

  // Create a Blob object and use FileSaver for downloading the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  link.click();
};

// Utility function to export data to Excel (XLSX)
export const exportToExcel = (data, headers, fileName) => {
  const cleanData = data.map((row) => {
    const cleanedRow = { ...row }

    // Handle assignee and creator fields
    headers.forEach((header) => {
      if (header === 'assignee' || header === 'creator') {
        cleanedRow[header] = extractFullName(cleanedRow[header])
      }
      if (cleanedRow.description) {
        cleanedRow.description = removeHtmlTags(String(cleanedRow.description))
      }
    })

    return cleanedRow
  })

  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  // Add headers to the worksheet
  worksheet.addRow(headers.map(header => toTitleCase(header)));

  // Add data to the worksheet
  cleanData.forEach(row => {
    worksheet.addRow(headers.map(header => row[header] || ''));
  });

  // Set file type and download the Excel file
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.xlsx`;
    link.click();
  });
};
