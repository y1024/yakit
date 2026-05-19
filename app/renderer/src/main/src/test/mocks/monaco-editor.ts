const disposable = {
  dispose: () => {},
}

const methodNamesToObject = (names: string[]) => Object.fromEntries(names.map((name) => [name, () => disposable]))

const createNoop = (result: unknown = disposable) => {
  const noop = () => result

  return new Proxy(noop, {
    get(target, prop) {
      if (prop === 'dispose') return disposable.dispose
      if (prop === Symbol.iterator) {
        return function* iterator() {}
      }
      return Reflect.get(target, prop) || createNoop()
    },
    apply() {
      return result
    },
  })
}

const withFallback = <T extends object>(value: T): T =>
  new Proxy(value, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver)
      }

      const noop = createNoop()
      Reflect.set(target, prop, noop)
      return noop
    },
  })

export class Position {
  lineNumber: number
  column: number

  constructor(lineNumber: number, column: number) {
    this.lineNumber = lineNumber
    this.column = column
  }
}

export class Range {
  startLineNumber: number
  startColumn: number
  endLineNumber: number
  endColumn: number

  constructor(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) {
    this.startLineNumber = startLineNumber
    this.startColumn = startColumn
    this.endLineNumber = endLineNumber
    this.endColumn = endColumn
  }
}

export class Selection extends Range {}

export const editor = withFallback({
  defineTheme: () => {},
  setTheme: () => {},
  create: () => withFallback({ dispose: () => {}, getModel: () => null }),
  createModel: () => withFallback({ dispose: () => {}, getValue: () => '', setValue: () => {} }),
  getModelMarkers: () => [],
  setModelMarkers: () => {},
  onDidCreateModel: () => disposable,
  onDidChangeMarkers: () => disposable,
  EditorOption: {
    lineHeight: 0,
  },
  MouseTargetType: {
    CONTENT_TEXT: 1,
    GUTTER_GLYPH_MARGIN: 2,
  },
  EndOfLinePreference: {
    LF: 1,
    CRLF: 2,
  },
  DefaultEndOfLine: {
    LF: 1,
    CRLF: 2,
  },
})

export const languages = withFallback({
  ...methodNamesToObject([
    'register',
    'setMonarchTokensProvider',
    'setLanguageConfiguration',
    'registerCompletionItemProvider',
    'registerHoverProvider',
    'registerSignatureHelpProvider',
    'registerDocumentFormattingEditProvider',
    'registerDocumentRangeFormattingEditProvider',
    'registerReferenceProvider',
    'registerRenameProvider',
    'registerDefinitionProvider',
    'registerDocumentSymbolProvider',
    'registerCodeLensProvider',
    'registerLinkProvider',
    'registerInlineCompletionsProvider',
  ]),
  CompletionItemInsertTextRule: {
    InsertAsSnippet: 4,
  },
  CompletionItemKind: {
    Keyword: 17,
    Function: 1,
    Variable: 4,
    Class: 5,
    Field: 3,
    Snippet: 27,
  },
  DocumentHighlightKind: {
    Read: 1,
    Write: 2,
  },
  IndentAction: {
    None: 0,
    Indent: 1,
    IndentOutdent: 2,
    Outdent: 3,
  },
  SymbolKind: {
    Function: 11,
    Variable: 12,
    Class: 5,
  },
})

export const KeyCode = withFallback({})
export const KeyMod = {
  CtrlCmd: 1 << 11,
  Shift: 1 << 10,
  Alt: 1 << 9,
}
export const MarkerSeverity = {
  Hint: 1,
  Info: 2,
  Warning: 4,
  Error: 8,
}
export const MarkerTag = {
  Unnecessary: 1,
  Deprecated: 2,
}
export const CancellationToken = withFallback({
  None: {
    isCancellationRequested: false,
    onCancellationRequested: () => disposable,
  },
})

const monaco = withFallback({
  editor,
  languages,
  KeyCode,
  KeyMod,
  MarkerSeverity,
  MarkerTag,
  Position,
  Range,
  Selection,
  CancellationToken,
})

export default monaco
