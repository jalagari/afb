export const uploadFile = async (fileInput, fileUploadUrl) => {
    // Currently supporting single file upload
    if(fileInput && fileInput?.files?.length > 0 && fileUploadUrl) {
      let formData = new FormData();  
      formData.append('file', fileInput.files[0]);
      let init = {
        method: 'POST',
        body: formData
      }
      let response = await fetch(fileUploadUrl, init);
      let result = await response.text();
      fileInput.dataset.value = result;
      return response.ok
    }
  }