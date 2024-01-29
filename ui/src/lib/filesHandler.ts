interface FileContent {
  text: string
  name: string
}

type RecursiveArray<T> = T | RecursiveArray<T>[]

type EntryFiles = RecursiveArray<FileContent>

const FORMAT_ERROR = 'Unsupported file format'

function readFile(file: File) {
  return new Promise<FileContent>((resolve, reject) => {
    const humanReadableFileExtensions: `.${string}`[] = [
      // General Text-Based Formats
      '.csv', '.rtf', '.tsv', '.txt',

      // Markup, Web, Scripting, Programming, Template and View Languages
      '.c', '.cjs', '.cpp', '.css', '.cxx', '.ejs', '.go', '.handlebars', '.hbs', '.hpp', '.htm', '.html', '.hxx', '.java', '.js', '.json', '.jsx', '.lua', '.md',
      '.php', '.pl', '.pug', '.py', '.rb', '.sh', '.rs', '.rss', '.sass', '.scss', '.sql', '.svelte', '.swift', '.ts', '.tsx', '.vue', '.yaml', '.yml', '.xhtml', '.xml',

      // Configuration and Data Files
      '.ini', '.conf', '.cfg', '.toml', '.ovpn', '.properties', '.env',

      // Documentation and Publishing
      '.tex', '.adoc', '.asciidoc', '.rst', '.bib',

      // Development and Build Related
      '.dockerfile', '.gradle', '.gitignore', '.makefile', '.pom.xml',

      // Miscellaneous
      '.ass', '.bat', '.log', '.nfo', '.patch', '.ps1', '.srt',
    ]
    const extension = file.name.substring(file.name.lastIndexOf('.'))

    if (file.type === 'text/plain' || humanReadableFileExtensions.includes(extension)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve({
          text: e.target?.result as string,
          name: file.name,
        })
      }
      reader.onerror = reject
      reader.readAsText(file)
    } else {
      resolve({
        text: '',
        name: FORMAT_ERROR,
      })
    }
  })
}

function readDirectory(systemDirectoryEntry: FileSystemDirectoryEntry): Promise<EntryFiles> {
  return new Promise((resolve, reject) => {
    const dirReader = systemDirectoryEntry.createReader()
    dirReader.readEntries((entries) => {
      const promises = entries.map((systemEntry) => {
        if (systemEntry.isDirectory) {
          return readDirectory(systemEntry as FileSystemDirectoryEntry)
        }
        return new Promise<EntryFiles>((resolve, reject) => {
          ;(systemEntry as FileSystemFileEntry).file((file: File) => {
            readFile(file)
              .then(resolve)
              .catch(reject)
          })
        })
      })

      Promise.all(promises)
        .then((results) => {
          resolve(results.filter((result) => result !== null))
        })
        .catch(reject)
    })
  })
}

export async function getFileContent(fileList: FileList) {
  const promises = Array.from(fileList).map(readFile)

  const files = await Promise.all(promises)
  const combinedContent = files.reduce((pre, { text }) => pre + text, '')
  const combinedName = files.length === 1 ? files[0].name : `${files.length} files selected`
  return {
    value: combinedContent,
    name: combinedName,
  }
}

export function readDataTransferItemList(list: DataTransferItemList) {
  return Array.from(list)
    .filter((item) => item.kind === 'file')
    .map((item) => {
      const entry = item.webkitGetAsEntry()

      if (!entry) return Promise.reject(new Error('Entry is null'))
      if (entry.isDirectory) {
        return readDirectory(entry as FileSystemDirectoryEntry)
      }
      return new Promise<FileContent>((resolve, reject) => {
        ;(entry as FileSystemFileEntry).file((file: File) => {
          readFile(file).then(resolve).catch(reject)
        })
      })
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
    title: `${foldersCount + level} folder(s), ${filesCount} file(s)`,
  }
}
