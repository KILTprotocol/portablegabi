import * as ts from 'typescript';

export function getSourceFile(program: ts.Program, fileName: string, sourceText?: string): ts.SourceFile {
    if (program !== undefined) {
        const sourceFile = program.getSourceFile(fileName);
        if (sourceFile) {
            return sourceFile;
        }
    }
    if (sourceText === undefined) {
        throw new Error(`Invalid source file: ${fileName}`);
    }
    return ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.ES5, true);
}
