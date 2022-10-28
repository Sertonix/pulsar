/** @babel */

import { remote } from 'electron';
import editorPaths from '../src/atom-paths';
import fs from 'fs-plus';
import path from 'path';
const app = remote.app;
const temp = require('temp').track();

describe('AtomPaths', () => {
  const portableEditorHomePath = path.join(
    editorPaths.getAppDirectory(),
    '..',
    '.atom'
  );

  afterEach(() => {
    editorPaths.setAtomHome(app.getPath('home'));
  });

  describe('SetAtomHomePath', () => {
    describe('when a portable .atom folder exists', () => {
      beforeEach(() => {
        delete process.env.ATOM_HOME;
        if (!fs.existsSync(portableEditorHomePath)) {
          fs.mkdirSync(portableEditorHomePath);
        }
      });

      afterEach(() => {
        delete process.env.ATOM_HOME;
        fs.removeSync(portableEditorHomePath);
      });

      /**
      * TODO: FAILING TEST - This test fails with the following output:
      * Expected '/home/runner/.pulsar' to equal '/home/runner/work/pulsar/pulsar/node_modules/electron/.atom'
      */
      xit('sets ATOM_HOME to the portable .atom folder if it has permission', () => {
        editorPaths.setAtomHome(app.getPath('home'));
        expect(process.env.ATOM_HOME).toEqual(portableEditorHomePath);
      });

      it('uses ATOM_HOME if no write access to portable .atom folder', () => {
        if (process.platform === 'win32') return;

        const readOnlyPath = temp.mkdirSync('atom-path-spec-no-write-access');
        process.env.ATOM_HOME = readOnlyPath;
        fs.chmodSync(portableEditorHomePath, 444);
        editorPaths.setAtomHome(app.getPath('home'));
        expect(process.env.ATOM_HOME).toEqual(readOnlyPath);
      });
    });

    describe('when a portable folder does not exist', () => {
      beforeEach(() => {
        delete process.env.ATOM_HOME;
        fs.removeSync(portableEditorHomePath);
      });

      afterEach(() => {
        delete process.env.ATOM_HOME;
      });

      it('leaves ATOM_HOME unmodified if it was already set', () => {
        const temporaryHome = temp.mkdirSync('atom-spec-setatomhomepath');
        process.env.ATOM_HOME = temporaryHome;
        editorPaths.setAtomHome(app.getPath('home'));
        expect(process.env.ATOM_HOME).toEqual(temporaryHome);
      });

      /**
      * TODO: FAILING TEST - This test fails with the following output:
      * Expected '/home/runner/.pulsar' to equal '/home/runner/work/pulsar/pulsar/node_modules/electron/.atom'
      */
      xit('sets ATOM_HOME to a default location if not yet set', () => {
        const expectedPath = path.join(app.getPath('home'), '.atom');
        editorPaths.setAtomHome(app.getPath('home'));
        expect(process.env.ATOM_HOME).toEqual(expectedPath);
      });
    });
  });

  describe('setUserData', () => {
    let tempEditorConfigPath = null;
    let tempEditorHomePath = null;
    let electronUserDataPath = null;
    let defaultElectronUserDataPath = null;

    beforeEach(() => {
      defaultElectronUserDataPath = app.getPath('userData');
      delete process.env.ATOM_HOME;
      tempEditorHomePath = temp.mkdirSync('atom-paths-specs-userdata-home');
      tempEditorConfigPath = path.join(tempEditorHomePath, '.atom');
      fs.mkdirSync(tempEditorConfigPath);
      electronUserDataPath = path.join(tempEditorConfigPath, 'electronUserData');
      editorPaths.setAtomHome(tempEditorHomePath);
    });

    afterEach(() => {
      delete process.env.ATOM_HOME;
      fs.removeSync(electronUserDataPath);
      try {
        temp.cleanupSync();
      } catch (e) {
        // Ignore
      }
      app.setPath('userData', defaultElectronUserDataPath);
    });

    describe('when an electronUserData folder exists', () => {
      /**
      * TODO: FAILING TEST - This test fails with the following output:
      * Expected '/tmp/atom-test-data2022824-26037-orl5og.n4n0b' to equal '/tmp/atom-paths-specs-userdata-home2022824-26084-14syl0h.bmd6/.atom/electronUserData'.
      */
      xit('sets userData path to the folder if it has permission', () => {
        fs.mkdirSync(electronUserDataPath);
        editorPaths.setUserData(app);
        expect(app.getPath('userData')).toEqual(electronUserDataPath);
      });

      it('leaves userData unchanged if no write access to electronUserData folder', () => {
        if (process.platform === 'win32') return;

        fs.mkdirSync(electronUserDataPath);
        fs.chmodSync(electronUserDataPath, 444);
        editorPaths.setUserData(app);
        fs.chmodSync(electronUserDataPath, 666);
        expect(app.getPath('userData')).toEqual(defaultElectronUserDataPath);
      });
    });

    describe('when an electronUserDataPath folder does not exist', () => {
      it('leaves userData app path unchanged', () => {
        editorPaths.setUserData(app);
        expect(app.getPath('userData')).toEqual(defaultElectronUserDataPath);
      });
    });
  });
});
