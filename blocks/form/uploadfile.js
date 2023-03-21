export default async function uploadFile(fileInput, fileUploadUrl) {
  // Currently supporting single file upload
  if (fileInput && fileInput?.files?.length > 0 && fileUploadUrl) {
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    const init = {
      method: 'POST',
      body: formData,
    };
    const response = await fetch(fileUploadUrl, init);
    const result = await response.text();
    fileInput.dataset.value = result;
    return response.ok;
  }
  return false;
}
