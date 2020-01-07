import * as ts from 'typescript';
import * as assert from 'assert';
import * as lib from './index';
import mockFs = require('mock-fs');

const root = process.cwd();

let service: ReturnType<typeof lib.createService>;

it('smoke', () => {
    assert(lib);
});

it('create service no libs', () => {
    const configFile = `${root}/test-project/tsconfig-nolibs.json`;
    service = lib.createService({ configFile });
    assert(service);
});

describe('tsconfig-files', () => {

    before(() => {
        const configFile = `${root}/test-project/tsconfig-files.json`;
        service = lib.createService({ configFile });
    });

    it('smoke create', () => {
        assert(service);
    });

    it('get source file which are not in files', () => {
        const testFile = `${root}/test-project/file.spec.ts`;
        const sourceFile = service.getSourceFile(testFile, undefined);
        assert(sourceFile);
    });

    it('typescript checker (file which is not defined in tsconfig)', () => {
        const testFile = `${root}/test-project/file.spec.ts`;
        const sourceFile = service.getSourceFile(testFile, undefined);
        const checker = service.getProgram().getTypeChecker();
        const [itstmt] = sourceFile.statements.filter(x => x.getText() === `it('example test');`);
        const itid = (itstmt as any).expression.expression;
        const symbol = checker.getSymbolAtLocation(itid);
        assert(symbol);
    });
});

describe('create service', () => {

    before(() => {
        const configFile = `${root}/test-project/tsconfig.json`;
        service = lib.createService({ configFile });
    });

    it('smoke create', () => {
        assert(service);
    });

    it('errors', () => {
        const testFile = `${root}/test-project/errors.ts`;
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile, undefined);
        assert.equal(diagnostics.length, 2);
        assert.equal(diagnostics[0].messageText, `Type '1' is not assignable to type 'string'.`);
        assert.equal(diagnostics[1].messageText, `Type '"foo"' is not assignable to type 'number'.`);
    });

    it('number', () => {
        const testFile = `${root}/test-project/number.ts`;
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile, undefined);
        assert.equal(diagnostics.length, 0);
    });

    it('built in', () => {
        const testFile = `${root}/test-project/builtin.ts`;
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile, undefined);
        assert.equal(diagnostics.length, 0);
    });

    it('types', () => {
        const testFile = `${root}/test-project/types.ts`;
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile, undefined);
        assert.equal(diagnostics.length, 0);
    });

    it('decorator', () => {
        const testFile = `${root}/test-project/decorator.ts`;
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile, undefined);
        assert.equal(diagnostics.length, 0);
    });

    it('global types', () => {
        const testFile = `${root}/test-project/global-types.ts`;
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile, undefined);
        assert.equal(diagnostics.length, 0);
    });

    it('date', () => {
        const testFile = `${root}/test-project/date.ts`;
        const sourceFile = service.getProgram().getSourceFile(testFile);
        assert(sourceFile);
        const diagnostics = service.getDiagnostics(testFile, undefined);
        assert.equal(diagnostics.length, 0);
    });

});

describe('source file of changed file', () => {

    const testFile = `${root}/test-project/amok.ts`;
    const configFile = `${root}/test-project/tsconfig-empty.json`;
    let sourceFile: ts.SourceFile;

    before(() => {
        mockFs({
            [testFile]: 'const x = 1',
            [configFile]: '{}',
        });
        service = lib.createService({ configFile });
        sourceFile = service.getProgram().getSourceFile(testFile);
    });

    after(() => {
        mockFs.restore();
    });

    it('smoke', () => {
        assert(service);
        assert(sourceFile);
    });

    it('changes should be reflected', () => {
        mockFs({ [testFile]: 'let x = 2' });
        sourceFile = service.getSourceFile(testFile, 'let x = 2');
        assert(sourceFile);
        assert.equal(sourceFile.getText(), 'let x = 2');
    });

});
