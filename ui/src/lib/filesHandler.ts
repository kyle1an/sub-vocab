// https://github.com/mozilla/pdf.js/issues/10478#issuecomment-1560704162
import 'pdfjs-dist/build/pdf.worker.mjs'
import { type PDFDocumentProxy, getDocument } from 'pdfjs-dist'
import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api'

interface FileContent {
  text: string
  name: string
}

type RecursiveArray<T> = T | RecursiveArray<T>[]

type EntryFiles = RecursiveArray<FileContent>

const FORMAT_ERROR = 'Unsupported file format'

function isTextItem(obj: TextContent['items'][number]): obj is TextItem {
  // @ts-ignore TextItem/TextMarkedContent
  return Boolean(obj?.transform)
}

function formatTextContent(textContent: TextContent) {
  const lines = textContent.items.map((item) => {
    let text = ''
    if (isTextItem(item)) {
      text = item.str
      if (item.hasEOL) {
        text += '\n'
      }
    }
    return text
  })
  const bbb = lines.join(' ')
  return bbb
}

async function getDocumentText(pdf: PDFDocumentProxy) {
  const pdfTexts: string [] = []

  for (let i = 1; i < pdf.numPages; i++) {
    await pdf.getPage(i)
      .then(async (page) => {
        await page.getTextContent()
          .then((textContent) => {
            const text = formatTextContent(textContent)
            pdfTexts.push(text)
          })
      })
  }

  return pdfTexts.join(' ')
}

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
    const reader = new FileReader()

    if (file.type.startsWith('text/') || humanReadableFileExtensions.includes(extension)) {
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          resolve({
            text: result,
            name: file.name,
          })
        }
      }
      reader.readAsText(file)
    } else if (file.type === 'application/pdf') {
      reader.onload = async (e) => {
        const document = e.target?.result
        if (document instanceof ArrayBuffer) {
          const pdf = await getDocument(document).promise
          const text = await getDocumentText(pdf)
          resolve({
            text,
            name: file.name,
          })
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      resolve({
        text: '',
        name: FORMAT_ERROR,
      })
    }

    reader.onerror = reject
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
  let combinedName = `${files.length} files selected`
  if (files.length === 1) {
    const file = files[0]
    if (file) {
      combinedName = file.name
    }
  }
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
      const titles = result.title.split(', ')
      if (titles[1]) {
        filesCount += Number(titles[1].split(' ')[0])
      }
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
