/**
 * Downloads a file from a given URL using the fetch API.
 *
 * @param url The URL of the file to download.
 * @param fileName The desired name for the downloaded file.
 */
export async function downloadFile(url: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`)
    }

    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = objectUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()

    // Clean up by removing the link and revoking the object URL
    document.body.removeChild(link)
    window.URL.revokeObjectURL(objectUrl)
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error)
  }
}
