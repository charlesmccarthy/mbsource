export function downloadFile(fileName: string, url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;

  // Append the anchor to the body
  document.body.appendChild(a);

  // Programmatically trigger a click on the anchor
  a.click();

  // Remove the anchor from the body
  document.body.removeChild(a);

  // Release the object URL
  URL.revokeObjectURL(url);
}
