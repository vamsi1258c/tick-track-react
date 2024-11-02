import api from './api';

// Fetch all attachments for a specific ticket
export const fetchAttachments = async (ticketId) => {
  try {
    const response = await api.get(`/ticket/${ticketId}/attachments`);
    return response;
  } catch (error) {
    console.log('Error fetching attachments:', error);
    throw error.response?.data || 'An error occurred while fetching attachments';
  }
};

// Fetch a single attachment by ID
export const fetchAttachment = async (ticketId, attachmentId) => {
  try {
    const response = await api.get(`/ticket/${ticketId}/attachments/${attachmentId}`);
    return response;
  } catch (error) {
    console.log('Error fetching attachment:', error);
    throw error.response?.data || 'An error occurred while fetching the attachment';
  }
};


export const uploadAttachment = async (ticketId, attachment) => {
  // Prepare the JSON data
  const attachmentData = {
    ticket_id: ticketId,
    filename: attachment.name,
  };

  const formData = new FormData();
  formData.append('file', attachment); // Append the file
  formData.append('ticket_id', ticketId); // Append the ticket ID

  // Prepare the headers for JSON request
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    // Send JSON data first to create a record in the backend
    const response = await api.post(`/ticket/${ticketId}/attachments`, attachmentData, config);

    // After getting the attachment_id from response, upload the file
    const attachmentId = response.data.id; // Assuming the response contains the attachment ID

    // Now upload the file separately
    const fileUploadResponse = await api.post(`/ticket/${ticketId}/attachments/${attachmentId}/upload`, formData, {
      headers: {
        'Content-Type': attachment.type, // Set file type as content type
      },
    });

    return fileUploadResponse.data; // Return the file upload response
  } catch (error) {
    console.log('Error uploading attachment:', error);
    throw error.response?.data || 'An error occurred while uploading the attachment';
  }
};

// Update an existing attachment
export const updateAttachment = async (ticketId, attachmentId, attachmentData) => {
  try {
    const response = await api.put(`/ticket/${ticketId}/attachments/${attachmentId}`, attachmentData);
    return response;
  } catch (error) {
    console.log('Error updating attachment:', error);
    throw error.response?.data || 'An error occurred while updating the attachment';
  }
};

// Delete an attachment by ID
export const deleteAttachment = async (ticketId, attachmentId) => {
  try {
    const response = await api.delete(`/ticket/${ticketId}/attachment/${attachmentId}`);
    return response;
  } catch (error) {
    console.log('Error deleting attachment:', error);
    throw error.response?.data || 'An error occurred while deleting the attachment';
  }
};

export const downloadAttachment = async (ticketId, attachmentId) => {
  try {
    const response = await api.get(`/ticket/${ticketId}/attachments/${attachmentId}/download`, {
      responseType: 'blob', // Important for handling binary data
    });

    // Retrieve the filename from the Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '').trim() // Extract the filename
      : `attachment_${attachmentId}`; // Fallback filename

    // Get the content type from the response headers
    const contentType = response.headers['content-type'];

    // Determine the file extension based on content type
    let fileExtension = '';
    if (contentType) {
      switch (contentType) {
        case 'application/pdf':
          fileExtension = 'pdf';
          break;
        case 'text/plain':
          fileExtension = 'txt';
          break;
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          fileExtension = 'xlsx';
          break;
        case 'application/vnd.ms-excel':
          fileExtension = 'xls';
          break;

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': // .docx
          fileExtension = 'docx';
          break;
        case 'application/msword': // .doc
          fileExtension = 'doc';
          break;
        
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation': // .pptx
          fileExtension = 'pptx';
          break;
      
        case 'application/vnd.ms-powerpoint': // .ppt
          fileExtension = 'ppt';
          break;

        case 'image/jpeg':
          fileExtension = 'jpg'; // or 'jpeg'
          break;
        case 'image/png':
          fileExtension = 'png';
          break;
        case 'image/gif':
          fileExtension = 'gif';
          break;
        case 'image/webp':
          fileExtension = 'webp';
          break;
        case 'image/svg+xml':
          fileExtension = 'svg';
          break;
        case 'image/bmp':
          fileExtension = 'bmp';
          break;
        // Add more cases as needed for different file types
        default:
          fileExtension = 'bin'; // Default extension if unknown
      }
    }

    // Append the file extension to the filename if it doesn't already have one
    const finalFilename = filename.endsWith(`.${fileExtension}`) ? filename : `${filename}.${fileExtension}`;

    // Create a URL for the file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', finalFilename);  // Use the retrieved filename with the correct extension
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error downloading attachment:", error);
    throw error;
  }
};




