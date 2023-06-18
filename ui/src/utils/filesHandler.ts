interface FileContent {
  text: string;
  name: string;
}

type RecursiveArray<T> = T | RecursiveArray<T>[];

type EntryFiles = RecursiveArray<FileContent>

const formatError = 'Unsupported file format'

function readFile(file: File) {
  return new Promise<FileContent>((resolve, reject) => {
    const textFileExtensions = [
      'ass',
      'json',
      'md',
      'nfo',
      'patch',
      'srt',
      'toml',
      'html',
      'ts',
      'tsx',
      'js',
      'jsx',
      'vue',
      'css',
      'csv',
      'sass',
      'yaml',
    ].map(ext => `.${ext}`)
    const extension = file.name.substring(file.name.lastIndexOf('.'))

    if (file.type !== 'text/plain' && !textFileExtensions.includes(extension)) {
      resolve({
        text: '',
        name: formatError,
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      resolve({
        text: e.target?.result as string,
        name: file.name
      })
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

function readDirectory(entry: FileSystemDirectoryEntry): Promise<EntryFiles> {
  return new Promise((resolve, reject) => {
    const dirReader = entry.createReader()
    dirReader.readEntries((entries) => {
      const promises = entries.map(entry => {
        if (entry.isDirectory) {
          return readDirectory(entry as FileSystemDirectoryEntry)
        } else {
          return new Promise<EntryFiles>((resolve, reject) => {
            (entry as FileSystemFileEntry).file((file: File) => {
              readFile(file)
                .then(resolve)
                .catch(reject)
            })
          })
        }
      })

      Promise.all(promises).then((results) => {
        resolve(results.filter((result) => result !== null))
      }).catch(reject)
    })
  })
}

export function getFileContent(fileList: FileList) {
  const promises = Array.from(fileList).map(readFile)

  return Promise.all(promises).then(files => {
    const combinedContent = files.reduce((pre, { text }) => pre + text, '')
    const combinedName = files.length === 1 ? files[0].name : `${files.length} files selected`

    return {
      value: combinedContent,
      name: combinedName
    }
  })
}

export function readDataTransferItemList(list: DataTransferItemList) {
  return Array.from(list)
    .filter((item) => item.kind === 'file')
    .map((item) => {
      const entry = item.webkitGetAsEntry()

      if (!entry) return Promise.reject(new Error('Entry is null'))
      if (entry.isDirectory) {
        return readDirectory(entry as FileSystemDirectoryEntry)
      } else {
        return new Promise<FileContent>((resolve, reject) => {
          (entry as FileSystemFileEntry).file((file: File) => {
            readFile(file).then(resolve).catch(reject)
          })
        })
      }
    })
}

export function readEntryFiles(entryFiles: EntryFiles, level = 0) {
  let content = ''
  let foldersCount = 0
  let filesCount = 0

  for (const entry of Array.isArray(entryFiles) ? entryFiles : [entryFiles]) {
    if (Array.isArray(entry)) {
      const result = readEntryFiles(entry, level + 1)
      content += result.content
      foldersCount += result.title.split(', ')[0] === '0 folders' ? 0 : 1
      filesCount += Number(result.title.split(', ')[1].split(' ')[0])
    } else {
      content += entry.text
      filesCount += 1
    }
  }

  return {
    content,
    title: `${foldersCount + level} folder(s), ${filesCount} file(s)`
  }
}
